import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20">
        <div className="absolute inset-0 bg-gradient-mesh opacity-10"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              <span className="text-gradient">Share Skills,</span>
              <br />
              <span className="text-gradient-secondary">Build Community</span>
            </h1>
            <p className="text-xl text-neutral-600 mb-8 animate-fade-in animation-delay-200 text-balance">
              Connect with passionate learners and skilled experts. Exchange knowledge,
              grow together, and build lasting relationships through skill sharing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animation-delay-400">
              {user ? (
                <Link to="/dashboard" className="btn-primary">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn-primary">
                    Get Started
                  </Link>
                  <Link to="/about" className="btn-secondary">
                    Learn More
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animation-delay-400"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animation-delay-800"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
              Why Choose SkillSwap?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Discover the power of collaborative learning and skill exchange
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card floating-element animate-slide-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${feature.iconBg}`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-neutral-800">{feature.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-primary-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient-secondary">
              How It Works
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Simple steps to start your skill-sharing journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow-primary">
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary-300 to-secondary-300 transform -translate-x-1/2"></div>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-neutral-800">{step.title}</h3>
                <p className="text-neutral-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-4xl font-bold text-gradient mb-2">{stat.number}</div>
                <div className="text-neutral-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of learners and experts who are already sharing skills and building connections.
          </p>
          {!user && (
            <Link to="/login" className="btn-secondary">
              Join SkillSwap Today
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

// Feature icons (using simple SVG icons for now)
const HeartIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
  </svg>
);

const StarIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const features = [
  {
    title: "Smart Matching",
    description: "Our AI-powered system matches you with the perfect learning partners based on your skills and interests.",
    icon: HeartIcon,
    iconBg: "bg-gradient-primary"
  },
  {
    title: "Community Driven",
    description: "Join a vibrant community of learners and experts who are passionate about sharing knowledge.",
    icon: UsersIcon,
    iconBg: "bg-gradient-secondary"
  },
  {
    title: "Quality Assured",
    description: "All skills and exchanges are verified through our rating system and community feedback.",
    icon: StarIcon,
    iconBg: "bg-gradient-to-br from-accent-500 to-accent-600"
  }
];

const steps = [
  {
    title: "Create Profile",
    description: "Sign up and showcase your skills and learning interests"
  },
  {
    title: "Find Matches",
    description: "Discover perfect learning partners in your area"
  },
  {
    title: "Connect & Chat",
    description: "Start conversations and plan your skill exchange"
  },
  {
    title: "Share & Learn",
    description: "Exchange knowledge and grow together"
  }
];

const stats = [
  { number: "10K+", label: "Active Users" },
  { number: "50K+", label: "Skills Shared" },
  { number: "25K+", label: "Successful Matches" },
  { number: "4.9", label: "Average Rating" }
];

export default Home; 