import {
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  Mail,
} from 'lucide-react';

export default function PrivacyPolicy() {
  const privacyPoints = [
    {
      icon: Shield,
      title: 'Data Protection',
      description:
        'Your personal information is securely stored and protected using industry-standard security measures.',
      gradient: 'from-primary to-secondaryDark0',
    },
    {
      icon: Lock,
      title: 'Secure Transactions',
      description:
        'All payments and account activities are encrypted to ensure safe and secure transactions.',
      gradient: 'from-secondary to-secondaryMiddle',
    },
    {
      icon: Eye,
      title: 'Privacy Assurance',
      description:
        'We never sell or share your personal data with unauthorized third parties.',
      gradient: 'from-primary to-primaryDark',
    },
    {
      icon: Database,
      title: 'Limited Data Usage',
      description:
        'Your data is used only for exam access, analytics, communication, and improving user experience.',
      gradient: 'from-teal-500 to-secondary0',
    },
    {
      icon: UserCheck,
      title: 'User Control',
      description:
        'Users can request updates or deletion of their personal information anytime.',
      gradient: 'from-green-500 to-secondary0',
    },
    {
      icon: Mail,
      title: 'Official Communication',
      description:
        'Important updates, exam notifications, and support communication are sent only through official channels.',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <section
      id="privacy-policy"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-secondary"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h2>

          <div className="w-24 h-1 bg-gradient-to-r from-primary to-primaryDark mx-auto rounded-full"></div>

          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            At XprepPG CBT, we value your privacy and are committed to
            protecting your personal information while providing a secure and
            reliable exam preparation platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {privacyPoints.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100"
            >
              <div
                className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${item.gradient} mb-6`}
              >
                <item.icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {item.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-3xl shadow-lg p-8 md:p-12 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Information We Collect
          </h3>

          <div className="grid md:grid-cols-2 gap-8 text-gray-600 leading-relaxed">
            <div>
              <ul className="space-y-4">
                <li>• Name, email address, and mobile number</li>
                <li>• Payment and transaction details</li>
                <li>• Exam performance and analytics</li>
              </ul>
            </div>

            <div>
              <ul className="space-y-4">
                <li>• Device and browser information</li>
                <li>• Login activity and usage data</li>
                <li>• Communication and support records</li>
              </ul>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Contact Us
            </h3>

            <p className="text-gray-600 leading-relaxed">
              If you have any questions regarding this Privacy Policy, please
              contact us through the official website at{' '}
              <a
                href="https://xpreppg.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline"
              >
                xpreppg.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}