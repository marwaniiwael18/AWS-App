import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowRightIcon, SparklesIcon, UserGroupIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';

const Home = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const features = [
    {
      icon: UserGroupIcon,
      title: 'Find Perfect Matches',
      description: 'Connect with people who have the skills you want to learn and want to learn what you can teach.',
    },
    {
      icon: SparklesIcon,
      title: 'Smart Algorithm',
      description: 'Our intelligent matching system finds the best skill exchange opportunities based on your preferences.',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Real-time Chat',
      description: 'Communicate with your matches through our built-in messaging system to coordinate learning sessions.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Frontend Developer',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=0ea5e9&color=fff&size=150',
      quote: 'I learned Spanish while teaching React. SkillSwap made it so easy to find the perfect language exchange partner!',
    },
    {
      name: 'Carlos Rodriguez',
      role: 'Musician',
      avatar: 'https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=0ea5e9&color=fff&size=150',
      quote: 'Teaching guitar while learning web development has been an amazing experience. The community is fantastic!',
    },
    {
      name: 'Emily Chen',
      role: 'Designer',
      avatar: 'https://ui-avatars.com/api/?name=Emily+Chen&background=0ea5e9&color=fff&size=150',
      quote: 'SkillSwap connected me with amazing photographers while I shared my design skills. Win-win!',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Learn. Teach. <span className="text-primary-600">Connect.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The platform where knowledge meets opportunity. Share your skills, learn from others, 
              and build meaningful connections in a community of lifelong learners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="btn-primary inline-flex items-center px-8 py-3 text-lg"
                >
                  Go to Dashboard
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="btn-primary inline-flex items-center px-8 py-3 text-lg"
                  >
                    Get Started Free
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </button>
                  <Link
                    to="#features"
                    className="btn-secondary inline-flex items-center px-8 py-3 text-lg"
                  >
                    Learn More
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How SkillSwap Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to find, connect, and learn from people in your community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">10K+</div>
              <div className="text-gray-600">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">Skills Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">25K+</div>
              <div className="text-gray-600">Successful Matches</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Community Says
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real stories from real people who've transformed their lives through skill sharing.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card text-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of learners and teachers who are already making the most of their skills.
          </p>
          {user ? (
            <Link
              to="/dashboard"
              className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg inline-flex items-center text-lg transition-colors duration-200"
            >
              Go to Dashboard
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg inline-flex items-center text-lg transition-colors duration-200"
            >
              Join SkillSwap Today
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </button>
          )}
        </div>
      </section>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default Home; 