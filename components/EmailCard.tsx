interface Email {
  id: string;
  threadId: string;
  snippet: string;
  from: string;
  subject: string;
  date: string;
  labels?: string[];
}

interface EmailCardProps {
  email: Email;
}

export default function EmailCard({ email }: EmailCardProps) {
  return (
    <a
      href={`https://mail.google.com/mail/u/0/#inbox/${email.threadId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-200 rounded-lg p-4 hover:border-black transition-colors bg-white"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-black truncate">
            {email.subject || '(No Subject)'}
          </h4>
          <p className="text-sm text-gray-700 mt-1">From: {email.from}</p>
        </div>
        <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">
          {new Date(email.date).toLocaleDateString()}
        </span>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">{email.snippet}</p>
      {email.labels && email.labels.length > 1 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {email.labels.map((lbl) => (
            <span
              key={lbl}
              className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded"
            >
              {lbl}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
