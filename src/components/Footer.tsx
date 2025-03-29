import { Link } from 'react-router-dom';
import { Video, Github, Twitter, Linkedin } from 'lucide-react';

const footerLinks = {
  product: [
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Security', href: '/security' },
    { name: 'Enterprise', href: '/enterprise' },
  ],
  company: [
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
  ],
  resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'Help Center', href: '/help' },
    { name: 'API', href: '/api' },
    { name: 'Status', href: '/status' },
  ],
  legal: [
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'GDPR', href: '/gdpr' },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-secondary-900 border-t border-secondary-200 dark:border-secondary-800 w-full">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 w-full">
          <div className="col-span-2">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-serif font-bold bg-gradient-to-r from-wolt-blue via-wolt-teal to-wolt-blue bg-clip-text text-transparent">
                Vivid
              </span>
            </Link>
            <p className="mt-3 text-base text-secondary-600 dark:text-secondary-400 w-full">
              Professional video conferencing for teams of all sizes. Connect, collaborate, and create from anywhere in the world.
            </p>
            <div className="mt-4 flex space-x-4">
              <a
                href="https://github.com"
                className="text-secondary-500 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                className="text-secondary-500 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                className="text-secondary-500 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="w-full">
            <h3 className="text-sm font-semibold text-secondary-900 dark:text-white uppercase tracking-wider">
              Product
            </h3>
            <ul className="mt-3 space-y-2 w-full">
              {footerLinks.product.map((item) => (
                <li key={item.name} className="w-full">
                  <Link
                    to={item.href}
                    className="text-base text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white transition-colors block w-full"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full">
            <h3 className="text-sm font-semibold text-secondary-900 dark:text-white uppercase tracking-wider">
              Company
            </h3>
            <ul className="mt-3 space-y-2 w-full">
              {footerLinks.company.map((item) => (
                <li key={item.name} className="w-full">
                  <Link
                    to={item.href}
                    className="text-base text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white transition-colors block w-full"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full">
            <h3 className="text-sm font-semibold text-secondary-900 dark:text-white uppercase tracking-wider">
              Resources
            </h3>
            <ul className="mt-3 space-y-2 w-full">
              {footerLinks.resources.map((item) => (
                <li key={item.name} className="w-full">
                  <Link
                    to={item.href}
                    className="text-base text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white transition-colors block w-full"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-secondary-200 dark:border-secondary-800 w-full">
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            &copy; {new Date().getFullYear()} Vivid. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};