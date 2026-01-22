'use client';

import AppHeader from './AppHeader';

interface DashboardHeaderProps {
  userEmail: string | null | undefined;
  sortedLabels: string[];
  groupedEmails: { [key: string]: any[] };
  loading: boolean;
  onScrollToLabel: (label: string) => void;
}

export default function DashboardHeader({
  userEmail,
  sortedLabels,
  groupedEmails,
  loading,
  onScrollToLabel,
}: DashboardHeaderProps) {
  return (
    <>
      <AppHeader 
        title="Emaily Dashboard" 
        subtitle={`Welcome, ${userEmail}`}
      />
      
      {/* Labels Navigation */}
      {!loading && sortedLabels.length > 0 && (
        <div className="border-b border-gray-200 bg-white sticky top-[73px] z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {sortedLabels.map((label) => (
                <button
                  key={label}
                  onClick={() => onScrollToLabel(label)}
                  className="px-4 py-2 bg-gray-100 text-black rounded-full hover:bg-gray-200 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  {label} ({groupedEmails[label]?.length || 0})
                </button>
              ))}
              {groupedEmails['Unlabeled'] && (
                <button
                  onClick={() => onScrollToLabel('Unlabeled')}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  Unlabeled ({groupedEmails['Unlabeled'].length})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
