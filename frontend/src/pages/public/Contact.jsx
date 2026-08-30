import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '', email: '', subject: 'General', message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // await publicApi.submitFeedback(formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API delay
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', subject: 'General', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-8 pb-16 px-4 sm:px-6">
      
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">Get in Touch</h1>
          <p className="text-[var(--text-3)] text-lg">Have a question or found a bug? We'd love to hear from you.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Contact Info Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-8">
              <h3 className="text-xl font-bold text-[var(--text)] mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin size={24} className="text-[var(--primary)] mr-4 shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-[var(--text)]">Address</p>
                    <p className="text-[var(--text-3)] mt-1">Campus Transport Office<br/>VIT Vellore, Tamil Nadu 632014</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail size={24} className="text-[var(--primary)] mr-4 shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-[var(--text)]">Email</p>
                    <p className="text-[var(--text-3)] mt-1">transport@vit.ac.in</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone size={24} className="text-[var(--primary)] mr-4 shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-[var(--text)]">Phone</p>
                    <p className="text-[var(--text-3)] mt-1">+91 416 220 2020</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-8">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">Your Name *</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">Your Email *</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-[var(--text-2)] mb-2">Subject</label>
                <select 
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors appearance-none"
                >
                  <option>General Inquiry</option>
                  <option>Bug Report</option>
                  <option>Feature Request</option>
                  <option>Complaint</option>
                </select>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-[var(--text-2)] mb-2">Message *</label>
                <textarea 
                  rows="5"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full md:w-auto px-8 py-4 bg-[var(--primary)] text-[#080c14] font-bold rounded-lg flex items-center justify-center transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                style={{ background: 'var(--grad-primary)' }}
              >
                {isSubmitting ? 'Sending...' : (
                  <>
                    <Send size={18} className="mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
