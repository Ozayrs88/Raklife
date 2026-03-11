'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Image as ImageIcon, 
  Users, 
  Sparkles,
  X,
  Upload,
  Eye,
  CheckCircle2
} from 'lucide-react';

type Customer = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  overdue_amount: number;
};

type Props = {
  businessId: string;
};

export default function CustomMessageComposer({ businessId }: Props) {
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [filter, setFilter] = useState<'all' | 'overdue'>('all');
  const supabase = createClient();

  useEffect(() => {
    fetchCustomers();
  }, [businessId, filter]);

  async function fetchCustomers() {
    try {
      // Get customers associated with this business via bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('customer_id')
        .eq('business_id', businessId);

      if (!bookings || bookings.length === 0) {
        setCustomers([]);
        setLoading(false);
        return;
      }

      const customerIds = [...new Set(bookings.map(b => b.customer_id))];

      let query = supabase
        .from('users')
        .select('id, full_name, phone, email, overdue_amount')
        .in('id', customerIds)
        .not('phone', 'is', null);

      if (filter === 'overdue') {
        query = query.gt('overdue_amount', 0);
      }

      const { data, error } = await query.order('full_name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  function toggleCustomer(customerId: string) {
    const newSelected = new Set(selectedCustomers);
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId);
    } else {
      newSelected.add(customerId);
    }
    setSelectedCustomers(newSelected);
  }

  function selectAll() {
    setSelectedCustomers(new Set(customers.map(c => c.id)));
  }

  function selectNone() {
    setSelectedCustomers(new Set());
  }

  async function sendMessages() {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    if (selectedCustomers.size === 0) {
      alert('Please select at least one customer');
      return;
    }

    setSending(true);

    try {
      let imageUrl = null;

      // Upload image to Supabase Storage if provided
      if (imageFile) {
        setUploadingImage(true);
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${businessId}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('whatsapp-media')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('whatsapp-media')
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
        setUploadingImage(false);
      }

      // Send to API endpoint
      const response = await fetch('/api/messages/send-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          customer_ids: Array.from(selectedCustomers),
          message: message,
          image_url: imageUrl,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ Messages sent successfully!\n\nSent: ${result.successful}\nFailed: ${result.failed}`);
        
        // Clear form
        setMessage('');
        setImageFile(null);
        setImagePreview(null);
        setSelectedCustomers(new Set());
      } else {
        alert(`❌ Failed to send messages: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error sending messages:', error);
      alert(`❌ Failed to send messages: ${error.message}`);
    } finally {
      setSending(false);
      setUploadingImage(false);
    }
  }

  // Message templates
  function insertTemplate(template: string) {
    setMessage(template);
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Custom Messages</h1>
          <p className="text-sm text-gray-600">
            Send custom WhatsApp messages with images to your customers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column: Message Composer */}
          <div className="space-y-3">
            {/* Quick Templates */}
            <Card className="p-3">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Quick Templates
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => insertTemplate('🎉 Great news! Special offer for our valued members...')}
                >
                  Promotion
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => insertTemplate('📅 Reminder: Your session is scheduled for...')}
                >
                  Reminder
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => insertTemplate('🏆 Congratulations on your progress! Keep it up...')}
                >
                  Motivation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => insertTemplate('⚠️ Important update regarding...')}
                >
                  Update
                </Button>
              </div>
            </Card>

            {/* Image Upload */}
            <Card className="p-3">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Add Image (Optional)
              </h3>
              
              {!imagePreview ? (
                <div>
                  <label className="block">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 cursor-pointer transition">
                      <Upload className="w-6 h-6 mx-auto mb-1.5 text-gray-400" />
                      <p className="text-xs text-gray-600">Click to upload</p>
                      <p className="text-xs text-gray-500 mt-0.5">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full rounded-lg max-h-48 object-cover"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </Card>

            {/* Message Text */}
            <Card className="p-3">
              <h3 className="font-semibold text-sm mb-2">Message Text</h3>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message... Use *bold* for emphasis"
                rows={8}
                className="font-mono text-xs"
              />
              <div className="mt-1.5 text-xs text-gray-500">
                {message.length} characters
              </div>
            </Card>

            {/* Preview */}
            <Card className="p-3 bg-green-50 border-green-200">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Preview
              </h3>
              <div className="bg-white rounded-lg p-3 max-w-sm">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full rounded-lg mb-2 max-h-32 object-cover"
                  />
                )}
                <div className="whitespace-pre-wrap text-xs">
                  {message || <span className="text-gray-400">Your message will appear here...</span>}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Recipients */}
          <div className="space-y-3">
            <Card className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Recipients ({selectedCustomers.size})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setFilter(filter === 'all' ? 'overdue' : 'all')}
                >
                  {filter === 'all' ? 'All' : 'Overdue'}
                </Button>
              </div>

              <div className="flex gap-2 mb-2">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={selectNone}>
                  Clear
                </Button>
              </div>

              <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                {customers.length === 0 ? (
                  <p className="text-gray-500 text-center py-6 text-sm">
                    No customers found
                  </p>
                ) : (
                  customers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => toggleCustomer(customer.id)}
                      className={`p-2 border rounded cursor-pointer transition text-xs ${
                        selectedCustomers.has(customer.id)
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {selectedCustomers.has(customer.id) && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                            )}
                            <span className="font-medium truncate">{customer.full_name}</span>
                          </div>
                          <div className="text-gray-600 mt-0.5 truncate">📱 {customer.phone}</div>
                          {customer.overdue_amount > 0 && (
                            <div className="text-red-600 mt-0.5">
                              Overdue: AED {customer.overdue_amount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Send Button */}
            <Card className="p-3 bg-blue-50 border-blue-200">
              <Button
                onClick={sendMessages}
                disabled={sending || uploadingImage || selectedCustomers.size === 0 || !message.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10"
                size="lg"
              >
                <Send className="w-4 h-4 mr-2" />
                {sending
                  ? `Sending...`
                  : uploadingImage
                  ? 'Uploading...'
                  : `Send to ${selectedCustomers.size} customer${selectedCustomers.size !== 1 ? 's' : ''}`}
              </Button>

              <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                <p>• Messages sent via WhatsApp</p>
                <p>• Activity logged automatically</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
