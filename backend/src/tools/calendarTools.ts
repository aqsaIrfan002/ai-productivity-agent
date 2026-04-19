import { getCalendarClient } from '../services/googleClient';

export async function createCalendarEvent(
  tokens: any,
  title: string,
  description: string,
  startDateTime: string,
  endDateTime: string,
  attendees: string[] = []
) {
  const calendar = getCalendarClient(tokens);

  const event = {
    summary: title,
    description,
    start: { dateTime: startDateTime, timeZone: 'Asia/Karachi' },
    end: { dateTime: endDateTime, timeZone: 'Asia/Karachi' },
    attendees: attendees.map(email => ({ email })),
  };

  const result = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    sendUpdates: attendees.length > 0 ? 'all' : 'none'
  });

  return { success: true, eventId: result.data.id, link: result.data.htmlLink };
}

export async function listUpcomingEvents(tokens: any, maxResults: number = 10) {
  const calendar = getCalendarClient(tokens);
  
  const now = new Date().toISOString();
  const result = await calendar.events.list({
    calendarId: 'primary',
    timeMin: now,
    maxResults,
    singleEvents: true,
    orderBy: 'startTime'
  });

  return result.data.items?.map(event => ({
    id: event.id,
    title: event.summary,
    description: event.description,
    start: event.start?.dateTime || event.start?.date,
    end: event.end?.dateTime || event.end?.date,
    location: event.location,
    attendees: event.attendees?.map(a => a.email) || []
  })) || [];
}

export async function getTodaySchedule(tokens: any) {
  const calendar = getCalendarClient(tokens);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = await calendar.events.list({
    calendarId: 'primary',
    timeMin: today.toISOString(),
    timeMax: tomorrow.toISOString(),
    singleEvents: true,
    orderBy: 'startTime'
  });

  return result.data.items?.map(event => ({
    id: event.id,
    title: event.summary,
    start: event.start?.dateTime || event.start?.date,
    end: event.end?.dateTime || event.end?.date,
  })) || [];
}