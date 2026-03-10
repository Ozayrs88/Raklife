'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Send, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Member = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  overdue_amount: number;
  payment_status: string;
  last_payment_date: string;
  children_count: number;
  stripe_customer_id: string;
};

type Props = {
  businessId: string;
};

export default function MembersContent({ businessId }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'overdue' | 'current'>('all');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchMembers();
  }, [businessId]);

  useEffect(() => {
    filterMembers();
  }, [members, searchTerm, statusFilter]);

  async function fetchMembers() {
    try {
      // SIMPLIFIED: Get all customers with overdue amounts for this business
      // We'll filter by business through bookings OR just show all overdue customers
      
      // Option 1: Try to get via bookings first
      const { data: bookings } = await supabase
        .from('bookings')
        .select('customer_id')
        .eq('business_id', businessId);

      let customerIds: string[] = [];
      
      if (bookings && bookings.length > 0) {
        customerIds = [...new Set(bookings.map(b => b.customer_id))];
      }

      // Option 2: If no bookings, just get all customers with overdue amounts
      let query = supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          phone,
          overdue_amount,
          payment_status,
          last_payment_date,
          stripe_customer_id
        `)
        .eq('user_type', 'customer');

      // If we have customer IDs from bookings, filter by those
      if (customerIds.length > 0) {
        query = query.in('id', customerIds);
      }

      const { data: customers } = await query;

      if (!customers || customers.length === 0) {
        setLoading(false);
        return;
      }

      // Get children count for each customer
      const membersWithChildren = await Promise.all(
        customers.map(async (customer) => {
          const { count } = await supabase
            .from('children')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', customer.id);

          return {
            ...customer,
            children_count: count || 0,
            overdue_amount: Number(customer.overdue_amount) || 0,
          };
        })
      );

      setMembers(membersWithChildren);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterMembers() {
    let filtered = members;

    // Status filter
    if (statusFilter === 'overdue') {
      filtered = filtered.filter(m => m.overdue_amount > 0);
    } else if (statusFilter === 'current') {
      filtered = filtered.filter(m => m.overdue_amount === 0);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.full_name?.toLowerCase().includes(term) ||
        m.email?.toLowerCase().includes(term) ||
        m.phone?.includes(term)
      );
    }

    setFilteredMembers(filtered);
  }

  function toggleMemberSelection(memberId: string) {
    const newSelection = new Set(selectedMembers);
    if (newSelection.has(memberId)) {
      newSelection.delete(memberId);
    } else {
      newSelection.add(memberId);
    }
    setSelectedMembers(newSelection);
  }

  function selectAllOverdue() {
    const overdue = filteredMembers.filter(m => m.overdue_amount > 0);
    setSelectedMembers(new Set(overdue.map(m => m.id)));
  }

  async function sendPaymentLinks() {
    if (selectedMembers.size === 0) {
      alert('Please select at least one member');
      return;
    }

    try {
      console.log('📤 Sending payment links for:', Array.from(selectedMembers));
      const response = await fetch('/api/payment-links/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          customer_ids: Array.from(selectedMembers),
        }),
      });

      const result = await response.json();
      console.log('📥 Response:', result);

      if (response.ok) {
        alert(`✅ Payment links sent!\n\nSuccessful: ${result.successful}\nFailed: ${result.failed}`);
        setSelectedMembers(new Set());
        fetchMembers();
      } else {
        alert(`❌ Failed to send payment links:\n${result.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('❌ Error sending payment links:', error);
      alert(`❌ Error: ${error.message}`);
    }
  }

  const totalOverdue = filteredMembers.reduce((sum, m) => sum + m.overdue_amount, 0);
  const overdueCount = filteredMembers.filter(m => m.overdue_amount > 0).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading members...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-gray-600 mt-1">
            Manage member payments and subscriptions
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/members/import')}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button
            onClick={sendPaymentLinks}
            disabled={selectedMembers.size === 0}
          >
            <Send className="w-4 h-4 mr-2" />
            Send Payment Links ({selectedMembers.size})
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600">Total Members</div>
          <div className="text-2xl font-bold mt-1">{members.length}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600">Overdue Members</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{overdueCount}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600">Total Outstanding</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            AED {totalOverdue.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600">Selected</div>
          <div className="text-2xl font-bold mt-1">{selectedMembers.size}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              size="sm"
            >
              All ({members.length})
            </Button>
            <Button
              variant={statusFilter === 'overdue' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('overdue')}
              size="sm"
            >
              Overdue ({members.filter(m => m.overdue_amount > 0).length})
            </Button>
            <Button
              variant={statusFilter === 'current' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('current')}
              size="sm"
            >
              Current ({members.filter(m => m.overdue_amount === 0).length})
            </Button>
          </div>
          {statusFilter === 'overdue' && (
            <Button
              variant="outline"
              onClick={selectAllOverdue}
              size="sm"
            >
              Select All Overdue
            </Button>
          )}
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                <input
                  type="checkbox"
                  checked={selectedMembers.size === filteredMembers.length && filteredMembers.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMembers(new Set(filteredMembers.map(m => m.id)));
                    } else {
                      setSelectedMembers(new Set());
                    }
                  }}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Member</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Children</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Overdue</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No members found
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedMembers.has(member.id)}
                      onChange={() => toggleMemberSelection(member.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{member.full_name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {member.phone || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {member.children_count}
                  </td>
                  <td className="px-4 py-3">
                    {member.overdue_amount > 0 ? (
                      <span className="font-semibold text-red-600">
                        AED {member.overdue_amount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-green-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {member.overdue_amount > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Overdue
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Current
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/members/${member.id}`)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </DashboardLayout>
  );
}
