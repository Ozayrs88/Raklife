'use client'

import { XCircle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <XCircle className="w-20 h-20 text-red-500 mx-auto" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges have been made to your account.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            If you're having trouble completing payment, please contact us for assistance.
          </p>
        </div>
        <p className="text-sm text-gray-500">
          You can close this page now.
        </p>
      </div>
    </div>
  )
}
