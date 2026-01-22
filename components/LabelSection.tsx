import EmailCard from './EmailCard';

interface Email {
  id: string;
  threadId: string;
  snippet: string;
  from: string;
  subject: string;
  date: string;
  labels?: string[];
}

interface LabelSectionProps {
  label: string;
  emails: Email[];
  labelRef: (el: HTMLDivElement | null) => void;
  isUnlabeled?: boolean;
}

export default function LabelSection({
  label,
  emails,
  labelRef,
  isUnlabeled = false,
}: LabelSectionProps) {
  return (
    <div ref={labelRef} className="scroll-mt-32">
      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
        isUnlabeled ? 'text-gray-600' : 'text-black'
      }`}>
        <span className={`px-3 py-1 rounded-full ${
          isUnlabeled ? 'bg-gray-50' : 'bg-gray-100'
        }`}>
          {label}
        </span>
        <span className="text-sm text-gray-500">{emails.length} emails</span>
      </h3>
      <div className="space-y-3">
        {emails.map((email) => (
          <EmailCard key={email.id} email={email} />
        ))}
      </div>
    </div>
  );
}
