import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { rulesQueries, userQueries } from '@/db/query';
import { batchAnalyzeEmails } from '@/lib/ai';

// POST - Analyze emails and apply labels based on rules
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await userQueries.getUserByEmail(session.user.email);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { emails } = body;

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json({ 
        error: 'Invalid emails data' 
      }, { status: 400 });
    }

    // Get active rules for the user
    const rules = await rulesQueries.getActiveRulesByUser(user.id);

    if (rules.length === 0) {
      // No rules, return emails without labels
      return NextResponse.json({ 
        labeledEmails: emails.map(email => ({ ...email, labels: [] })),
        analyzed: 0,
        total: emails.length,
      });
    }

    // Batch analyze all emails in a single AI call
    const emailsForAnalysis = emails.map(email => ({
      id: email.id,
      subject: email.subject || 'No subject',
      from: email.from || 'Unknown',
      snippet: email.snippet || '',
    }));

    const rulesForAnalysis = rules.map(rule => ({
      name: rule.name,
      condition: rule.condition,
      label: rule.label,
    }));

    try {
      const analyzed = await batchAnalyzeEmails(emailsForAnalysis, rulesForAnalysis);

      // Create a map of email ID to labels
      const labelMap = new Map(
        analyzed.map((item: any) => [item.emailId, item.labels || []])
      );

      // Merge labels back into emails
      const labeledEmails = emails.map(email => ({
        ...email,
        labels: labelMap.get(email.id) || [],
      }));

      return NextResponse.json({ 
        labeledEmails,
        analyzed: emails.length,
        total: emails.length,
      });
    } catch (error: any) {
      console.error('Error in batch analysis:', error);
      throw error;
    }

  } catch (error) {
    console.error('Error analyzing emails:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze emails' 
    }, { status: 500 });
  }
}
