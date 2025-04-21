import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';

export const Pricing = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(true);
  
  const plans = [
    {
      name: 'Free',
      description: 'For personal use',
      price: 0,
      currency: 'TND',
      features: [
        'Up to 5 participants',
        '40 minutes per meeting',
        'Screen sharing',
        'Chat functionality',
        'Basic support',
      ],
      notIncluded: [
        'Recording',
        'Custom branding',
        'Admin controls',
        'Analytics',
        'Priority support',
      ],
      cta: 'Get Started',
      highlight: false,
    },
    {
      name: 'Pro',
      description: 'For small teams',
      price: isAnnual ? 100 : 10,
      currency: 'TND',
      features: [
        'Up to 15 participants',
        'Unlimited meeting duration',
        'Screen sharing',
        'Chat functionality',
        'Recording (up to 5 hours)',
        'Basic admin controls',
        'Standard support',
      ],
      notIncluded: [
        'Custom branding',
        'Advanced analytics',
        'Priority support',
      ],
      cta: 'Upgrade Now',
      highlight: true,
    },
    {
      name: 'Business',
      description: 'For organizations',
      price: isAnnual ? 200 : 20,
      currency: 'TND',
      features: [
        'Up to 32 participants',
        'Unlimited meeting duration',
        'Screen sharing',
        'Chat functionality',
        'Unlimited recording',
        'Custom branding',
        'Advanced admin controls',
        'Detailed analytics',
        'Priority support',
      ],
      notIncluded: [],
      cta: 'Contact Sales',
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-wolt-blue via-wolt-teal to-wolt-blue bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </span>
          </h1>
          <p className="text-lg text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto">
            Choose the plan that works best for you and your team. All plans include our core features.
          </p>
          
          <div className="mt-8 inline-flex items-center p-1 bg-secondary-100 dark:bg-secondary-800 rounded-lg">
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isAnnual 
                  ? 'bg-wolt-blue text-white' 
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
              }`}
            >
              Annual (Save 15%)
            </button>
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isAnnual 
                  ? 'bg-wolt-blue text-white' 
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`bg-white dark:bg-secondary-800 rounded-xl overflow-hidden border ${
                plan.highlight 
                  ? 'border-wolt-teal shadow-lg shadow-wolt-teal/10' 
                  : 'border-gray-100 dark:border-secondary-700'
              }`}
            >
              {plan.highlight && (
                <div className="bg-wolt-teal text-white text-center py-1.5 text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-secondary-500 dark:text-secondary-400 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-baseline">
                    {plan.price > 0 ? (
                      <>
                        <span className="text-3xl font-bold">{plan.price}</span>
                        <span className="text-lg ml-1 font-medium">{plan.currency}</span>
                        <span className="text-secondary-500 dark:text-secondary-400 ml-2">
                          /{isAnnual ? 'year' : 'month'}
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold">Free</span>
                    )}
                  </div>
                  {isAnnual && plan.price > 0 && (
                    <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
                      Equivalent to {Math.round(plan.price / 12)} {plan.currency}/month
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => navigate(plan.price === 0 ? '/signup' : '/checkout')}
                  className={`w-full py-2.5 px-4 rounded-lg font-medium mb-6 ${
                    plan.highlight
                      ? 'bg-wolt-teal hover:bg-teal-600 text-white'
                      : 'bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-900 dark:text-white'
                  }`}
                >
                  {plan.cta}
                </button>
                
                <div>
                  <p className="font-medium mb-3">What's included:</p>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="w-5 h-5 text-wolt-teal mr-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.notIncluded.length > 0 && (
                    <>
                      <p className="font-medium mb-3 text-secondary-500 dark:text-secondary-400">Not included:</p>
                      <ul className="space-y-2">
                        {plan.notIncluded.map((feature) => (
                          <li key={feature} className="flex items-start">
                            <X className="w-5 h-5 text-secondary-400 dark:text-secondary-500 mr-2 flex-shrink-0" />
                            <span className="text-sm text-secondary-500 dark:text-secondary-400">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-secondary-800 rounded-xl p-8 border border-gray-100 dark:border-secondary-700">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                <span className="bg-gradient-to-r from-wolt-blue via-wolt-teal to-wolt-blue bg-clip-text text-transparent">
                  Need a custom solution?
                </span>
              </h2>
              <p className="text-secondary-600 dark:text-secondary-300 mb-6">
                Contact our sales team to discuss your specific requirements and get a tailored quote.
              </p>
              <button
                onClick={() => navigate('/contact')}
                className="px-6 py-3 bg-wolt-blue hover:bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-900/20 transition-all"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-wolt-blue via-wolt-teal to-wolt-blue bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-gray-100 dark:border-secondary-700">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-secondary-600 dark:text-secondary-300">
                We accept all major credit cards, including Visa and Mastercard. We also support mobile payment options like D17 and e-Dinar for both monthly and annual subscriptions.
              </p>
            </div>
            
            <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-gray-100 dark:border-secondary-700">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                Can I switch plans later?
              </h3>
              <p className="text-secondary-600 dark:text-secondary-300">
                Yes, you can upgrade or downgrade your plan at any time. If you upgrade, the new pricing will be prorated for the remainder of your billing cycle. If you downgrade, the new pricing will take effect at the start of your next billing cycle.
              </p>
            </div>
            
            <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-gray-100 dark:border-secondary-700">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-secondary-600 dark:text-secondary-300">
                Yes, we offer a 14-day free trial on all paid plans. No credit card is required to start your trial. You can upgrade to a paid plan at any time during or after your trial.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};