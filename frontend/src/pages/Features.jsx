import React from 'react';
import { 
  SparklesIcon, 
  UserGroupIcon, 
  ChatBubbleLeftRightIcon, 
  StarIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  HeartIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Features = () => {
  const features = [
    {
      icon: SparklesIcon,
      title: 'Smart Matching',
      description: 'Our AI-powered algorithm matches you with the perfect learning partners based on your skills and interests.',
      color: 'bg-gradient-primary'
    },
    {
      icon: UserGroupIcon,
      title: 'Skill Exchange',
      description: 'Connect with a diverse community of learners and share your expertise while gaining new skills.',
      color: 'bg-gradient-secondary'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Real-time Chat',
      description: 'Communicate seamlessly with your learning partners through our integrated messaging system.',
      color: 'bg-gradient-to-br from-accent-500 to-accent-600'
    },
    {
      icon: StarIcon,
      title: 'Rating System',
      description: 'Build trust in our community with transparent ratings and reviews from fellow learners.',
      color: 'bg-gradient-to-br from-yellow-500 to-orange-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Platform',
      description: 'Your data and conversations are protected with enterprise-grade security measures.',
      color: 'bg-gradient-to-br from-green-500 to-teal-500'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics and achievement badges.',
      color: 'bg-gradient-to-br from-purple-500 to-pink-500'
    },
    {
      icon: HeartIcon,
      title: 'Community Support',
      description: 'Join a supportive community where everyone helps each other grow and succeed.',
      color: 'bg-gradient-to-br from-red-500 to-rose-500'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Reach',
      description: 'Connect with learners from around the world and expand your cultural horizons.',
      color: 'bg-gradient-to-br from-blue-500 to-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl font-bold mb-6">
            <span className="text-gradient">Features</span> that Make Learning Amazing
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Discover the powerful tools and features that make SkillSwap the best platform for skill exchange and collaborative learning.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card hover:shadow-strong transition-all duration-300 hover:scale-105 animate-slide-up floating-element"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 ${feature.color} rounded-full flex items-center justify-center mb-4 shadow-glow`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="card-gradient text-center animate-slide-up animation-delay-800">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already exchanging skills and growing together on SkillSwap.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-secondary">
              Get Started Free
            </button>
            <button className="btn-accent">
              View Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features; 