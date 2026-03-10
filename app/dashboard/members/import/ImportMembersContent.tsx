'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Props = {
  businessId: string;
};

type ImportResult = {
  total_rows: number;
  successful: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
};

export default function ImportMembersContent({ businessId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  }

  async function handleImport() {
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('business_id', businessId);

      const response = await fetch('/api/members/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        if (data.failed === 0) {
          setTimeout(() => router.push('/dashboard/members'), 2000);
        }
      } else {
        alert('Import failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error importing:', error);
      alert('Error importing members');
    } finally {
      setImporting(false);
    }
  }

  function downloadTemplate() {
    const csv = `parent_email,parent_name,phone,child_name,child_age,overdue_amount,last_payment_date
ahmed@example.com,Ahmed Ali,+971501234567,Sara,8,1050.00,2024-12-15
fatima@example.com,Fatima Hassan,+971502345678,Omar,6,840.00,2024-11-20
ali@example.com,Ali Mohammed,+971503456789,Layla,7,1260.00,2024-10-30`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'members_template.csv';
    a.click();
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Import Members</h1>
        <p className="text-gray-600 mt-1">
          Upload a CSV file to import members with overdue balances
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">CSV Format Requirements</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>Your CSV file must include the following columns:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>parent_email</strong> - Email address (required)</li>
            <li><strong>parent_name</strong> - Full name (required)</li>
            <li><strong>phone</strong> - Phone number with country code</li>
            <li><strong>child_name</strong> - Child's name</li>
            <li><strong>child_age</strong> - Child's age (number)</li>
            <li><strong>overdue_amount</strong> - Outstanding balance (number, e.g., 1050.00)</li>
            <li><strong>last_payment_date</strong> - Last payment date (YYYY-MM-DD)</li>
          </ul>
        </div>
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="mt-4"
          size="sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg border-2 border-dashed p-12 text-center">
        {!file ? (
          <div className="space-y-4">
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium">Choose a CSV file to upload</p>
              <p className="text-sm text-gray-500 mt-1">
                Or drag and drop your file here
              </p>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button asChild>
                <span className="cursor-pointer">Select File</span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
            <div>
              <p className="text-lg font-medium">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleImport}
                disabled={importing}
              >
                {importing ? 'Importing...' : 'Import Members'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setFile(null)}
                disabled={importing}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className={`rounded-lg border p-6 ${
          result.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start gap-3">
            {result.failed === 0 ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className={`font-semibold mb-2 ${
                result.failed === 0 ? 'text-green-900' : 'text-yellow-900'
              }`}>
                Import {result.failed === 0 ? 'Completed' : 'Completed with Errors'}
              </h3>
              <div className="space-y-1 text-sm">
                <p>Total rows: {result.total_rows}</p>
                <p className="text-green-700">Successfully imported: {result.successful}</p>
                {result.failed > 0 && (
                  <p className="text-red-700">Failed: {result.failed}</p>
                )}
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="font-medium text-sm">Errors:</p>
                  <div className="bg-white rounded border p-3 max-h-48 overflow-y-auto">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="text-sm text-red-700 mb-1">
                        Row {err.row}: {err.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.failed === 0 && (
                <p className="mt-4 text-sm text-green-700">
                  Redirecting to members page...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="flex justify-start">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/members')}
        >
          Back to Members
        </Button>
      </div>
      </div>
    </DashboardLayout>
  );
}
