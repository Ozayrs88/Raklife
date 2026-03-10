'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Business {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_photo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  description: string | null;
  about: string | null;
  tagline: string | null;
  business_type: string;
  operating_hours: any;
  amenities: string[] | null;
  equipment: string[] | null;
  parking_info: string | null;
  accessibility_info: string | null;
  payment_methods: string[] | null;
  age_groups: string[] | null;
  skill_levels: string[] | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  business_images: Array<{
    url: string;
    type: string;
    display_order: number;
  }>;
}

interface Review {
  id: string;
  author_name: string;
  author_photo_url: string | null;
  rating: number;
  text: string;
  review_date: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price_from: number | null;
  price_to: number | null;
  duration_text: string | null;
  age_min: number | null;
  age_max: number | null;
}

export default function BusinessDetailPage() {
  const params = useParams();
  const id = params.slug as string;
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    async function loadBusiness() {
      const supabase = createClient();
      
      // Load business with images
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select(`
          *,
          business_images (
            url,
            type,
            display_order
          )
        `)
        .eq('id', id)
        .single();

      if (!businessError && businessData) {
        setBusiness(businessData);
      }

      // Load reviews
      const { data: reviewsData } = await supabase
        .from('reviews_scraped')
        .select('*')
        .eq('business_id', id)
        .order('review_date', { ascending: false })
        .limit(5);
      
      if (reviewsData) setReviews(reviewsData);

      // Load FAQs
      const { data: faqsData } = await supabase
        .from('faqs_scraped')
        .select('*')
        .eq('business_id', id)
        .order('display_order');
      
      if (faqsData) setFaqs(faqsData);

      // Load services
      const { data: servicesData } = await supabase
        .from('services_scraped')
        .select('*')
        .eq('business_id', id)
        .order('price_from');
      
      if (servicesData) setServices(servicesData);

      setLoading(false);
    }

    loadBusiness();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h1>
          <Link href="/categories" className="text-blue-600 hover:underline">
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  const heroImage = business.cover_photo_url 
    || business.business_images?.find(img => img.type === 'hero')?.url 
    || business.business_images?.[0]?.url 
    || business.logo_url;

  const galleryImages = business.business_images?.filter(img => img.type === 'gallery' || img.type === 'facility')
    .sort((a, b) => a.display_order - b.display_order) || [];

  const getRatingColor = (rating: number | null) => {
    if (!rating) return 'bg-gray-400';
    if (rating >= 4.5) return 'bg-emerald-500';
    if (rating >= 4.0) return 'bg-green-500';
    if (rating >= 3.5) return 'bg-lime-500';
    return 'bg-yellow-500';
  };

  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const getCurrentDay = () => daysOfWeek[new Date().getDay()];
  
  // Parse operating hours from JSONB
  const operatingHours = business.operating_hours || {};
  const currentDay = getCurrentDay();
  const todayHours = operatingHours[currentDay];
  
  // Generate features from amenities and equipment
  const allFeatures = [
    ...(business.amenities || []),
    ...(business.equipment || []),
  ];

  // Default FAQs if none exist
  const displayFaqs = faqs.length > 0 ? faqs : [
    {
      id: '1',
      question: 'What age groups do you cater to?',
      answer: business.age_groups?.length ? 
        `We welcome children aged ${business.age_groups.join(', ')}.` :
        'We welcome children of all ages with specialized programs for different age groups.',
      category: null,
    },
    {
      id: '2',
      question: 'Do I need to book in advance?',
      answer: 'Booking in advance is recommended to secure your preferred time slot, especially during peak hours.',
      category: null,
    },
    {
      id: '3',
      question: 'What are your payment methods?',
      answer: business.payment_methods?.length ?
        `We accept: ${business.payment_methods.join(', ')}.` :
        'We accept cash, credit cards, and online payment methods.',
      category: null,
    }
  ];

  const displayDescription = business.about || business.description || 
    `${business.name} is one of the premier ${business.business_type} facilities in ${business.city || 'Ras Al Khaimah'}, offering world-class amenities and professional instruction for children of all ages. Our state-of-the-art facility provides a safe, engaging, and fun environment where kids can learn, grow, and develop new skills.`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-900 overflow-hidden">
        {heroImage && (
          <img
            src={heroImage}
            alt={business.name}
            className="w-full h-full object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Breadcrumb */}
        <div className="absolute top-6 left-0 right-0">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-sm text-white/90">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <Link href="/categories" className="hover:text-white">Categories</Link>
              <span className="mx-2">›</span>
              <Link href={`/categories/${business.business_type}`} className="hover:text-white capitalize">
                {business.business_type}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-white">{business.name}</span>
            </div>
          </div>
        </div>

        {/* Business Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-6 pb-8">
            <div className="flex items-end justify-between">
              <div className="flex-1">
                {business.tagline && (
                  <p className="text-white/80 text-sm mb-2">{business.tagline}</p>
                )}
                <h1 className="text-4xl font-bold text-white mb-3 animate-fade-in">
                  {business.name}
                </h1>
                <div className="flex items-center gap-4 text-white/90 flex-wrap">
                  <span className="capitalize">{business.business_type}</span>
                  {business.city && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                        </svg>
                        {business.city}
                      </span>
                    </>
                  )}
                  {todayHours && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 bg-emerald-500 px-3 py-1 rounded-full text-white text-sm font-semibold">
                        Open • {todayHours.close ? `Until ${todayHours.close}` : '24 hours'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Rating Badge */}
              {business.google_rating && (
                <div className="bg-white rounded-2xl p-6 shadow-xl animate-slide-up">
                  <div className="text-center">
                    <div className="text-xs font-semibold text-gray-600 mb-1 flex items-center justify-center gap-1">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                      </svg>
                      Verified
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {business.google_rating.toFixed(1)}
                    </div>
                    <div className="flex text-yellow-400 text-sm justify-center my-1">
                      {'★★★★★'.slice(0, Math.round(business.google_rating))}
                    </div>
                    <div className="text-xs text-gray-500">
                      {business.google_review_count || 0} reviews
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                Book Now
              </button>
              {(business.latitude && business.longitude) && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                  </svg>
                  Directions
                </a>
              )}
              <button className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                </svg>
                Share
              </button>
            </div>
            <button className="p-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-red-400 hover:text-red-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About {business.name}
              </h2>
              <div className="text-gray-600 leading-relaxed">
                <p className={!showFullDescription ? 'line-clamp-4' : ''}>
                  {displayDescription}
                </p>
                {displayDescription.length > 200 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-blue-600 font-medium mt-2 hover:text-blue-700"
                  >
                    {showFullDescription ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4">
                {business.phone && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Phone</div>
                      <a href={`tel:${business.phone}`} className="hover:text-blue-600 font-medium">{business.phone}</a>
                    </div>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Email</div>
                      <a href={`mailto:${business.email}`} className="hover:text-blue-600 font-medium truncate block max-w-[200px]">{business.email}</a>
                    </div>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Website</div>
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 font-medium truncate block max-w-[200px]">
                        {business.website.replace('https://', '').replace('http://', '').split('/')[0]}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media */}
              {(business.instagram_url || business.facebook_url || business.twitter_url || business.youtube_url) && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex gap-3">
                    {business.instagram_url && (
                      <a href={business.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      </a>
                    )}
                    {business.facebook_url && (
                      <a href={business.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-600 text-white rounded-lg hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </a>
                    )}
                    {business.twitter_url && (
                      <a href={business.twitter_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-sky-500 text-white rounded-lg hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                      </a>
                    )}
                    {business.youtube_url && (
                      <a href={business.youtube_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-red-600 text-white rounded-lg hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Services Section */}
            {services.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm animate-fade-in" style={{ animationDelay: '50ms' }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Services & Programs</h2>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{service.name}</h3>
                        {(service.price_from || service.price_to) && (
                          <div className="text-right">
                            <div className="text-sm text-gray-500">From</div>
                            <div className="text-lg font-bold text-blue-600">
                              AED {service.price_from || service.price_to}
                            </div>
                          </div>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                      )}
                      <div className="flex gap-4 flex-wrap text-sm text-gray-500">
                        {service.duration_text && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            {service.duration_text}
                          </span>
                        )}
                        {(service.age_min || service.age_max) && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                            Ages {service.age_min || '3'}-{service.age_max || '18'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* The Experience (Features/Amenities) */}
            {allFeatures.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm animate-fade-in" style={{ animationDelay: '100ms' }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">The Experience</h2>
                <div className="flex flex-wrap gap-2">
                  {allFeatures.map((feature, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-default"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Photo Gallery */}
            {galleryImages.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm animate-fade-in" style={{ animationDelay: '150ms' }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Photo Gallery</h2>
                <div className="grid grid-cols-3 gap-4">
                  {galleryImages.map((image, index) => (
                    <div key={index} className="aspect-square rounded-xl overflow-hidden group cursor-pointer bg-gray-100">
                      <img
                        src={image.url}
                        alt={`${business.name} photo ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-start gap-4">
                        {review.author_photo_url ? (
                          <img src={review.author_photo_url} alt={review.author_name} className="w-12 h-12 rounded-full" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                            {review.author_name[0]}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900">{review.author_name}</h4>
                            <div className="flex text-yellow-400 text-sm">
                              {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{review.text}</p>
                          <p className="text-xs text-gray-400">{new Date(review.review_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            <div className="bg-white rounded-2xl p-8 shadow-sm animate-fade-in" style={{ animationDelay: '250ms' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {displayFaqs.map((faq) => (
                  <details key={faq.id} className="group border-b border-gray-100 pb-4">
                    <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-900 py-3 hover:text-blue-600 transition-colors list-none">
                      <span>{faq.question}</span>
                      <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                      </svg>
                    </summary>
                    <p className="text-gray-600 pb-3 pl-4 pr-8">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Opening Hours */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg animate-slide-in-right">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Opening Hours</h3>
                {todayHours && (
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                    {todayHours.close ? `Until ${todayHours.close}` : 'Open 24h'}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {Object.keys(operatingHours).length > 0 ? (
                  daysOfWeek.map((day, index) => {
                    const hours = operatingHours[day];
                    const isToday = day === currentDay;
                    return (
                      <div key={day} className={`flex justify-between items-center ${isToday ? 'bg-white/20 -mx-2 px-2 py-1 rounded-lg' : ''}`}>
                        <span className={`text-sm ${isToday ? 'font-bold' : ''}`}>{dayNames[index]}</span>
                        <span className={`text-sm ${isToday ? 'font-bold' : 'text-white/80'}`}>
                          {hours ? (hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`) : '08:00 - 23:00'}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  dayNames.map((day, index) => {
                    const isToday = daysOfWeek[index] === currentDay;
                    return (
                      <div key={day} className={`flex justify-between items-center ${isToday ? 'bg-white/20 -mx-2 px-2 py-1 rounded-lg' : ''}`}>
                        <span className={`text-sm ${isToday ? 'font-bold' : ''}`}>{day}</span>
                        <span className={`text-sm ${isToday ? 'font-bold' : 'text-white/80'}`}>08:00 - 23:00</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl p-6 shadow-sm animate-slide-in-right" style={{ animationDelay: '100ms' }}>
              <h3 className="font-bold text-gray-900 mb-4">Location</h3>
              {business.address && (
                <p className="text-sm text-gray-600 mb-4 flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                  </svg>
                  <span>{business.address}</span>
                </p>
              )}
              
              {/* Map */}
              {(business.latitude && business.longitude) ? (
                <div className="bg-gray-100 rounded-lg h-48 mb-4 overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_KEY&q=${business.latitude},${business.longitude}`}
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                  </svg>
                </div>
              )}
              
              {(business.latitude && business.longitude) && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                  </svg>
                  Get Directions
                </a>
              )}
            </div>

            {/* Info Cards */}
            {business.parking_info && (
              <div className="bg-blue-50 rounded-2xl p-6 animate-slide-in-right" style={{ animationDelay: '150ms' }}>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Parking</h4>
                    <p className="text-sm text-gray-600">{business.parking_info}</p>
                  </div>
                </div>
              </div>
            )}

            {business.payment_methods && business.payment_methods.length > 0 && (
              <div className="bg-green-50 rounded-2xl p-6 animate-slide-in-right" style={{ animationDelay: '200ms' }}>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Payment Methods</h4>
                    <p className="text-sm text-gray-600">{business.payment_methods.join(', ')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
