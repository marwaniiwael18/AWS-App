import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSkill } from '../contexts/SkillContext';
import AuthModal from './AuthModal';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { userProfile } = useSkill();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // Show loading state could be added here if needed
      await signOut();
      // The signOut function now handles the redirect
    } catch (error) {
      console.error('Error signing out:', error);
      // Still redirect even if there's an error
      window.location.href = '/';
    }
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard', authRequired: true },
    { name: 'Matches', href: '/matches', authRequired: true },
    { name: 'Profile', href: '/profile', authRequired: true },
    { name: 'Chat', href: '/chat', authRequired: true },
  ];

  const isActiveLink = (href) => location.pathname === href;

  // Get user display info
  const userDisplayName = userProfile?.name || user?.attributes?.name || user?.name || 'User';
  const userEmail = userProfile?.email || user?.attributes?.email || user?.email || '';
  const userPhoto = userProfile?.profilePhoto || null;

  return (
    <>
      <nav className="glass-navbar fixed top-0 w-full z-50 transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow-primary group-hover:shadow-glow-secondary transition-all duration-300">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gradient">SkillSwap</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                if (item.authRequired && !user) return null;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative px-3 py-2 font-medium transition-all duration-300 ${
                      isActiveLink(item.href)
                        ? 'text-primary-600'
                        : 'text-neutral-700 hover:text-primary-600'
                    }`}
                  >
                    {item.name}
                    {isActiveLink(item.href) && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-primary rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/settings" className="btn-ghost">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-neutral-100 transition-all duration-300">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-primary flex items-center justify-center">
                        {userPhoto ? (
                          <img
                            src={userPhoto.startsWith('http') ? userPhoto : `http://localhost:3000${userPhoto}`}
                            alt={userDisplayName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center text-white text-sm font-medium ${userPhoto ? 'hidden' : 'flex'}`}>
                          {userDisplayName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-strong border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div className="p-3 border-b border-neutral-200">
                        <div className="font-medium text-neutral-900">{userDisplayName}</div>
                        <div className="text-sm text-neutral-600">{userEmail}</div>
                      </div>
                      <div className="py-2">
                        <Link to="/profile" className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors duration-200">
                          My Profile
                        </Link>
                        <Link to="/settings" className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors duration-200">
                          Settings
                        </Link>
                        <button
                          onClick={() => handleLogout()}
                          className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="btn-primary"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-white/20 animate-slide-down">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                if (item.authRequired && !user) return null;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      isActiveLink(item.href)
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              
              {user && (
                <div className="border-t border-neutral-200 pt-4 mt-4">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-primary flex items-center justify-center">
                      {userPhoto ? (
                        <img
                          src={userPhoto.startsWith('http') ? userPhoto : `http://localhost:3000${userPhoto}`}
                          alt={userDisplayName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center text-white font-medium ${userPhoto ? 'hidden' : 'flex'}`}>
                        {userDisplayName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900">{userDisplayName}</div>
                      <div className="text-sm text-neutral-600">{userEmail}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              )}
              
              {!user && (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="btn-primary w-full"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default Navbar; 