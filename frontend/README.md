# Otto — AI Productivity Agent

Otto is a personal productivity agent that takes natural language input and can send emails via Gmail API, create calendar events, and summarize your schedule. The tech stack used in ths includes a Next.js frontend, Node.js backend, Gemini API, Gmail and Google Calendar APIs. In short, it is a natural language interface for Gmail and Google Calendar, powered by Gemini.

## Features
- **Send emails** — "Email sarah@work.com about the 3pm meeting tomorrow"
- **Create events** — "Schedule a team standup every Monday at 10am"
- **Schedule summary** — "What's on my calendar this week?"
- **Inbox view** — Live Gmail inbox in the dashboard

## Stack
- **Frontend**: Next.js 14, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **AI**: Gemini 2.5 Flash
- **APIs**: Gmail API, Google Calendar API, Google OAuth2

## Setup

### 1. Google Cloud
1. Create project at console.cloud.google.com
2. Enable Gmail API + Calendar API
3. Create OAuth 2.0 credentials (Web app)
4. Add redirect URI: `http://localhost:5000/auth/google/callback`

### 2. Environment
Copy `.env.example` to `.env` in both `/frontend` and `/backend`, fill in your keys.

### 3. Run
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

Visit `http://localhost:3000`, connect your Google account, and start chatting.

## Architecture
Claude receives the user's natural language input, decides which tool to call (send_email, create_event, etc.), executes the tool against Google APIs, and returns a natural language confirmation.

## Example Prompts
- "Send a meeting recap to the team about today's sprint review"
- "Block off Friday afternoon for deep work"
- "Am I free at 3pm tomorrow?"
- "What meetings do I have next week?"