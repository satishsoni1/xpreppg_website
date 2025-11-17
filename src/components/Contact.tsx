import { Mail, MapPin, Globe, Youtube, Instagram, Send } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Contact Us
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-primaryDark mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">XprepPG CBT</h3>
              <p className="text-gray-300 text-lg mb-8">
                India's 1st NEET PG CBT Simulation Platform
              </p>
            </div>

            <div className="space-y-6">
              {/* <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Location</p>
                  <p className="text-white font-medium">Mumbai, India</p>
                </div>
              </div> */}

              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Email</p>
                  <p className="text-white font-medium">contact@xpreppg.com</p>
                </div>
              </div>

              {/* <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Globe className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Website</p>
                  <p className="text-white font-medium">www.xpreppg.com</p>
                </div>
              </div> */}
            </div>

            <div className="pt-8">
              <p className="text-gray-400 mb-4">Follow us on</p>
              <div className="flex space-x-4">
                <a href="#" className="bg-primary/10 hover:bg-primary/20 p-3 rounded-lg transition-colors duration-200">
                  <Youtube className="w-6 h-6 text-emerald-400" />
                </a>
                <a href="#" className="bg-primary/10 hover:bg-primary/20 p-3 rounded-lg transition-colors duration-200">
                  <Instagram className="w-6 h-6 text-emerald-400" />
                </a>
                <a href="#" className="bg-primary/10 hover:bg-primary/20 p-3 rounded-lg transition-colors duration-200">
                  <Send className="w-6 h-6 text-emerald-400" />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-2xl p-8 backdrop-blur-sm border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Send us a message</h3>
            <form className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Message</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primaryDark text-white py-3 rounded-lg font-bold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400">
            © 2025 XprepPG CBT. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
}
