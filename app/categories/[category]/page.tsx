'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
        .eq('business_type', category)
        .order('google_rating', { ascending: false, nullsLast: true });

      if (!error && data) {
        setBusinesses(data);
      }
      setLoading(false);
    }

    loadBusinesses();
  }, [category]);

  const categoryNames: Record<string, string> = {
    sports: 'Sports & Fitness',
    education: 'Education & Learning',
    entertainment: 'Entertainment',
    health: 'Health & Wellness',
  };

  const getHeroImage = (business: Business) => {
    const heroImg = business.business_images?.find(img => img.type === 'hero');
    return heroImg?.url || business.business_images?.[0]?.url || business.logo_url;
  };

  const getRatingColor = (rating: number | null) => {
    if (!rating) return 'bg-gray-400';
    if (rating >= 4.5) return 'bg-emerald-500';
    if (rating >= 4.0) return 'bg-green-500';
    if (rating >= 3.5) return 'bg-lime-500';
    return 'bg-yellow-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-200 h-64 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">
                <Link href="/" className="hover:text-gray-700">Home</Link>
                <span className="mx-2">›</span>
                <Link href="/categories" className="hover:text-gray-700">Categories</Link>
                <span className="mx-2">›</span>
                <span className="text-gray-900">{categoryNames[category] || category}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {businesses.length} {categoryNames[category] || category} Activities
              </h1>
            </div>
            
            {/* View Toggle */}
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zM11 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM11 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="space-y-6">
                {/* Rating Filter */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Minimum Rating</h3>
                  <div className="flex gap-2">
                    {['6+', '7+', '8+', '9+'].map(rating => (
                      <button
                        key={rating}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Status</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Open Now</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Available Slots</span>
                    </label>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Kids Friendly</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Air Conditioned</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Parking Available</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Cards Grid */}
          <div className="flex-1">
            <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-6' : 'space-y-4'}>
              {businesses.map((business) => {
                const heroImage = getHeroImage(business);
                const ratingColor = getRatingColor(business.google_rating);

                return (
                  <Link
                    key={business.id}
                    href={`/business/${business.id}`}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer block"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {heroImage ? (
                        <img
                          src={heroImage}
                          alt={business.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                      
                      {/* Top badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {business.google_rating && business.google_rating >= 4.5 && (
                          <div className="bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                            <span>💎</span>
                            <span>Gem</span>
                          </div>
                        )}
                        {business.google_rating && business.google_rating >= 4.0 && (
                          <div className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                            <span>⭐</span>
                            <span>Top 100</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                          </svg>
                        </button>
                        <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                          {business.name}
                        </h3>
                        {business.google_rating && (
                          <div className={`${ratingColor} text-white text-sm font-bold px-2.5 py-1 rounded-lg flex-shrink-0 ml-2`}>
                            {business.google_rating.toFixed(1)}
                          </div>
                        )}
                      </div>

                      {business.address && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex items-start gap-1">
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                          </svg>
                          {business.address}
                        </p>
                      )}

                      {/* Status badges */}
                      <div className="flex gap-2 flex-wrap">
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded">
                          Open
                        </span>
                        <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded capitalize">
                          {business.business_type}
                        </span>
                        {business.business_images.length > 0 && (
                          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded">
                            {business.business_images.length} photos
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {businesses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No businesses found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
