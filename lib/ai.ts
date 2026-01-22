import {
  GoogleGenerativeAI,
} from '@google/generative-ai';

export async function initializeAI() {
  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  
  const config = {
    temperature: 0.7,
    maxOutputTokens: 1000,
  };
  
  const model = 'gemini-2.5-flash';
  
  return { ai, config, model };
}

export const startChatSession = async (generationConfig?: any, history?: any[]) => {
  const { ai, model } = await initializeAI();
  const genModel = ai.getGenerativeModel({ model });

  return {
    sendMessage: async (message: string) => {
      const contents = [
        ...(history || []),
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ];
      
      return await genModel.generateContentStream({
        contents,
        generationConfig,
      });
    }
  };
};

// Export individual components for direct use
export const defaultConfig = {
  temperature: 0.7,
  maxOutputTokens: 1000,
};

export const defaultModel = 'gemini-pro';

// Code generation configuration
export const CodegenerationConfig = {
  temperature: 0.7,
  maxOutputTokens: 5000,
};

// Function to create a code generation chat session
export const createCodeGenerationSession = async () => {
  const { ai, model } = await initializeAI();
  const genModel = ai.getGenerativeModel({ model });
  
  return {
    sendMessage: async (message: string) => {
      const contents = [
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ];
      
      return await genModel.generateContentStream({
        contents,
        generationConfig: CodegenerationConfig,
      });
    }
  };
};


// Function to analyze email content and determine if it matches a rule
export const analyzeEmailForRule = async (emailContent: string, ruleCondition: string) => {
  const { ai, model } = await initializeAI();
  const genModel = ai.getGenerativeModel({ model });
  
  const prompt = `
You are an email analyzer. Analyze if the following email matches the given rule condition.

Email Content:
${emailContent}

Rule Condition:
${ruleCondition}

Respond with only "true" or "false" based on whether the email matches the rule condition.
Consider the subject, body, sender, and overall context of the email.
  `.trim();

  const result = await genModel.generateContent(prompt);
  const response = await result.response;
  const text = response.text().trim().toLowerCase();
  
  return text === 'true';
};

// Function to suggest labels for emails based on content
export const suggestLabel = async (emailContent: string) => {
  const { ai, model } = await initializeAI();
  const genModel = ai.getGenerativeModel({ model });
  
  const prompt = `
Analyze this email and suggest ONE appropriate label from the following categories:
- Work
- Personal
- Important
- Promotions
- Social
- Updates
- Finance
- Travel
- Shopping
- Other

Email Content:
${emailContent}

Respond with only the label name, nothing else.
  `.trim();

  const result = await genModel.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
};

// Function to batch analyze all emails at once with rules
export const batchAnalyzeEmails = async (
  emails: Array<{ id: string; subject: string; from: string; snippet: string }>,
  rules: Array<{ name: string; condition: string; label: string }>
) => {
  const { ai, model } = await initializeAI();
  const genModel = ai.getGenerativeModel({ model });

  // Create structured prompt with all emails and rules
  const emailsText = emails
    .map((email, idx) => `
Email ${idx}:
- ID: ${email.id}
- Subject: ${email.subject || 'No subject'}
- From: ${email.from || 'Unknown'}
- Snippet: ${email.snippet || ''}
    `)
    .join('\n');

  const rulesText = rules
    .map((rule, idx) => `
Rule ${idx}:
- Condition: ${rule.condition}
- Label: ${rule.label}
    `)
    .join('\n');

  const prompt = `
You are an email analyzer. Analyze the following emails and apply labels based on the rules provided.

RULES:
${rulesText}

EMAILS:
${emailsText}

For each email, determine which rules match and return ONLY a valid JSON array with this exact structure:
[
  {
    "emailId": "email_id_here",
    "labels": ["label1", "label2"]
  }
]

- Each email should have an entry with its ID and matching labels
- If no rules match an email, use an empty labels array
- Return ONLY the JSON array, no other text
- Make sure the JSON is valid and parseable
  `.trim();

  try {
    const result = await genModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text;
    if (text.includes('```json')) {
      jsonText = text.split('```json')[1].split('```')[0].trim();
    } else if (text.includes('```')) {
      jsonText = text.split('```')[1].split('```')[0].trim();
    }

    const analyzed = JSON.parse(jsonText);
    return analyzed;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    // Return empty labels for all emails on error
    return emails.map(email => ({ emailId: email.id, labels: [] }));
  }
};
