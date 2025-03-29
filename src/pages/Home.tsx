import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Video, Shield, Users, Globe, Zap, Clock, Laptop } from 'lucide-react';

// Combine all logos into one array
const allLogos = [
  // Company logos
  {
    src: 'https://svgl.app/library/zoom.svg',
    alt: 'Zoom',
    width: 96
  },
  {
    src: 'https://svgl.app/library/microsoft.svg',
    alt: 'Microsoft Teams',
    width: 96
  },
  {
    src: 'https://svgl.app/library/google.svg',
    alt: 'Google Meet',
    width: 96
  },
  {
    src: 'https://svgl.app/library/skype.svg',
    alt: 'Skype',
    width: 96
  },
  // Tech logos
  {
    src: 'https://svgl.app/library/react_dark.svg',
    alt: 'React',
    width: 80
  },
  {
    src: 'https://svgl.app/library/typescript.svg',
    alt: 'TypeScript',
    width: 80
  },
  {
    src: 'https://svgl.app/library/tailwindcss.svg',
    alt: 'Tailwind CSS',
    width: 80
  },
  {
    src: 'https://svgl.app/library/vitejs.svg',
    alt: 'Vite',
    width: 80
  },
  {
    src: 'https://svgl.app/library/nodejs.svg',
    alt: 'Node.js',
    width: 80
  },
  {
    src: 'https://svgl.app/library/hugging_face.svg',
    alt: 'Hugging Face',
    width: 80
  },
  {
    src: 'https://svgl.app/library/gemini.svg',
    alt: 'Gemini',
    width: 80
  }
];

const features = [
  {
    icon: <Shield className="w-6 h-6 text-wolt-teal" />,
    title: 'Enterprise Security',
    description: 'End-to-end encryption and advanced security features to protect your meetings.',
  },
  {
    icon: <Users className="w-6 h-6 text-wolt-coral" />,
    title: 'Team Collaboration',
    description: 'Built-in tools for real-time collaboration and seamless team communication.',
  },
  {
    icon: <Globe className="w-6 h-6 text-wolt-green" />,
    title: 'Global Network',
    description: 'Low-latency connections worldwide for crystal-clear video conferencing.',
  },
  {
    icon: <Zap className="w-6 h-6 text-wolt-yellow" />,
    title: 'Instant Meetings',
    description: 'Start or join meetings with one click, no downloads required.',
  },
  {
    icon: <Clock className="w-6 h-6 text-wolt-blue" />,
    title: 'Smart Scheduling',
    description: 'Intelligent calendar integration and timezone management.',
  },
  {
    icon: <Laptop className="w-6 h-6 text-wolt-teal" />,
    title: 'Cross-Platform',
    description: 'Works seamlessly on all devices and major operating systems.',
  }
];

export const Home = () => {
  const [typedText, setTypedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const words = ['remote teams', 'enterprises', 'startups', 'educators'];

  useEffect(() => {
    let currentText = '';
    let currentChar = 0;
    const word = words[currentWordIndex];

    const typeInterval = setInterval(() => {
      if (currentChar < word.length) {
        currentText += word[currentChar];
        setTypedText(currentText);
        currentChar++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          const eraseInterval = setInterval(() => {
            if (currentText.length > 0) {
              currentText = currentText.slice(0, -1);
              setTypedText(currentText);
            } else {
              clearInterval(eraseInterval);
              setCurrentWordIndex((prev) => (prev + 1) % words.length);
            }
          }, 50);
        }, 2000);
      }
    }, 100);

    return () => clearInterval(typeInterval);
  }, [currentWordIndex]);

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center min-h-[80vh] flex flex-col justify-center items-center py-24 md:py-32">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-serif font-bold text-secondary-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-wolt-blue via-wolt-teal to-wolt-blue bg-clip-text text-transparent">
              Vivid
            </span>
          </h1>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary-700 dark:text-secondary-200">
            Professional meetings for{' '}
            <span className="text-wolt-blue inline-block min-w-[180px]">{typedText}</span>
          </h2>
          <p className="mt-6 text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
            Connect with your team from anywhere in the world with our reliable and secure video conferencing platform.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/join"
              className="bg-wolt-blue hover:bg-wolt-blue-dark text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center space-x-2 group"
            >
              <span>Start Meeting Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/pricing"
              className="bg-secondary-200 dark:bg-secondary-800 text-secondary-800 dark:text-secondary-200 hover:bg-secondary-300 dark:hover:bg-secondary-700 px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center group"
            >
              <span>View Pricing</span>
            </Link>
          </div>
        </div>

        {/* All Logos Section with Scrolling Animation */}
        <div className="w-full overflow-hidden py-16 bg-secondary-100 dark:bg-secondary-800">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wide">
              Trusted by leading companies & built with modern technologies
            </p>
          </div>
          <div className="relative">
            <div className="flex logos-scroll">
              {/* First set of logos */}
              {allLogos.map((logo, index) => (
                <div
                  key={`logo-1-${index}`}
                  className="inline-flex items-center justify-center grayscale transition-all duration-200 hover:grayscale-0 mx-8"
                >
                  <object
                    data={logo.src}
                    type="image/svg+xml"
                    width={logo.width}
                    aria-label={`${logo.alt} logo`}
                    className="h-16 md:h-20"
                  />
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {allLogos.map((logo, index) => (
                <div
                  key={`logo-2-${index}`}
                  className="inline-flex items-center justify-center grayscale transition-all duration-200 hover:grayscale-0 mx-8"
                >
                  <object
                    data={logo.src}
                    type="image/svg+xml"
                    width={logo.width}
                    aria-label={`${logo.alt} logo`}
                    className="h-16 md:h-20"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* CSS for scrolling animation */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes scroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            
            .logos-scroll {
              animation: scroll 30s linear infinite;
              width: max-content;
            }
          `}} />
        </div>

        {/* Features Grid */}
        <div className="mt-32">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white">
              Everything you need for perfect meetings
            </h2>
            <p className="mt-4 text-lg text-secondary-600 dark:text-secondary-300">
              Powerful features to make your video conferences more productive
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-secondary-900 shadow-md hover:shadow-xl rounded-2xl p-8 flex flex-col items-start space-y-4 group hover:scale-[1.02] transition-all duration-300"
              >
                <div className="p-3 rounded-xl bg-secondary-100 dark:bg-secondary-800 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 mb-10">
          <div className="bg-secondary-100 dark:bg-secondary-800 rounded-2xl overflow-hidden">
            <div className="relative px-6 py-10 md:px-12 md:py-12 text-center">
              <div className="absolute inset-0 bg-gradient-to-r from-wolt-blue/5 via-wolt-teal/5 to-wolt-blue/5 dark:from-wolt-blue/10 dark:via-wolt-teal/10 dark:to-wolt-blue/10" />
              <h2 className="relative text-2xl md:text-3xl font-bold text-secondary-900 dark:text-white">
                Ready to transform your meetings?
              </h2>
              <p className="mt-3 text-base md:text-lg text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto">
                Join thousands of teams who have already improved their video conferencing experience.
              </p>
              <div className="mt-6">
                <Link
                  to="/auth"
                  className="bg-wolt-blue hover:bg-wolt-blue-dark text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center space-x-2 group"
                >
                  <span>Get Started for Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};