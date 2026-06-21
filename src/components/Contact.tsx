import { useState } from 'react';
import { Mail, Phone, Youtube, Instagram, Facebook, CheckCircle2, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/config';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status) {
        setSent(true);
        setForm({ name: '', email: '', message: '' });
      } else {
        setError(data.message || 'Failed to send. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-navy to-navyLight relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Contact Us
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-primaryDark mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* LEFT SIDE */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">XREVISE</h3>
              <p className="text-white/70 text-lg mb-8">
                Structured PYT Recall Program · Revise. Test. Analyze. Improve.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Email</p>
                  <p className="text-white font-medium">info@xpreppg.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Phone</p>
                  <p className="text-white font-medium">93701 00887</p>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <p className="text-white/50 mb-4">Follow us on</p>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/share/1JuE3Lhhof/" target="_blank" className="bg-primary/10 hover:bg-primary/20 p-3 rounded-lg transition-colors duration-200">
                  <Facebook className="w-6 h-6 text-accent" />
                </a>
                <a href="https://www.instagram.com/xpreppg?igsh=NHhtYW5wZ2lydHA3" target="_blank" className="bg-primary/10 hover:bg-primary/20 p-3 rounded-lg transition-colors duration-200">
                  <Instagram className="w-6 h-6 text-accent" />
                </a>
                <a href="https://youtube.com/@xpreppg?si=ZE_vjvoAUNyJL081" target="_blank" className="bg-primary/10 hover:bg-primary/20 p-3 rounded-lg transition-colors duration-200">
                  <Youtube className="w-6 h-6 text-accent" />
                </a>
                <a href="https://wa.me/919370100887" target="_blank" className="bg-primary/10 hover:bg-primary/20 p-3 rounded-lg transition-colors duration-200">
                  <svg className="w-6 h-6 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"><path d="M16.6 14c-.2-.1-1.5-.7-1.7-.8c-.2-.1-.4-.1-.6.1c-.2.2-.6.8-.8 1c-.1.2-.3.2-.5.1c-.7-.3-1.4-.7-2-1.2c-.5-.5-1-1.1-1.4-1.7c-.1-.2 0-.4.1-.5c.1-.1.2-.3.4-.4c.1-.1.2-.3.2-.4c.1-.1.1-.3 0-.4c-.1-.1-.6-1.3-.8-1.8c-.1-.7-.3-.7-.5-.7h-.5c-.2 0-.5.2-.6.3c-.6.6-.9 1.3-.9 2.1c.1.9.4 1.8 1 2.6c1.1 1.6 2.5 2.9 4.2 3.7c.5.2.9.4 1.4.5c.5.2 1 .2 1.6.1c.7-.1 1.3-.6 1.7-1.2c.2-.4.2-.8.1-1.2l-.4-.2m2.5-9.1C15.2 1 8.9 1 5 4.9c-3.2 3.2-3.8 8.1-1.6 12L2 22l5.3-1.4c1.5.8 3.1 1.2 4.7 1.2c5.5 0 9.9-4.4 9.9-9.9c.1-2.6-1-5.1-2.8-7m-2.7 14c-1.3.8-2.8 1.3-4.4 1.3c-1.5 0-2.9-.4-4.2-1.1l-.3-.2l-3.1.8l.8-3l-.2-.3c-2.4-4-1.2-9 2.7-11.5S16.6 3.7 19 7.5c2.4 3.9 1.3 9-2.6 11.4"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE FORM */}
          <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-6">Send us a message</h3>

            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-400 mb-4" />
                <h4 className="text-white text-xl font-bold mb-2">Message Sent!</h4>
                <p className="text-white/70">Thank you for reaching out. We'll get back to you shortly.</p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 text-accent underline text-sm"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-white/70 mb-2 font-medium">Name</label>
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-2 font-medium">Email</label>
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-2 font-medium">Message</label>
                  <textarea
                    rows={4} name="message" value={form.message} onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-primary outline-none resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                  type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-primaryDark text-white py-3 rounded-lg font-bold hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-white/50">© 2026 XREVISE · XprepPG. All rights reserved.</p>
        </div>
      </div>

      {/* FLOATING WHATSAPP CHAT BUTTON */}
      <a
        href="https://wa.me/919370100887"
        target="_blank"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110"
      >
        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16.6 14c-.2-.1-1.5-.7-1.7-.8c-.2-.1-.4-.1-.6.1c-.2.2-.6.8-.8 1c-.1.2-.3.2-.5.1c-.7-.3-1.4-.7-2-1.2c-.5-.5-1-1.1-1.4-1.7c-.1-.2 0-.4.1-.5c.1-.1.2-.3.4-.4c.1-.1.2-.3.2-.4c.1-.1.1-.3 0-.4c-.1-.1-.6-1.3-.8-1.8c-.1-.7-.3-.7-.5-.7h-.5c-.2 0-.5.2-.6.3c-.6.6-.9 1.3-.9 2.1c.1.9.4 1.8 1 2.6c1.1 1.6 2.5 2.9 4.2 3.7c.5.2.9.4 1.4.5c.5.2 1 .2 1.6.1c.7-.1 1.3-.6 1.7-1.2c.2-.4.2-.8.1-1.2l-.4-.2m2.5-9.1C15.2 1 8.9 1 5 4.9c-3.2 3.2-3.8 8.1-1.6 12L2 22l5.3-1.4c1.5.8 3.1 1.2 4.7 1.2c5.5 0 9.9-4.4 9.9-9.9c.1-2.6-1-5.1-2.8-7m-2.7 14c-1.3.8-2.8 1.3-4.4 1.3c-1.5 0-2.9-.4-4.2-1.1l-.3-.2l-3.1.8l.8-3l-.2-.3c-2.4-4-1.2-9 2.7-11.5S16.6 3.7 19 7.5c2.4 3.9 1.3 9-2.6 11.4"/></svg>
      </a>
    </section>
  );
}
