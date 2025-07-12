import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserIcon, 
  SparklesIcon, 
  ChatBubbleLeftRightIcon, 
  PlusIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useSkill } from '../contexts/SkillContext';
import { useAuth } from '../contexts/AuthContext';
import SkillTag from '../components/SkillTag';
import MatchCard from '../components/MatchCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { userProfile, potentialMatches, loading, findMatches } = useSkill();
  const { user, signOut } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  useEffect(() => {
    if (userProfile) {
      findMatches();
    }
  }, [userProfile]);

  if (loading && !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const stats = [
    {
      title: 'Skills Offered',
      value: userProfile?.skillsOffered?.length || 0,
      icon: SparklesIcon,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      title: 'Skills Learning',
      value: userProfile?.skillsWanted?.length || 0,
      icon: UserIcon,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50',
    },
    {
      title: 'Active Matches',
      value: potentialMatches?.length || 0,
      icon: ChatBubbleLeftRightIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  const quickActions = [
    {
      title: 'Update Profile',
      description: 'Edit your skills and bio',
      icon: UserIcon,
      link: '/profile',
      color: 'primary',
    },
    {
      title: 'Find Matches',
      description: 'Discover new skill partners',
      icon: SparklesIcon,
      link: '/matches',
      color: 'secondary',
    },
    {
      title: 'Start Chat',
      description: 'Message your matches',
      icon: ChatBubbleLeftRightIcon,
      link: '/chat',
      color: 'green',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {greeting}, {userProfile?.name || 'there'}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Ready to learn something new or teach a skill today?
              </p>
            </div>
            <button
              onClick={signOut}
              className="btn-secondary"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Profile Summary</h2>
                <Link to="/profile" className="btn-secondary text-sm">
                  Edit Profile
                </Link>
              </div>
              
              {userProfile ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-8 w-8 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{userProfile.name}</h3>
                      <p className="text-gray-600">{userProfile.email}</p>
                      <div className="flex items-center mt-1">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-500">{userProfile.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600">{userProfile.bio}</p>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIconSolid
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(userProfile.rating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {userProfile.rating} ({userProfile.totalRatings} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Complete your profile to get started</p>
                  <Link to="/profile" className="btn-primary mt-4">
                    Create Profile
                  </Link>
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Skills</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Skills You Offer</h3>
                  <div className="flex flex-wrap gap-2">
                    {userProfile?.skillsOffered?.map((skill, index) => (
                      <SkillTag key={index} skill={skill} type="offered" />
                    ))}
                    {(!userProfile?.skillsOffered || userProfile.skillsOffered.length === 0) && (
                      <p className="text-gray-500 text-sm">No skills added yet</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Skills You Want to Learn</h3>
                  <div className="flex flex-wrap gap-2">
                    {userProfile?.skillsWanted?.map((skill, index) => (
                      <SkillTag key={index} skill={skill} type="wanted" />
                    ))}
                    {(!userProfile?.skillsWanted || userProfile.skillsWanted.length === 0) && (
                      <p className="text-gray-500 text-sm">No skills added yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`p-2 rounded-lg mr-3 ${
                      action.color === 'primary' ? 'bg-primary-100' :
                      action.color === 'secondary' ? 'bg-secondary-100' :
                      'bg-green-100'
                    }`}>
                      <action.icon className={`h-5 w-5 ${
                        action.color === 'primary' ? 'text-primary-600' :
                        action.color === 'secondary' ? 'text-secondary-600' :
                        'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-primary-600">
                        {action.title}
                      </p>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Matches */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recent Matches</h2>
                <Link to="/matches" className="text-primary-600 hover:text-primary-700 text-sm">
                  View All
                </Link>
              </div>
              
              <div className="space-y-4">
                {potentialMatches.slice(0, 3).map((match, index) => (
                  <MatchCard key={index} match={match} compact />
                ))}
                
                {potentialMatches.length === 0 && (
                  <div className="text-center py-4">
                    <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No matches yet</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Update your skills to find matches
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 