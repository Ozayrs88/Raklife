'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center gap-6">
              <a href="tel:+97172345678" className="flex items-center gap-2 hover:text-blue-100 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                +971 7 234 5678
              </a>
              <a href="mailto:info@raklife.ae" className="flex items-center gap-2 hover:text-blue-100 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                info@raklife.ae
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-blue-100 transition-colors">List Your Business</a>
              <span className="text-blue-300">|</span>
              <Link href="/login" className="hover:text-blue-100 transition-colors">Login</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 tracking-tight">RAKlife</div>
              <div className="text-xs text-gray-500 -mt-1">Kids Activities in RAK</div>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for activities, sports, classes..."
                className="w-full px-5 py-3 pl-12 pr-24 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <button className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/categories" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Categories
            </Link>
            <Link href="/view-businesses" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              All Activities
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Contact
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-3">
              <Link href="/categories" className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2">
                Categories
              </Link>
              <Link href="/view-businesses" className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2">
                All Activities
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2">
                Contact
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Quick Categories Bar */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
            <Link href="/categories/sports" className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all whitespace-nowrap">
              <span className="text-xl">⚽</span>
              <span className="text-sm font-medium text-gray-700">Sports</span>
            </Link>
            <Link href="/categories/education" className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all whitespace-nowrap">
              <span className="text-xl">📚</span>
              <span className="text-sm font-medium text-gray-700">Education</span>
            </Link>
            <Link href="/categories/entertainment" className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all whitespace-nowrap">
              <span className="text-xl">🎪</span>
              <span className="text-sm font-medium text-gray-700">Entertainment</span>
            </Link>
            <Link href="/categories/health" className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:shadow-md transition-all whitespace-nowrap">
              <span className="text-xl">🧘</span>
              <span className="text-sm font-medium text-gray-700">Health</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
