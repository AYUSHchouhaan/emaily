interface FormData {
  name: string;
  condition: string;
  label: string;
}

interface RuleFormProps {
  formData: FormData;
  isEditing: boolean;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: FormData) => void;
  onCancel: () => void;
}

export default function RuleForm({
  formData,
  isEditing,
  saving,
  onSubmit,
  onChange,
  onCancel,
}: RuleFormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6 text-black">
        {isEditing ? 'Edit Rule' : 'Create New Rule'}
      </h2>

      <form onSubmit={onSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rule Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              placeholder="e.g., Work Emails"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition (Natural Language)
            </label>
            <textarea
              value={formData.condition}
              onChange={(e) => onChange({ ...formData, condition: e.target.value })}
              placeholder="e.g., Any email related to work or from my company domain"
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Describe the condition in plain English. AI will analyze emails based on this.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => onChange({ ...formData, label: e.target.value })}
              placeholder="e.g., Work, Important, Personal"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
            >
              {saving ? 'Saving...' : isEditing ? 'Update Rule' : 'Create Rule'}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Example rules */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Example Rules</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="p-2 bg-gray-50 rounded">
            <strong>Work:</strong> Any email related to work or from my company domain
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <strong>Important:</strong> Emails that require immediate action or response
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <strong>Finance:</strong> Emails about invoices, payments, or financial matters
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <strong>Social:</strong> Emails from social media platforms or newsletters
          </div>
        </div>
      </div>
    </div>
  );
}
