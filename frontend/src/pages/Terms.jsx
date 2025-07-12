import React from 'react';
import { DocumentTextIcon, ScaleIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const Terms = () => {
  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      content: [
        'By accessing and using SkillSwap, you accept and agree to be bound by these terms',
        'If you do not agree to these terms, please do not use our service',
        'We may update these terms from time to time with notice to users',
        'Continued use after changes constitutes acceptance of new terms'
      ]
    },
    {
      id: 'service-description',
      title: 'Service Description',
      content: [
        'SkillSwap is a platform for connecting individuals who want to exchange skills and knowledge',
        'We facilitate introductions and provide communication tools',
        'We do not guarantee the quality or outcomes of any skill exchanges',
        'Users are responsible for their own learning experiences and arrangements'
      ]
    },
    {
      id: 'user-responsibilities',
      title: 'User Responsibilities',
      content: [
        'Provide accurate and truthful information in your profile',
        'Treat other users with respect and maintain professional conduct',
        'Do not share inappropriate, offensive, or harmful content',
        'Respect intellectual property rights and confidentiality',
        'Report any suspicious or inappropriate behavior to our team'
      ]
    },
    {
      id: 'prohibited-activities',
      title: 'Prohibited Activities',
      content: [
        'Creating fake or misleading profiles',
        'Harassment, bullying, or discriminatory behavior',
        'Sharing personal contact information publicly',
        'Commercial solicitation or spam',
        'Attempting to bypass security measures or hack the platform'
      ]
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      content: [
        'Users retain ownership of content they create and share',
        'By posting content, you grant us a license to display and distribute it on our platform',
        'Respect others\' intellectual property rights and don\'t share copyrighted material without permission',
        'Our platform, design, and code remain our intellectual property'
      ]
    },
    {
      id: 'privacy-data',
      title: 'Privacy and Data',
      content: [
        'Your privacy is governed by our Privacy Policy',
        'We collect and use data as described in our Privacy Policy',
        'You can control your privacy settings and data sharing preferences',
        'We implement security measures to protect your information'
      ]
    },
    {
      id: 'disclaimers',
      title: 'Disclaimers',
      content: [
        'SkillSwap is provided "as is" without warranties of any kind',
        'We do not guarantee uninterrupted or error-free service',
        'We are not responsible for user-generated content or interactions',
        'Users engage in skill exchanges at their own risk'
      ]
    },
    {
      id: 'limitation-liability',
      title: 'Limitation of Liability',
      content: [
        'Our liability is limited to the maximum extent permitted by law',
        'We are not liable for indirect, incidental, or consequential damages',
        'Our total liability shall not exceed the amount paid by you for our services',
        'Some jurisdictions may not allow these limitations'
      ]
    },
    {
      id: 'termination',
      title: 'Account Termination',
      content: [
        'You may delete your account at any time through your settings',
        'We may suspend or terminate accounts that violate these terms',
        'Upon termination, your access to the service will cease',
        'Some data may be retained as required by law or our policies'
      ]
    },
    {
      id: 'governing-law',
      title: 'Governing Law',
      content: [
        'These terms are governed by the laws of [Your Jurisdiction]',
        'Disputes will be resolved through binding arbitration',
        'You waive the right to participate in class action lawsuits',
        'Any legal proceedings must be filed in [Your Jurisdiction]'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-secondary">
            <DocumentTextIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6">
            Terms of <span className="text-gradient">Service</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            These terms govern your use of SkillSwap. Please read them carefully to understand your rights and responsibilities.
          </p>
          <div className="mt-6 text-sm text-neutral-500">
            Last updated: December 2024
          </div>
        </div>

        {/* Key Points */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card text-center animate-slide-up">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 mb-2">Fair Use</h3>
            <p className="text-neutral-600 text-sm">Use our platform respectfully and help create a positive learning environment.</p>
          </div>
          <div className="card text-center animate-slide-up animation-delay-200">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ScaleIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 mb-2">Your Rights</h3>
            <p className="text-neutral-600 text-sm">Understand your rights and how we protect your interests on our platform.</p>
          </div>
          <div className="card text-center animate-slide-up animation-delay-400">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 mb-2">Important Limits</h3>
            <p className="text-neutral-600 text-sm">Learn about prohibited activities and our liability limitations.</p>
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
                      <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2 flex-shrink-0"></div>
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
                  Questions About These Terms?
                </h2>
                <p className="text-white/90 mb-6">
                  If you have any questions about these terms of service or need clarification on any point, please contact us.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="btn-secondary">
                    Contact Legal Team
                  </button>
                  <button className="btn-accent">
                    Report a Problem
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

export default Terms; 