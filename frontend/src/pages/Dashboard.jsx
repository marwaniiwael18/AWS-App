import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSkill } from '../contexts/SkillContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { userProfile, matches } = useSkill();

  // Safely get skills with fallbacks
  const skillsOffered = userProfile?.skillsOffered || [];
  const skillsWanted = userProfile?.skillsWanted || [];
  
  // Calculate active matches (accepted matches)
  const activeMatches = matches.filter(match => match.status === 'accepted').length;
  
  // Calculate messages (simulate based on active matches + some variation)
  const messageCount = activeMatches > 0 ? Math.min(activeMatches * 3 + Math.floor(Math.random() * 5), 25) : 0;

  const dashboardStats = [
    {
      label: 'Skills Offered',
      value: skillsOffered.length,
      icon: '🎯',
      color: 'bg-gradient-primary',
      textColor: 'text-white'
    },
    {
      label: 'Skills Wanted',
      value: skillsWanted.length,
      icon: '🌟',
      color: 'bg-gradient-secondary',
      textColor: 'text-white'
    },
    {
      label: 'Active Matches',
      value: activeMatches,
      icon: '🤝',
      color: 'bg-gradient-to-br from-accent-500 to-accent-600',
      textColor: 'text-white'
    },
    {
      label: 'Messages',
      value: messageCount,
      icon: '💬',
      color: 'bg-white border-2 border-neutral-200',
      textColor: 'text-neutral-800'
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'match',
      title: 'New match found!',
      description: 'Sarah wants to learn React and can teach Spanish',
      time: '2 hours ago',
      icon: '🎉',
      color: 'bg-primary-100 text-primary-800'
    },
    {
      id: 2,
      type: 'message',
      title: 'Message from Alex',
      description: 'Ready to start our guitar lessons?',
      time: '5 hours ago',
      icon: '📩',
      color: 'bg-secondary-100 text-secondary-800'
    },
    {
      id: 3,
      type: 'skill',
      title: 'Skill updated',
      description: 'You added Python to your skill list',
      time: '1 day ago',
      icon: '✨',
      color: 'bg-accent-100 text-accent-800'
    },
  ];

  const quickActions = [
    {
      title: 'Find New Matches',
      description: 'Discover people to exchange skills with',
      icon: '🔍',
      color: 'bg-gradient-primary',
      link: '/matches'
    },
    {
      title: 'Update Profile',
      description: 'Edit your skills and preferences',
      icon: '👤',
      color: 'bg-gradient-secondary',
      link: '/profile'
    },
    {
      title: 'Start Chatting',
      description: 'Connect with your matches',
      icon: '💬',
      color: 'bg-gradient-to-br from-accent-500 to-accent-600',
      link: '/chat'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="text-gradient">{userProfile?.name || user?.name || user?.email || 'User'}</span>! 👋
          </h1>
          <p className="text-lg text-neutral-600">
            Ready to share knowledge and learn something new today?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.color} ${stat.textColor} rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 animate-slide-up floating-element`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="text-3xl opacity-80">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="card animate-slide-up animation-delay-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-800">Quick Actions</h2>
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow-primary">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="group relative p-6 rounded-xl bg-white border-2 border-neutral-100 hover:border-transparent transition-all duration-300 hover:shadow-medium hover:scale-105"
                  >
                    <div className={`absolute inset-0 ${action.color} opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300`}></div>
                    <div className="relative z-10">
                      <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">
                        {action.icon}
                      </div>
                      <h3 className="font-semibold text-neutral-800 group-hover:text-white transition-colors duration-300">
                        {action.title}
                      </h3>
                      <p className="text-sm text-neutral-600 group-hover:text-white/90 transition-colors duration-300">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="card animate-slide-up animation-delay-400">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-800">Recent Activity</h2>
                <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center shadow-glow-secondary">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors duration-200 animate-slide-left"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${activity.color}`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-800 text-sm">
                        {activity.title}
                      </p>
                      <p className="text-neutral-600 text-xs truncate">
                        {activity.description}
                      </p>
                      <p className="text-neutral-500 text-xs mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <Link
                  to="/activity"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center transition-colors duration-200"
                >
                  View all activity
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Overview */}
        <div className="mt-8 animate-slide-up animation-delay-600">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-800">Your Skills</h2>
              <Link
                to="/profile"
                className="btn-secondary"
              >
                Manage Skills
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Skills You Offer */}
              <div>
                <h3 className="font-semibold text-neutral-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                  Skills You Offer ({skillsOffered.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillsOffered.length > 0 ? (
                    <>
                      {skillsOffered.slice(0, 6).map((skill, index) => (
                        <span
                          key={index}
                          className="skill-tag animate-bounce-gentle"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {skill}
                        </span>
                      ))}
                      {skillsOffered.length > 6 && (
                        <span className="skill-tag bg-neutral-100 text-neutral-600">
                          +{skillsOffered.length - 6} more
                        </span>
                      )}
                    </>
                  ) : (
                    <p className="text-neutral-500 text-sm italic">No skills added yet. Add some skills to get started!</p>
                  )}
                </div>
              </div>

              {/* Skills You Want */}
              <div>
                <h3 className="font-semibold text-neutral-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-secondary-500 rounded-full mr-2"></span>
                  Skills You Want ({skillsWanted.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillsWanted.length > 0 ? (
                    <>
                      {skillsWanted.slice(0, 6).map((skill, index) => (
                        <span
                          key={index}
                          className="skill-tag-secondary animate-bounce-gentle"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {skill}
                        </span>
                      ))}
                      {skillsWanted.length > 6 && (
                        <span className="skill-tag-secondary bg-neutral-100 text-neutral-600">
                          +{skillsWanted.length - 6} more
                        </span>
                      )}
                    </>
                  ) : (
                    <p className="text-neutral-500 text-sm italic">No learning goals yet. Add skills you want to learn!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-8 animate-slide-up animation-delay-800">
          <div className="card-gradient">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Keep Learning! 🚀</h2>
              <p className="text-white/90 mb-6">
                You're doing great! Continue building connections and sharing knowledge.
              </p>
              <div className="flex justify-center space-x-4">
                <Link to="/matches" className="btn-secondary">
                  Find More Matches
                </Link>
                <Link to="/profile" className="btn-accent">
                  Update Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 