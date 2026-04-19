import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { sendEmail, listEmails } from '../tools/emailTools';
import { createCalendarEvent, listUpcomingEvents, getTodaySchedule } from '../tools/calendarTools';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const tools: any = [
  {
    functionDeclarations: [
      {
        name: 'send_email',
        description: 'Send an email to a specified recipient',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            to:      { type: SchemaType.STRING, description: 'Recipient email address' },
            subject: { type: SchemaType.STRING, description: 'Email subject line' },
            body:    { type: SchemaType.STRING, description: 'Email body content' }
          },
          required: ['to', 'subject', 'body']
        }
      },
      {
        name: 'list_emails',
        description: 'List recent emails from inbox',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            max_results: { type: SchemaType.NUMBER, description: 'Max emails to retrieve (default 5)' }
          }
        }
      },
      {
        name: 'create_calendar_event',
        description: 'Create a new calendar event',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            title:          { type: SchemaType.STRING, description: 'Event title' },
            description:    { type: SchemaType.STRING, description: 'Event description' },
            start_datetime: { type: SchemaType.STRING, description: 'Start datetime in ISO 8601 format' },
            end_datetime:   { type: SchemaType.STRING, description: 'End datetime in ISO 8601 format' },
            attendees: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: 'List of attendee email addresses'
            }
          },
          required: ['title', 'start_datetime', 'end_datetime']
        }
      },
      {
        name: 'list_upcoming_events',
        description: 'List upcoming calendar events',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            max_results: { type: SchemaType.NUMBER, description: 'Max events to retrieve (default 10)' }
          }
        }
      },
      {
        name: 'get_today_schedule',
        description: "Get today's schedule and events",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {}
        }
      }
    ]
  }
];

// Same executor function — unchanged
async function executeTool(toolName: string, toolInput: any, tokens: any) {
  switch (toolName) {
    case 'send_email':
      return await sendEmail(tokens, toolInput.to, toolInput.subject, toolInput.body);
    case 'list_emails':
      return await listEmails(tokens, toolInput.max_results || 5);
    case 'create_calendar_event':
      return await createCalendarEvent(
        tokens,
        toolInput.title,
        toolInput.description || '',
        toolInput.start_datetime,
        toolInput.end_datetime,
        toolInput.attendees || []
      );
    case 'list_upcoming_events':
      return await listUpcomingEvents(tokens, toolInput.max_results || 10);
    case 'get_today_schedule':
      return await getTodaySchedule(tokens);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

router.post('/chat', async (req: Request, res: Response) => {
  const session = req.session as any;
  if (!session.tokens) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { message, history = [] } = req.body;

  const systemPrompt = `You are a personal productivity assistant with access to Gmail and Google Calendar.
You help users manage their emails and schedule through natural language.
Current date/time: ${new Date().toISOString()}
User timezone: Asia/Karachi (PKT, UTC+5)

When users ask to send emails, create events, or check their schedule, use the appropriate tools.
Be concise and confirm what action you took after using a tool.
For relative dates like "tomorrow" or "next Monday", calculate from the current date above.`;

  try {
    // Initialize model with tools attached
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
      tools
    });

    // Convert stored history format → Gemini's format
    // Gemini uses 'model' instead of 'assistant', and 'parts' instead of 'content'
    const geminiHistory = history.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Start a chat session with history
    const chat = model.startChat({ history: geminiHistory });

    // Send the new message
    let result = await chat.sendMessage(message);
    let response = result.response;

    const toolResults: any[] = [];

    // Agentic loop — same concept as Anthropic version
    // Gemini signals tool calls via functionCalls() on the response
    while (response.functionCalls() && response.functionCalls()!.length > 0) {
      const calls = response.functionCalls()!;
      const functionResponseParts = [];

      for (const call of calls) {
        try {
          const toolResult = await executeTool(call.name, call.args, session.tokens);
          toolResults.push({ tool: call.name, result: toolResult });

          functionResponseParts.push({
            functionResponse: {
              name: call.name,
              response: { result: toolResult }
            }
          });
        } catch (err: any) {
          functionResponseParts.push({
            functionResponse: {
              name: call.name,
              response: { error: err.message }
            }
          });
        }
      }

      // Send all tool results back in one go, get next response
      result = await chat.sendMessage(functionResponseParts);
      response = result.response;
    }

    const replyText = response.text();

    res.json({
      reply: replyText,
      toolsUsed: toolResults,
      updatedHistory: [
        ...history,
        { role: 'user',      content: message },
        { role: 'assistant', content: replyText }
      ]
    });

  } catch (error: any) {
    console.error('Gemini agent error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;