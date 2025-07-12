import React, { useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for getting started',
      price: { monthly: 0, annual: 0 },
      color: 'border-neutral-200',
      buttonClass: 'btn-ghost',
      features: [
        'Up to 3 skill matches per month',
        'Basic messaging',
        'Community access',
        'Profile creation',
        'Basic search filters'
      ],
      limitations: [
        'Limited to 3 active conversations',
        'No priority support',
        'Basic analytics only'
      ]
    },
    {
      name: 'Pro',
      description: 'For serious learners',
      price: { monthly: 9.99, annual: 7.99 },
      color: 'border-primary-500 ring-2 ring-primary-500',
      buttonClass: 'btn-primary',
      popular: true,
      features: [
        'Unlimited skill matches',
        'Advanced messaging with file sharing',
        'Priority community access',
        'Enhanced profile features',
        'Advanced search & filters',
        'Progress tracking & analytics',
        'Video call integration',
        'Skill verification badges'
      ],
      limitations: []
    },
    {
      name: 'Expert',
      description: 'For teaching professionals',
      price: { monthly: 19.99, annual: 15.99 },
      color: 'border-secondary-500',
      buttonClass: 'btn-secondary',
      features: [
        'Everything in Pro',
        'Teaching dashboard',
        'Student management tools',
        'Custom skill categories',
        'Advanced analytics & reporting',
        'Priority customer support',
        'API access',
        'White-label options',
        'Revenue sharing program'
      ],
      limitations: []
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl font-bold mb-6">
            Simple, <span className="text-gradient">Transparent</span> Pricing
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your learning journey. Start free and upgrade when you're ready.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm ${!isAnnual ? 'text-neutral-800 font-medium' : 'text-neutral-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                isAnnual ? 'bg-gradient-primary' : 'bg-neutral-300'
              }`}
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform duration-300 ${
                  isAnnual ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-neutral-800 font-medium' : 'text-neutral-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="bg-accent-500 text-white text-xs px-2 py-1 rounded-full">
                Save 20%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`card relative ${plan.color} hover:shadow-strong transition-all duration-300 hover:scale-105 animate-slide-up floating-element`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-medium shadow-glow-primary">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-neutral-800 mb-2">{plan.name}</h3>
                <p className="text-neutral-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-neutral-800">
                    ${isAnnual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="text-neutral-600 ml-1">
                    /{isAnnual ? 'month' : 'month'}
                  </span>
                </div>
                {isAnnual && plan.price.annual < plan.price.monthly && (
                  <p className="text-sm text-accent-600 mt-1">
                    Billed annually at ${(plan.price.annual * 12).toFixed(2)}
                  </p>
                )}
              </div>

              <button className={`w-full ${plan.buttonClass} mb-6`}>
                {plan.name === 'Free' ? 'Get Started' : 'Start Free Trial'}
              </button>

              <div className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start space-x-3">
                    <CheckIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700 text-sm">{feature}</span>
                  </div>
                ))}
                {plan.limitations.map((limitation, limitationIndex) => (
                  <div key={limitationIndex} className="flex items-start space-x-3">
                    <XMarkIcon className="w-5 h-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-500 text-sm">{limitation}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="card animate-slide-up animation-delay-600">
          <h2 className="text-3xl font-bold text-center text-neutral-800 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-neutral-800 mb-2">Can I change plans anytime?</h3>
              <p className="text-neutral-600 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-800 mb-2">Is there a free trial?</h3>
              <p className="text-neutral-600 text-sm">Yes, all paid plans come with a 14-day free trial. No credit card required.</p>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-800 mb-2">What payment methods do you accept?</h3>
              <p className="text-neutral-600 text-sm">We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-800 mb-2">Can I cancel anytime?</h3>
              <p className="text-neutral-600 text-sm">Absolutely. Cancel anytime with no questions asked. Your data remains safe.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing; 