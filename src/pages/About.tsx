import { Users, Target, Heart, Lightbulb, Globe, Award } from 'lucide-react';

const values = [
  {
    icon: <Users className="w-8 h-8 text-wolt-blue" />,
    title: 'Collaboration',
    description: 'We believe in the power of working together and fostering strong relationships.',
  },
  {
    icon: <Target className="w-8 h-8 text-wolt-teal" />,
    title: 'Innovation',
    description: 'We constantly push boundaries to deliver cutting-edge solutions.',
  },
  {
    icon: <Heart className="w-8 h-8 text-wolt-coral" />,
    title: 'Customer Focus',
    description: 'Our customers are at the heart of everything we do.',
  },
  {
    icon: <Lightbulb className="w-8 h-8 text-wolt-green" />,
    title: 'Creativity',
    description: 'We encourage creative thinking and unique solutions.',
  },
];

const team = [
  {
    name: 'Med Aziz',
    role: 'Co-founder',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  {
    name: 'Ameni',
    role: 'Manager',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
];

export const About = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-wolt-blue/10 via-wolt-teal/10 to-wolt-blue/10 dark:from-wolt-blue/20 dark:via-wolt-teal/20 dark:to-wolt-blue/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
              Our Story
            </h1>
            <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
              We're on a mission to revolutionize the way people connect and collaborate through innovative video conferencing solutions.
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-6">
              How It All Started
            </h2>
            <p className="text-lg text-secondary-600 dark:text-secondary-300 mb-4">
              Founded in 2023, our journey began with a simple idea: to make video conferencing more accessible, reliable, and user-friendly. What started as a small team of passionate developers has grown into a global company serving thousands of users worldwide.
            </p>
            <p className="text-lg text-secondary-600 dark:text-secondary-300">
              Today, we're proud to be at the forefront of video conferencing technology, helping businesses and individuals stay connected in an increasingly digital world.
            </p>
          </div>
          <div className="relative h-96 rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Team collaboration"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-secondary-100 dark:bg-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 bg-wolt-blue/10 dark:bg-wolt-blue/20 rounded-full mb-6">
              <Globe className="w-8 h-8 text-wolt-blue" />
            </div>
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
              To empower global collaboration through seamless, secure, and innovative video conferencing solutions that bring people together, regardless of distance.
            </p>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-6">
            Our Values
          </h2>
          <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
            The principles that guide everything we do
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white dark:bg-secondary-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="mb-4">{value.icon}</div>
              <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
                {value.title}
              </h3>
              <p className="text-secondary-600 dark:text-secondary-300">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-secondary-100 dark:bg-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
              The passionate individuals behind our success
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white dark:bg-secondary-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-64">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-300">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Awards Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-wolt-blue/10 dark:bg-wolt-blue/20 rounded-full mb-6">
            <Award className="w-8 h-8 text-wolt-blue" />
          </div>
          <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-6">
            Recognition
          </h2>
          <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
            We're proud to be recognized for our innovation and commitment to excellence
          </p>
        </div>
      </div>
    </div>
  );
}; 