import React from 'react';

// Add CSS directly to the component
const scrollingStyles = `
  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
  
  .animate-scrolling {
    animation: scroll 30s linear infinite;
    width: max-content;
  }
`;

const InfiniteScrollLogos = () => {
  // Logos array from the provided code
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

  return (
    <div className="w-full bg-white dark:bg-secondary-900 py-16 overflow-hidden">
      <div className="text-center mb-8">
        <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wide">
          Trusted by leading companies & built with modern technologies
        </p>
      </div>
      <div className="relative">
        <div className="flex animate-scrolling">
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
      
      {/* CSS for animation */}
      <style dangerouslySetInnerHTML={{ __html: scrollingStyles }} />
    </div>
  );
};

export default InfiniteScrollLogos; 