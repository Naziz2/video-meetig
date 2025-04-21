import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';

const blogPosts = [
  {
    title: 'The Future of Remote Work: How Video Conferencing is Shaping the Workplace',
    excerpt: 'Explore how video conferencing technology is revolutionizing the way teams collaborate and work together in the modern workplace.',
    image: 'https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    author: 'Sarah Johnson',
    date: 'March 15, 2024',
    readTime: '5 min read',
    category: 'Remote Work',
  },
  {
    title: 'Best Practices for Hosting Professional Video Meetings',
    excerpt: 'Learn the essential tips and tricks for hosting engaging and productive video meetings that keep your team focused and connected.',
    image: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    author: 'Michael Chen',
    date: 'March 10, 2024',
    readTime: '4 min read',
    category: 'Tips & Tricks',
  },
  {
    title: 'Security in Video Conferencing: What You Need to Know',
    excerpt: 'A comprehensive guide to understanding and implementing security measures in your video conferencing setup.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    author: 'David Smith',
    date: 'March 5, 2024',
    readTime: '6 min read',
    category: 'Security',
  },
  {
    title: 'How to Build a Strong Remote Team Culture',
    excerpt: 'Discover strategies for fostering team collaboration and maintaining company culture in a remote work environment.',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    author: 'Emma Wilson',
    date: 'March 1, 2024',
    readTime: '7 min read',
    category: 'Team Building',
  },
];

export const Blog = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-wolt-blue/10 via-wolt-teal/10 to-wolt-blue/10 dark:from-wolt-blue/20 dark:via-wolt-teal/20 dark:to-wolt-blue/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
              Insights & Updates
            </h1>
            <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
              Stay informed with the latest news, tips, and best practices for video conferencing and remote collaboration.
            </p>
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-2">
          {blogPosts.map((post, index) => (
            <article
              key={index}
              className="bg-white dark:bg-secondary-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-wolt-blue text-white text-sm rounded-full">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-3">
                  {post.title}
                </h2>
                <p className="text-secondary-600 dark:text-secondary-300 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-secondary-500 dark:text-secondary-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <Link
                    to={`/blog/${index + 1}`}
                    className="flex items-center text-wolt-blue hover:text-wolt-blue-dark transition-colors"
                  >
                    Read more
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-secondary-100 dark:bg-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-4">
              Stay Updated
            </h2>
            <p className="text-lg text-secondary-600 dark:text-secondary-300 mb-8">
              Subscribe to our newsletter for the latest insights and updates.
            </p>
            <form className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 focus:outline-none focus:ring-2 focus:ring-wolt-blue"
              />
              <button
                type="submit"
                className="bg-wolt-blue hover:bg-wolt-blue-dark text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}; 