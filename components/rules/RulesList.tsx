interface Rule {
  id: string;
  name: string;
  condition: string;
  label: string;
  priority: number;
  isActive: number;
  createdAt: Date;
}

interface RulesListProps {
  rules: Rule[];
  selectedRuleId: string | null;
  onEditRule: (rule: Rule) => void;
  onToggleActive: (rule: Rule) => void;
  onDeleteRule: (id: string) => void;
}

export default function RulesList({
  rules,
  selectedRuleId,
  onEditRule,
  onToggleActive,
  onDeleteRule,
}: RulesListProps) {
  if (rules.length === 0) {
    return <p className="text-sm text-gray-500">No rules created yet</p>;
  }

  return (
    <div className="space-y-2">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
            selectedRuleId === rule.id
              ? 'border-black bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onEditRule(rule)}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm text-black">{rule.name}</span>
            <span
              className={`text-xs px-2 py-1 rounded ${
                rule.isActive === 1
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {rule.isActive === 1 ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="bg-gray-100 px-2 py-0.5 rounded">{rule.label}</span>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleActive(rule);
              }}
              className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
            >
              {rule.isActive === 1 ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRule(rule.id);
              }}
              className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
