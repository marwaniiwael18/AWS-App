import React, { useState } from 'react';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  ChatBubbleLeftRightIcon,
  ClockIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const contactMethods = [
    {
      icon: EnvelopeIcon,
      title: 'Email Support',
      description: 'Get help with your account or technical issues',
      contact: 'support@skillswap.com',
      available: '24/7'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      contact: 'Available in-app',
      available: 'Mon-Fri, 9AM-6PM EST'
    },
    {
      icon: PhoneIcon,
      title: 'Phone Support',
      description: 'Speak directly with our customer success team',
      contact: '+1 (555) 123-4567',
      available: 'Mon-Fri, 9AM-5PM EST'
    }
  ];

  const offices = [
    {
      city: 'San Francisco',
      address: '123 Tech Street, SF, CA 94105',
      phone: '+1 (555) 123-4567',
      email: 'sf@skillswap.com'
    },
    {
      city: 'New York',
      address: '456 Innovation Ave, NYC, NY 10001',
      phone: '+1 (555) 987-6543',
      email: 'nyc@skillswap.com'
    },
    {
      city: 'London',
      address: '789 Learning Lane, London, UK SW1A 1AA',
      phone: '+44 20 1234 5678',
      email: 'london@skillswap.com'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl font-bold mb-6">
            Get in <span className="text-gradient">Touch</span>
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Have questions, suggestions, or need help? We're here to support your learning journey every step of the way.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {contactMethods.map((method, index) => (
            <div
              key={index}
              className="card text-center hover:shadow-strong transition-all duration-300 hover:scale-105 animate-slide-up floating-element"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-primary">
                <method.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">{method.title}</h3>
              <p className="text-neutral-600 mb-3">{method.description}</p>
              <p className="font-medium text-primary-600 mb-2">{method.contact}</p>
              <div className="flex items-center justify-center text-sm text-neutral-500">
                <ClockIcon className="w-4 h-4 mr-1" />
                {method.available}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form and Info */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <div className="card animate-slide-up animation-delay-400">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-800">Send us a Message</h2>
              <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center shadow-glow-secondary">
                <PaperAirplaneIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className="input-field"
                  placeholder="Tell us how we can help you..."
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                Send Message
              </button>
            </form>
          </div>

          {/* Office Locations */}
          <div className="space-y-8">
            <div className="animate-slide-up animation-delay-500">
              <h2 className="text-2xl font-bold text-neutral-800 mb-6">Our Offices</h2>
              <div className="space-y-6">
                {offices.map((office, index) => (
                  <div key={index} className="card-sm">
                    <h3 className="font-bold text-neutral-800 mb-2">{office.city}</h3>
                    <div className="space-y-2 text-sm text-neutral-600">
                      <div className="flex items-start">
                        <MapPinIcon className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                        {office.address}
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        {office.phone}
                      </div>
                      <div className="flex items-center">
                        <EnvelopeIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        {office.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="card animate-slide-up animation-delay-600">
              <h3 className="text-xl font-bold text-neutral-800 mb-4">Quick Answers</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-neutral-800 mb-1">Response Time?</h4>
                  <p className="text-sm text-neutral-600">We respond to all inquiries within 24 hours.</p>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-800 mb-1">Account Issues?</h4>
                  <p className="text-sm text-neutral-600">Visit our Help Center for instant solutions.</p>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-800 mb-1">Partnership Inquiries?</h4>
                  <p className="text-sm text-neutral-600">Email partnerships@skillswap.com for business opportunities.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 