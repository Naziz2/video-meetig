import { Check } from 'lucide-react';

export const Pricing = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600">Choose the plan that's right for you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Free</h3>
            <p className="text-gray-600 mb-6">Perfect for personal use</p>
            <div className="text-4xl font-bold text-gray-900 mb-8">$0<span className="text-lg font-normal text-gray-600">/mo</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-gray-600">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                Up to 3 participants
              </li>
              <li className="flex items-center text-gray-600">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                40 minutes limit
              </li>
              <li className="flex items-center text-gray-600">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                Basic features
              </li>
            </ul>
            <button className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              Get Started
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-indigo-600 rounded-2xl shadow-lg p-8 transform scale-105">
            <h3 className="text-2xl font-bold text-white mb-4">Pro</h3>
            <p className="text-indigo-200 mb-6">For small teams</p>
            <div className="text-4xl font-bold text-white mb-8">$15<span className="text-lg font-normal text-indigo-200">/mo</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-white">
                <Check className="w-5 h-5 text-indigo-300 mr-2" />
                Up to 100 participants
              </li>
              <li className="flex items-center text-white">
                <Check className="w-5 h-5 text-indigo-300 mr-2" />
                Unlimited duration
              </li>
              <li className="flex items-center text-white">
                <Check className="w-5 h-5 text-indigo-300 mr-2" />
                Recording & transcripts
              </li>
            </ul>
            <button className="w-full py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition">
              Get Started
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise</h3>
            <p className="text-gray-600 mb-6">For large organizations</p>
            <div className="text-4xl font-bold text-gray-900 mb-8">Custom</div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-gray-600">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                Unlimited participants
              </li>
              <li className="flex items-center text-gray-600">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                Advanced security
              </li>
              <li className="flex items-center text-gray-600">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                24/7 support
              </li>
            </ul>
            <button className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};