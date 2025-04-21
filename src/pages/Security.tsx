import { Shield, Lock, Key, UserCheck, Server, FileCheck } from 'lucide-react';

const securityFeatures = [
  {
    icon: <Lock className="w-8 h-8 text-wolt-blue" />,
    title: 'End-to-End Encryption',
    description: 'All video calls and data are encrypted using industry-standard protocols, ensuring your conversations remain private.',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  {
    icon: <Key className="w-8 h-8 text-wolt-teal" />,
    title: 'Secure Authentication',
    description: 'Multi-factor authentication and secure login options to protect your account.',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  {
    icon: <UserCheck className="w-8 h-8 text-wolt-coral" />,
    title: 'Access Control',
    description: 'Granular permissions and role-based access control for meeting participants.',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  {
    icon: <Server className="w-8 h-8 text-wolt-green" />,
    title: 'Secure Infrastructure',
    description: 'Enterprise-grade security infrastructure with regular security audits and updates.',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
  {
    icon: <FileCheck className="w-8 h-8 text-wolt-yellow" />,
    title: 'Data Protection',
    description: 'Comprehensive data protection measures including encryption at rest and in transit.',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  },
];

export const Security = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-wolt-blue/10 via-wolt-teal/10 to-wolt-blue/10 dark:from-wolt-blue/20 dark:via-wolt-teal/20 dark:to-wolt-blue/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 bg-wolt-blue/10 dark:bg-wolt-blue/20 rounded-full mb-6">
              <Shield className="w-8 h-8 text-wolt-blue" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
              Enterprise-Grade Security
            </h1>
            <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
              Your data and conversations are protected with industry-leading security measures and encryption protocols.
            </p>
          </div>
        </div>
      </div>

      {/* Security Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-2">
          {securityFeatures.map((feature, index) => (
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

      {/* Security Certifications */}
      <div className="bg-secondary-100 dark:bg-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-8">
              Security Certifications
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="p-6 bg-white dark:bg-secondary-900 rounded-xl">
                <img
                  src="https://www.vectorlogo.zone/logos/iso/iso-icon.svg"
                  alt="ISO 27001"
                  className="h-16 mx-auto"
                />
                <p className="mt-4 text-sm text-secondary-600 dark:text-secondary-300">
                  ISO 27001
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-secondary-900 rounded-xl">
                <img
                  src="https://www.vectorlogo.zone/logos/soc/soc-icon.svg"
                  alt="SOC 2"
                  className="h-16 mx-auto"
                />
                <p className="mt-4 text-sm text-secondary-600 dark:text-secondary-300">
                  SOC 2
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-secondary-900 rounded-xl">
                <img
                  src="https://www.vectorlogo.zone/logos/gdpr/gdpr-icon.svg"
                  alt="GDPR"
                  className="h-16 mx-auto"
                />
                <p className="mt-4 text-sm text-secondary-600 dark:text-secondary-300">
                  GDPR
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-secondary-900 rounded-xl">
                <img
                  src="https://www.vectorlogo.zone/logos/hipaa/hipaa-icon.svg"
                  alt="HIPAA"
                  className="h-16 mx-auto"
                />
                <p className="mt-4 text-sm text-secondary-600 dark:text-secondary-300">
                  HIPAA
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 