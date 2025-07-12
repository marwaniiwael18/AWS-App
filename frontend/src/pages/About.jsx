import React from 'react';
import { HeartIcon, UserGroupIcon, RocketLaunchIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const About = () => {
  const team = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Co-Founder',
      bio: 'Former educator passionate about democratizing learning',
      image: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=22c55e&color=fff&size=80'
    },
    {
      name: 'Marcus Johnson',
      role: 'CTO & Co-Founder',
      bio: 'Full-stack developer with expertise in scalable platforms',
      image: 'https://ui-avatars.com/api/?name=Marcus+Johnson&background=a855f7&color=fff&size=80'
    },
    {
      name: 'Elena Rodriguez',
      role: 'Head of Community',
      bio: 'Community builder fostering inclusive learning environments',
      image: 'https://ui-avatars.com/api/?name=Elena+Rodriguez&background=f97316&color=fff&size=80'
    },
    {
      name: 'David Kim',
      role: 'Lead Designer',
      bio: 'UX/UI designer creating intuitive learning experiences',
      image: 'https://ui-avatars.com/api/?name=David+Kim&background=3b82f6&color=fff&size=80'
    }
  ];

  const values = [
    {
      icon: HeartIcon,
      title: 'Community First',
      description: 'We believe in the power of community-driven learning and mutual support.'
    },
    {
      icon: UserGroupIcon,
      title: 'Inclusive Learning',
      description: 'Everyone deserves access to knowledge, regardless of background or location.'
    },
    {
      icon: RocketLaunchIcon,
      title: 'Innovation',
      description: 'We continuously innovate to make learning more effective and engaging.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Impact',
      description: 'Our mission is to create positive change through worldwide skill sharing.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="text-5xl font-bold mb-6">
            About <span className="text-gradient">SkillSwap</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-4xl mx-auto leading-relaxed">
            We're on a mission to democratize learning by connecting people who want to share knowledge and skills. 
            SkillSwap was born from the belief that everyone has something valuable to teach and learn.
          </p>
        </div>

        {/* Story Section */}
        <div className="card mb-20 animate-slide-up">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-neutral-800 mb-6">Our Story</h2>
              <div className="space-y-4 text-neutral-600">
                <p>
                  SkillSwap started in 2023 when our founders realized that traditional education wasn't keeping pace 
                  with the rapidly changing world. They saw talented individuals with valuable skills who had no 
                  platform to share their knowledge, while others struggled to find affordable, personalized learning.
                </p>
                <p>
                  What began as a simple idea - "What if learning could be a two-way exchange?" - has grown into a 
                  global community of learners, teachers, and skill enthusiasts who believe in the power of 
                  collaborative education.
                </p>
                <p>
                  Today, SkillSwap connects thousands of learners worldwide, facilitating millions of learning 
                  exchanges and proving that the best way to learn is often to teach.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-80 bg-gradient-primary rounded-2xl flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🌟</div>
                  <h3 className="text-2xl font-bold">10,000+</h3>
                  <p>Active Learners</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-neutral-800 mb-12 animate-slide-up">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="card text-center hover:shadow-strong transition-all duration-300 hover:scale-105 animate-slide-up floating-element"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-3">{value.title}</h3>
                <p className="text-neutral-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-neutral-800 mb-12 animate-slide-up">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="card text-center hover:shadow-strong transition-all duration-300 hover:scale-105 animate-slide-up floating-element"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4"
                />
                <h3 className="text-xl font-bold text-neutral-800 mb-1">{member.name}</h3>
                <p className="text-primary-600 font-medium mb-3">{member.role}</p>
                <p className="text-neutral-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="card-gradient text-center animate-slide-up">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Mission
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Be part of a global community that's changing how we learn and grow together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-secondary">
              Start Learning Today
            </button>
            <button className="btn-accent">
              Become a Teacher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 