import { Link } from 'react-router-dom';
import { Video, Shield, Users, Globe, Zap, Clock, Laptop, MessageSquare, Share2, FileText, BarChart } from 'lucide-react';

const features = [
  {
    icon: <Video className="w-8 h-8 text-wolt-blue" />,
    title: 'HD Video Conferencing',
    description: 'Crystal clear video quality with support for up to 1080p resolution.',
    image: 'https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  {
    icon: <MessageSquare className="w-8 h-8 text-wolt-teal" />,
    title: 'Real-time Chat',
    description: 'Built-in chat system for seamless communication during meetings.',
    image: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  {
    icon: <Share2 className="w-8 h-8 text-wolt-coral" />,
    title: 'Screen Sharing',
    description: 'Share your screen, specific windows, or entire desktop with participants.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  {
    icon: <FileText className="w-8 h-8 text-wolt-green" />,
    title: 'Document Collaboration',
    description: 'Work together on documents in real-time with built-in collaboration tools.',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  {
    icon: <BarChart className="w-8 h-8 text-wolt-yellow" />,
    title: 'Analytics Dashboard',
    description: 'Track meeting statistics and participant engagement with detailed analytics.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
];

export const Features = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-wolt-blue/10 via-wolt-teal/10 to-wolt-blue/10 dark:from-wolt-blue/20 dark:via-wolt-teal/20 dark:to-wolt-blue/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
              Powerful Features for Perfect Meetings
            </h1>
            <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
              Everything you need to host professional video conferences, collaborate with your team, and get work done efficiently.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-secondary-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-white/90 dark:bg-secondary-900/90 rounded-lg">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {feature.title}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-secondary-600 dark:text-secondary-300">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-secondary-100 dark:bg-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-4">
              Ready to Experience These Features?
            </h2>
            <p className="text-lg text-secondary-600 dark:text-secondary-300 mb-8">
              Start using Vivid today and transform your meetings.
            </p>
            <Link
              to="/auth"
              className="bg-wolt-blue hover:bg-wolt-blue-dark text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center space-x-2"
            >
              <span>Get Started for Free</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}; 