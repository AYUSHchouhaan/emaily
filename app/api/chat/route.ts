import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { startChatSession } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { message, emails, history } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build context from emails
    const emailContext = emails && emails.length > 0
      ? `\n\nUser's Email Context:\n${emails.map((email: any, idx: number) => 
          `Email ${idx + 1}:
- Subject: ${email.subject || 'No subject'}
- From: ${email.from || 'Unknown'}
- Date: ${email.date || 'Unknown'}
- Snippet: ${email.snippet || ''}
- Labels: ${email.labels?.join(', ') || 'None'}`
        ).join('\n\n')}`
      : '';

    const systemPrompt = `You are an intelligent email assistant. You have access to the user's email history and can help them understand, organize, and manage their emails.

Keep your responses concise, friendly, and helpful. Use markdown formatting for better readability.${emailContext}

User Question: ${message}`;

    const chat = await startChatSession({
      temperature: 0.7,
      maxOutputTokens: 800,
    }, history);

    const result = await chat.sendMessage(systemPrompt);
    
    let fullResponse = '';
    for await (const chunk of result.stream) {
      fullResponse += chunk.text();
    }

    return NextResponse.json({ 
      response: fullResponse,
      success: true
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
