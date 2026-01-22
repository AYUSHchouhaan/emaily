'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import LabelSection from '@/components/LabelSection';
import ErrorDisplay from '@/components/ErrorDisplay';
import { useEmails, type Email } from '@/contexts/EmailContext';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { emails, setEmails, loading, setLoading, analyzed, setAnalyzed } = useEmails();
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisInfo, setAnalysisInfo] = useState<string | null>(null);
  const labelRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      // Only fetch if we don't have emails
      if (emails.length === 0) {
        fetchEmails();
      }
    }
  }, [status]);

  const fetchEmails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/gmail/messages');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch emails');
      }

      const fetchedEmails = data.emails || [];
      setEmails(fetchedEmails);

      // Don't automatically analyze - user must click Analyze button
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching emails:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeEmails = async (emailsToAnalyze?: Email[]) => {
    const emailsToUse = emailsToAnalyze || emails;
    
    if (emailsToUse.length === 0) {
      setAnalysisInfo('⚠️ No emails to analyze');
      return;
    }
    
    setAnalyzing(true);
    setAnalysisInfo(null);
    
    try {
      const response = await fetch('/api/gmail/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emailsToUse }),
      });
 
      const data = await response.json();

      if (response.ok) {
        setEmails(data.labeledEmails || emailsToUse);
        setAnalyzed(true); // Mark as analyzed
        
        if (data.analyzed > 0) {
          setAnalysisInfo(`✓ Successfully analyzed ${data.analyzed} emails`);
        }
      } else {
        setAnalysisInfo(`❌ Analysis failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Error analyzing emails:', err);
      setAnalysisInfo(`❌ Network error: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const scrollToLabel = (label: string) => {
    const element = labelRefs.current[label];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Group emails by labels
  const groupedEmails: { [key: string]: Email[] } = {};
  const allLabels = new Set<string>();

  emails.forEach(email => {
    if (email.labels && email.labels.length > 0) {
      email.labels.forEach(label => {
        allLabels.add(label);
        if (!groupedEmails[label]) {
          groupedEmails[label] = [];
        }
        groupedEmails[label].push(email);
      });
    } else {
      // Unlabeled emails
      if (!groupedEmails['Unlabeled']) {
        groupedEmails['Unlabeled'] = [];
      }
      groupedEmails['Unlabeled'].push(email);
    }
  });

  const sortedLabels = Array.from(allLabels).sort();

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <AppHeader 
        title="Emaily Dashboard" 
        subtitle={`Welcome, ${session?.user?.email}`}
      />

      {/* Label Navigation */}
      {!loading && sortedLabels.length > 0 && (
        <div className="border-b border-gray-200 bg-white sticky top-[73px] z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {sortedLabels.map((label) => (
                <button
                  key={label}
                  onClick={() => scrollToLabel(label)}
                  className="px-4 py-2 bg-gray-100 text-black rounded-full hover:bg-gray-200 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  {label} ({groupedEmails[label]?.length || 0})
                </button>
              ))}
              {groupedEmails['Unlabeled'] && (
                <button
                  onClick={() => scrollToLabel('Unlabeled')}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  Unlabeled ({groupedEmails['Unlabeled'].length})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-black">Email History</h2>
          <div className="flex gap-3 items-center">
            {analyzing && (
              <span className="text-sm text-gray-600">Analyzing emails...</span>
            )}
            <button
              onClick={() => analyzeEmails()}
              disabled={loading || analyzing || emails.length === 0}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? 'Analyzing...' : 'Analyze'}
            </button>
            <button
              onClick={fetchEmails}
              disabled={loading}
              className="px-4 py-2 border border-black text-black rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Analysis Info */}
        {analysisInfo && (
          <div className={`mb-6 p-4 rounded-lg border ${
            analysisInfo.includes('✓') 
              ? 'bg-green-50 border-green-200' 
              : analysisInfo.includes('⚠️')
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <p className={`text-sm ${
              analysisInfo.includes('✓')
                ? 'text-green-800'
                : analysisInfo.includes('⚠️')
                ? 'text-yellow-800'
                : 'text-red-800'
            }`}>
              {analysisInfo}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && <ErrorDisplay error={error} />}

        {/* Loading State */}
        {loading && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your emails...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && emails.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No emails found.</p>
          </div>
        )}

        {/* Email List */}
        {!loading && !error && emails.length > 0 && (
          <div className="space-y-8">
            {/* Display emails grouped by labels */}
            {sortedLabels.map((label) => (
              <LabelSection
                key={label}
                label={label}
                emails={groupedEmails[label] || []}
                labelRef={(el) => {
                  labelRefs.current[label] = el;
                }}
              />
            ))}

            {/* Unlabeled emails */}
            {groupedEmails['Unlabeled'] && (
              <LabelSection
                label="Unlabeled"
                emails={groupedEmails['Unlabeled']}
                labelRef={(el) => {
                  labelRefs.current['Unlabeled'] = el;
                }}
                isUnlabeled={true}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
