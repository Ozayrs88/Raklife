'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface CategoryCount {
  business_type: string;
  count: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('businesses')
        .select('business_type')
        .eq('source', 'scraped');

      if (!error && data) {
        // Count businesses per category
        const counts = data.reduce((acc, curr) => {
          acc[curr.business_type] = (acc[curr.business_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const categoryData = Object.entries(counts).map(([type, count]) => ({
          business_type: type,
          count: count as number,
        }));

        setCategories(categoryData);
      }
      setLoading(false);
    }

    loadCategories();
  }, []);

  const categoryInfo: Record<string, { name: string; icon: string; color: string; description: string }> = {
    sports: {
      name: 'Sports & Fitness',
      icon: '⚽',
      color: 'from-blue-500 to-cyan-500',
      description: 'Football, basketball, gymnastics, martial arts & more',
    },
    education: {
      name: 'Education & Learning',
      icon: '📚',
      color: 'from-purple-500 to-pink-500',
      description: 'Music schools, art studios, STEM learning & language classes',
    },
    entertainment: {
      name: 'Entertainment',
      icon: '🎪',
      color: 'from-orange-500 to-red-500',
      description: 'Trampoline parks, play areas, dance & performing arts',
    },
    health: {
      name: 'Health & Wellness',
      icon: '🧘',
      color: 'from-green-500 to-emerald-500',
      description: 'Yoga, swimming, fitness centers & wellness activities',
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-96 mb-12"></div>
            <div className="grid grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gray-200 h-48 rounded-3xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">All Categories</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Explore Kids Activities in RAK
          </h1>
          <p className="text-lg text-gray-600">
            Discover the best activities for children across Ras Al Khaimah
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => {
            const info = categoryInfo[category.business_type] || {
              name: category.business_type,
              icon: '🏢',
              color: 'from-gray-500 to-gray-600',
              description: 'Various activities and services',
            };

            return (
              <Link
                key={category.business_type}
                href={`/categories/${category.business_type}`}
                className="group"
              >
                <div className="relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${info.color} opacity-90`}></div>
                  
                  {/* Pattern Overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                  </div>

                  {/* Content */}
                  <div className="relative p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-6xl mb-4">{info.icon}</div>
                      <div className="bg-white/20 backdrop-blur-sm text-white font-bold text-xl px-4 py-2 rounded-full">
                        {category.count}
                      </div>
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2 group-hover:scale-105 transition-transform">
                      {info.name}
                    </h2>
                    <p className="text-white/90 text-lg mb-6">
                      {info.description}
                    </p>

                    <div className="flex items-center text-white font-medium">
                      <span>Explore Activities</span>
                      <svg 
                        className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-all duration-700"></div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white rounded-3xl shadow-lg p-8">
          <div className="grid grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {categories.reduce((sum, cat) => sum + cat.count, 0)}
              </div>
              <div className="text-gray-600 font-medium">Total Activities</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {categories.length}
              </div>
              <div className="text-gray-600 font-medium">Categories</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                15+
              </div>
              <div className="text-gray-600 font-medium">With Photos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">
                4.5★
              </div>
              <div className="text-gray-600 font-medium">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
