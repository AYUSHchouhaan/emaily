'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import RulesList from '@/components/RulesList';
import RuleForm from '@/components/RuleForm';
import AppHeader from '@/components/AppHeader';

interface Rule {
  id: string;
  name: string;
  condition: string;
  label: string;
  priority: number;
  isActive: number;
  createdAt: Date;
}

export default function RulesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    condition: '',
    label: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    }
  }, [status, router]);

  // Fetch rules
  useEffect(() => {
    if (status === 'authenticated') {
      fetchRules();
    }
  }, [status]);

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/rules');
      if (response.ok) {
        const data = await response.json();
        setRules(data.rules);
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setRules([...rules, data.rule]);
        setFormData({ name: '', condition: '', label: '' });
      }
    } catch (error) {
      console.error('Error creating rule:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRule) return;
    setSaving(true);

    try {
      const response = await fetch('/api/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedRule.id, ...formData }),
      });

      if (response.ok) {
        const data = await response.json();
        setRules(rules.map(r => r.id === data.rule.id ? data.rule : r));
        setSelectedRule(null);
        setFormData({ name: '', condition: '', label: '' });
      }
    } catch (error) {
      console.error('Error updating rule:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const response = await fetch(`/api/rules?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRules(rules.filter(r => r.id !== id));
        if (selectedRule?.id === id) {
          setSelectedRule(null);
          setFormData({ name: '', condition: '', label: '' });
        }
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const handleToggleActive = async (rule: Rule) => {
    try {
      const response = await fetch('/api/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: rule.id, 
          isActive: rule.isActive === 1 ? 0 : 1 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRules(rules.map(r => r.id === data.rule.id ? data.rule : r));
      }
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  const handleEditRule = (rule: Rule) => {
    setSelectedRule(rule);
    setFormData({
      name: rule.name,
      condition: rule.condition,
      label: rule.label,
    });
  };

  const handleCancelEdit = () => {
    setSelectedRule(null);
    setFormData({ name: '', condition: '', label: '' });
  };

  if (status === 'loading' || loading) {
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
        title="Emaily  Rules" 
        subtitle="Create and manage your email labeling rules"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar - Rules list */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4 text-black">Your Rules</h2>
              <RulesList
                rules={rules}
                selectedRuleId={selectedRule?.id || null}
                onEditRule={handleEditRule}
                onToggleActive={handleToggleActive}
                onDeleteRule={handleDeleteRule}
              />
            </div>
          </div>

          {/* Right side - Create/Edit form */}
          <div className="lg:col-span-2">
            <RuleForm
              formData={formData}
              isEditing={!!selectedRule}
              saving={saving}
              onSubmit={selectedRule ? handleUpdateRule : handleCreateRule}
              onChange={setFormData}
              onCancel={handleCancelEdit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
