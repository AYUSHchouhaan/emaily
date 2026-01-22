import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accessToken = (session.user as any).accessToken;
  
  if (!accessToken) {
    return NextResponse.json({ 
      error: 'No access token. Please sign in with Google.' 
    }, { status: 403 });
  }

  try {
    // Fetch messages from Gmail API - increased to 100 messages
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=100',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Gmail API error:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch messages from Gmail',
        details: error 
      }, { status: response.status });
    }

    const data = await response.json();
    const messageIds = data.messages || [];

    // Fetch full details for each message (in parallel, fetch up to 100)
      const messageDetails = await Promise.all(
      messageIds.slice(0, 100).map(async (msg: { id: string }) => {
        const msgResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
        
        if (!msgResponse.ok) return null;
        return msgResponse.json();
      })
    );

    // Extract relevant email data
    const emails = messageDetails
      // .filter(msg => msg !== null)
      .map((msg: any) => {
        const headers = msg.payload?.headers || [];
        const getHeader = (name: string) => 
          headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

        return {
          id: msg.id,
          threadId: msg.threadId,
          snippet: msg.snippet,
          from: getHeader('From'),
          to: getHeader('To'),
          subject: getHeader('Subject'),
          date: getHeader('Date'),
          internalDate: msg.internalDate,
        };
      });

    return NextResponse.json({ 
      emails,
      count: emails.length 
    });

  } catch (error) {
    console.error('Error fetching Gmail messages:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
