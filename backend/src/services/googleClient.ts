import { google } from 'googleapis';
import { oauth2Client } from '../routes/auth';

export function getAuthenticatedClient(tokens: any) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  client.setCredentials(tokens);
  return client;
}

export function getGmailClient(tokens: any) {
  const auth = getAuthenticatedClient(tokens);
  return google.gmail({ version: 'v1', auth });
}

export function getCalendarClient(tokens: any) {
  const auth = getAuthenticatedClient(tokens);
  return google.calendar({ version: 'v3', auth });
}