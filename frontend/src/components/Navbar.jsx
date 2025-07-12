import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserIcon, 
  SparklesIcon, 
  ChatBubbleLeftRightIcon,
  HomeIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    ...(user ? [
      { name: 'Dashboard', href: '/dashboard', icon: SparklesIcon },
      { name: 'Profile', href: '/profile', icon: UserIcon },
      { name: 'Matches', href: '/matches', icon: SparklesIcon },
      { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
      { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
    ] : []),
  ];

  const isCurrentPath = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
                      <SparklesIcon className="h-8 w-8 text-primary-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">SkillSwap</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isCurrentPath(item.href)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </Link>
            ))}
            {user && (
              <button
                onClick={signOut}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
                      <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isCurrentPath(item.href)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
            {user && (
              <button
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors w-full"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 