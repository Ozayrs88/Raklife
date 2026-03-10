'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

interface Business {
  id: string;
  name: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  google_rating: number | null;
  business_type: string;
  business_images: Array<{
    url: string;
    type: string;
  }>;
}

export default function ViewBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBusinesses() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id,
          name,
          logo_url,
          address,
          phone,
          website,
          google_rating,
          business_type,
          business_images (
            url,
            type
          )
        `)
        .eq('source', 'scraped')
        .order('name');

      if (!error && data) {
        setBusinesses(data);
      }
      setLoading(false);
    }

    loadBusinesses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading businesses...</h1>
        </div>
      </div>
    );
  }

  const withImages = businesses.filter(b => b.logo_url || b.business_images.length > 0);
  const withoutImages = businesses.filter(b => !b.logo_url && b.business_images.length === 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">RAKlife Business Directory</h1>
          <p className="text-gray-600">
            {withImages.length} businesses with images • {withoutImages.length} without images
          </p>
        </div>

        {/* Businesses WITH Images */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">✅ Businesses with Images ({withImages.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {withImages.map((business) => (
              <div key={business.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Logo */}
                {business.logo_url && (
                  <div className="bg-gray-100 p-4 flex items-center justify-center h-32">
                    <img
                      src={business.logo_url}
                      alt={`${business.name} logo`}
                      className="max-h-24 max-w-full object-contain"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{business.name}</h3>
                  
                  {business.google_rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm font-medium">{business.google_rating}</span>
                    </div>
                  )}

                  <div className="text-sm text-gray-600 space-y-1">
                    {business.address && (
                      <p className="line-clamp-2">📍 {business.address}</p>
                    )}
                    {business.phone && (
                      <p>📞 {business.phone}</p>
                    )}
                    {business.website && (
                      <a 
                        href={business.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline block truncate"
                      >
                        🌐 {business.website}
                      </a>
                    )}
                  </div>

                  {/* Gallery Images */}
                  {business.business_images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">
                        {business.business_images.length} photos
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {business.business_images.slice(0, 3).map((img, idx) => (
                          <div key={idx} className="aspect-square bg-gray-100 rounded overflow-hidden">
                            <img
                              src={img.url}
                              alt={`${business.name} photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Businesses WITHOUT Images */}
        {withoutImages.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">⚠️ Businesses without Images ({withoutImages.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {withoutImages.map((business) => (
                <div key={business.id} className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-bold text-sm text-gray-900 mb-1">{business.name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{business.business_type}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
