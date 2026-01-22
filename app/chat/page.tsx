'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useEmails } from '@/contexts/EmailContext';
import AppHeader from '@/components/AppHeader';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { emails } = useEmails();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    }
  }, [status, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          emails: emails,
          history: messages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
          }))
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `❌ Error: ${data.error}` 
        }]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ Network error: ${error.message}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <AppHeader 
        title="Emaily Chat" 
        subtitle={`Chat with your ${emails.length} emails`}
      />

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block p-4 bg-gray-50 rounded-lg mb-4">
                <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h2>
              <p className="text-gray-500 text-sm mb-6">
                Ask me anything about your {emails.length} emails
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setInput("Summarize my recent emails")}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                >
                  Summarize recent emails
                </button>
                <button
                  onClick={() => setInput("What are my important emails?")}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                >
                  Show important emails
                </button>
                <button
                  onClick={() => setInput("Find work-related emails")}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                >
                  Find work emails
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="markdown-content">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your emails..."
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 text-black"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
