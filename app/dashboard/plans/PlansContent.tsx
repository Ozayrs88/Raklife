'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2 } from 'lucide-react';

type Plan = {
  id: string;
  name: string;
  description: string;
  sessions_per_week: number;
  price_monthly: number;
  currency: string;
  is_active: boolean;
  sort_order: number;
};

type Props = {
  businessId: string;
};

export default function PlansContent({ businessId }: Props) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sessions_per_week: '',
    price_monthly: '',
  });
  const supabase = createClient();

  useEffect(() => {
    fetchPlans();
  }, [businessId]);

  async function fetchPlans() {
    try {
      const { data } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('business_id', businessId)
        .order('sort_order', { ascending: true });

      if (data) {
        setPlans(data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  }

  function openForm(plan?: Plan) {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description || '',
        sessions_per_week: plan.sessions_per_week?.toString() || '',
        price_monthly: plan.price_monthly.toString(),
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        description: '',
        sessions_per_week: '',
        price_monthly: '',
      });
    }
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const planData = {
      business_id: businessId,
      name: formData.name,
      description: formData.description,
      sessions_per_week: parseInt(formData.sessions_per_week) || null,
      price_monthly: parseFloat(formData.price_monthly),
      currency: 'AED',
      is_active: true,
    };

    try {
      if (editingPlan) {
        await supabase
          .from('membership_plans')
          .update(planData)
          .eq('id', editingPlan.id);
      } else {
        await supabase
          .from('membership_plans')
          .insert(planData);
      }

      setShowForm(false);
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Error saving plan');
    }
  }

  async function toggleActive(planId: string, isActive: boolean) {
    try {
      await supabase
        .from('membership_plans')
        .update({ is_active: !isActive })
        .eq('id', planId);
      
      fetchPlans();
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  }

  async function deletePlan(planId: string) {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      await supabase
        .from('membership_plans')
        .delete()
        .eq('id', planId);
      
      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Error deleting plan');
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Membership Plans</h1>
          <p className="text-gray-600 mt-1">
            Create pricing tiers for recurring subscriptions
          </p>
        </div>
        <Button onClick={() => openForm()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Plan
        </Button>
      </div>

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <p className="text-gray-500 mb-4">No membership plans yet</p>
          <Button onClick={() => openForm()}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg border-2 p-6 relative ${
                !plan.is_active ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openForm(plan)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="p-2 hover:bg-gray-100 rounded text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-bold">
                    AED {plan.price_monthly}
                    <span className="text-lg text-gray-600 font-normal">/month</span>
                  </div>
                </div>

                {plan.sessions_per_week && (
                  <div className="text-sm text-gray-600">
                    {plan.sessions_per_week}× sessions per week
                  </div>
                )}

                <Button
                  variant={plan.is_active ? 'outline' : 'default'}
                  className="w-full mt-4"
                  onClick={() => toggleActive(plan.id, plan.is_active)}
                >
                  {plan.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">
              {editingPlan ? 'Edit Plan' : 'Create New Plan'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Plan Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., 2x per week"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sessions per Week</label>
                <Input
                  type="number"
                  value={formData.sessions_per_week}
                  onChange={(e) => setFormData({ ...formData, sessions_per_week: e.target.value })}
                  placeholder="e.g., 2"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price (AED) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price_monthly}
                  onChange={(e) => setFormData({ ...formData, price_monthly: e.target.value })}
                  placeholder="e.g., 420.00"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingPlan ? 'Update' : 'Create'} Plan
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
