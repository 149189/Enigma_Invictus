'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Menu, X, User as UserIcon } from 'lucide-react';

const Header = ({ user, isLoading }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-2 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              CommunityFund
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`font-medium transition-all duration-200 hover:text-emerald-600 ${
                isActive('/') ? 'text-emerald-600 border-b-2 border-emerald-600 pb-1' : 'text-gray-700'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/projects" 
              className={`font-medium transition-all duration-200 hover:text-emerald-600 ${
                isActive('/projects') ? 'text-emerald-600 border-b-2 border-emerald-600 pb-1' : 'text-gray-700'
              }`}
            >
              Projects
            </Link>
            <Link 
              href="/submit" 
              className={`font-medium transition-all duration-200 hover:text-emerald-600 ${
                isActive('/submit') ? 'text-emerald-600 border-b-2 border-emerald-600 pb-1' : 'text-gray-700'
              }`}
            >
              Submit Project
            </Link>
            {user && (
              <Link 
                href="/dashboard" 
                className={`font-medium transition-all duration-200 hover:text-emerald-600 ${
                  isActive('/dashboard') ? 'text-emerald-600 border-b-2 border-emerald-600 pb-1' : 'text-gray-700'
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* User Profile */}
          <div className="hidden md:flex items-center space-x-4">
    {isLoading ? (
      <div className="animate-pulse bg-gray-200 rounded-full p-2 pr-4">
        <div className="w-8 h-8 rounded-full bg-gray-300"></div>
      </div>
    ) : user ? (
      <div className="flex items-center space-x-3 bg-emerald-50 rounded-full p-2 pr-4 hover:bg-emerald-100 transition-colors duration-200">
        <img 
          src={user.avatar} 
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-sm font-medium text-emerald-800">{user.name}</span>
      </div>
    ) : (
      <Link href="/login" className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700 transition-all duration-200 hover:scale-105">
        <UserIcon className="w-4 h-4" />
        <span>Sign In</span>
      </Link>
    )}
  </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-fadeIn">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className={`font-medium transition-colors duration-200 ${
                  isActive('/') ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/projects" 
                className={`font-medium transition-colors duration-200 ${
                  isActive('/projects') ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Projects
              </Link>
              <Link 
                href="/submit" 
                className={`font-medium transition-colors duration-200 ${
                  isActive('/submit') ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Submit Project
              </Link>
              {user && (
                <Link 
                  href="/dashboard" 
                  className={`font-medium transition-colors duration-200 ${
                    isActive('/dashboard') ? 'text-emerald-600' : 'text-gray-700 hover:text-emerald-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
            </nav>
            {user && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
