import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const Contact = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setSubmitStatus({
        type: "success",
        message: "Message sent successfully! We'll get back to you soon.",
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Failed to send message. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-wolt-blue/10 via-wolt-teal/10 to-wolt-blue/10 dark:from-wolt-blue/20 dark:via-wolt-teal/20 dark:to-wolt-blue/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-secondary-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-wolt-blue/10 dark:bg-wolt-blue/20 rounded-full mr-4">
                <Mail className="w-6 h-6 text-wolt-blue" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                Email
              </h3>
            </div>
            <p className="text-secondary-600 dark:text-secondary-300">
              support@video-meeting.com
            </p>
          </div>

          <div className="bg-white dark:bg-secondary-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-wolt-teal/10 dark:bg-wolt-teal/20 rounded-full mr-4">
                <Phone className="w-6 h-6 text-wolt-teal" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                Phone
              </h3>
            </div>
            <p className="text-secondary-600 dark:text-secondary-300">
              +1 (555) 123-4567
            </p>
          </div>

          <div className="bg-white dark:bg-secondary-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-wolt-coral/10 dark:bg-wolt-coral/20 rounded-full mr-4">
                <MapPin className="w-6 h-6 text-wolt-coral" />
              </div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                Office
              </h3>
            </div>
            <p className="text-secondary-600 dark:text-secondary-300">
              123 Business Street, Suite 100<br />
              New York, NY 10001
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-secondary-800 p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-6">
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white focus:ring-2 focus:ring-wolt-blue focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white focus:ring-2 focus:ring-wolt-blue focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white focus:ring-2 focus:ring-wolt-blue focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white focus:ring-2 focus:ring-wolt-blue focus:border-transparent"
                />
              </div>

              {submitStatus && (
                <div
                  className={`p-4 rounded-lg ${
                    submitStatus.type === 'success'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
                  }`}
                >
                  {submitStatus.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center px-6 py-3 bg-wolt-blue text-white rounded-lg hover:bg-wolt-blue/90 focus:outline-none focus:ring-2 focus:ring-wolt-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-secondary-100 dark:bg-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-6">
              Business Hours
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white dark:bg-secondary-900 p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                  Monday - Friday
                </h3>
                <p className="text-secondary-600 dark:text-secondary-300">
                  9:00 AM - 6:00 PM
                </p>
              </div>
              <div className="bg-white dark:bg-secondary-900 p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                  Saturday
                </h3>
                <p className="text-secondary-600 dark:text-secondary-300">
                  10:00 AM - 4:00 PM
                </p>
              </div>
              <div className="bg-white dark:bg-secondary-900 p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                  Sunday
                </h3>
                <p className="text-secondary-600 dark:text-secondary-300">
                  Closed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
