import React from 'react';
import { ShieldCheckIcon, EyeIcon, LockClosedIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const Privacy = () => {
  const sections = [
    {
      id: 'information-collection',
      title: 'Information We Collect',
      content: [
        'Personal information you provide when creating an account (name, email, profile details)',
        'Skills and learning preferences you add to your profile',
        'Messages and communications with other users',
        'Usage data and analytics to improve our service',
        'Device information and IP addresses for security purposes'
      ]
    },
    {
      id: 'information-use',
      title: 'How We Use Your Information',
      content: [
        'Matching you with suitable learning partners based on your skills and interests',
        'Facilitating communication between users through our platform',
        'Improving our services and developing new features',
        'Sending you important updates about your account and our service',
        'Ensuring the security and safety of our platform'
      ]
    },
    {
      id: 'information-sharing',
      title: 'Information Sharing',
      content: [
        'We never sell your personal information to third parties',
        'Profile information is visible to other users for matching purposes',
        'We may share data with service providers who help us operate our platform',
        'Legal authorities may receive information if required by law',
        'Anonymized, aggregated data may be used for research and analytics'
      ]
    },
    {
      id: 'data-security',
      title: 'Data Security',
      content: [
        'All data is encrypted in transit and at rest using industry-standard protocols',
        'Regular security audits and vulnerability assessments',
        'Multi-factor authentication available for all accounts',
        'Secure data centers with 24/7 monitoring',
        'Regular backup and disaster recovery procedures'
      ]
    },
    {
      id: 'your-rights',
      title: 'Your Rights',
      content: [
        'Access and download your personal data at any time',
        'Correct or update your information through your profile settings',
        'Delete your account and associated data',
        'Control what information is visible to other users',
        'Opt out of marketing communications'
      ]
    },
    {
      id: 'cookies',
      title: 'Cookies and Tracking',
      content: [
        'Essential cookies for basic platform functionality',
        'Analytics cookies to understand how our service is used',
        'Preference cookies to remember your settings',
        'You can control cookie settings through your browser',
        'Third-party integrations may use their own cookies'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-primary">
            <ShieldCheckIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6">
            Privacy <span className="text-gradient">Policy</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information when you use SkillSwap.
          </p>
          <div className="mt-6 text-sm text-neutral-500">
            Last updated: December 2024
          </div>
        </div>

        {/* Privacy Highlights */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card text-center animate-slide-up">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <LockClosedIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 mb-2">Data Protection</h3>
            <p className="text-neutral-600 text-sm">Your data is encrypted and protected with enterprise-grade security.</p>
          </div>
          <div className="card text-center animate-slide-up animation-delay-200">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <EyeIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 mb-2">Transparency</h3>
            <p className="text-neutral-600 text-sm">We're clear about what data we collect and how it's used.</p>
          </div>
          <div className="card text-center animate-slide-up animation-delay-400">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 mb-2">Your Control</h3>
            <p className="text-neutral-600 text-sm">You have full control over your data and privacy settings.</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24 animate-slide-up animation-delay-300">
              <h3 className="font-bold text-neutral-800 mb-4">Table of Contents</h3>
              <nav className="space-y-2">
                {sections.map((section, index) => (
                  <a
                    key={index}
                    href={`#${section.id}`}
                    className="block text-sm text-neutral-600 hover:text-primary-600 transition-colors duration-200"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-12">
            {sections.map((section, index) => (
              <div
                key={index}
                id={section.id}
                className="card animate-slide-up"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <h2 className="text-2xl font-bold text-neutral-800 mb-6">
                  {section.title}
                </h2>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-neutral-600 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact Section */}
            <div className="card-gradient animate-slide-up">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Questions About Privacy?
                </h2>
                <p className="text-white/90 mb-6">
                  If you have any questions about this privacy policy or how we handle your data, don't hesitate to reach out.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="btn-secondary">
                    Contact Privacy Team
                  </button>
                  <button className="btn-accent">
                    View Data Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy; 