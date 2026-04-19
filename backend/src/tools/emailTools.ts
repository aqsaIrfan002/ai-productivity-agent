import { getGmailClient } from '../services/googleClient';

export async function sendEmail(tokens: any, to: string, subject: string, body: string) {
  const gmail = getGmailClient(tokens);
  
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    body
  ].join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage }
  });

  return { success: true, messageId: result.data.id };
}

export async function listEmails(tokens: any, maxResults: number = 5) {
  const gmail = getGmailClient(tokens);
  
  const list = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    labelIds: ['INBOX']
  });

  if (!list.data.messages) return [];

  const emails = await Promise.all(
    list.data.messages.map(async (msg) => {
      const full = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From', 'Date']
      });
      
      const headers = full.data.payload?.headers || [];
      const get = (name: string) => headers.find(h => h.name === name)?.value || '';
      
      return {
        id: msg.id,
        subject: get('Subject'),
        from: get('From'),
        date: get('Date'),
        snippet: full.data.snippet
      };
    })
  );

  return emails;
}