import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const FAQ_DATA = [
  { category: 'General', question: 'What is VIT ShuttleAI?', answer: 'VIT ShuttleAI is an intelligent transport tracking network designed to help students track campus shuttles in real-time, get smart ETAs, and find optimal routes.' },
  { category: 'General', question: 'Who can use the shuttle service?', answer: 'All registered students and faculty of VIT Vellore can use the shuttle services within the campus.' },
  { category: 'Tracking', question: 'How accurate is the live tracking?', answer: 'Our hardware sensors update positions every 5 seconds, and our ML models account for campus traffic to provide sub-minute accuracy on ETAs.' },
  { category: 'Tracking', question: 'What if a shuttle goes offline?', answer: 'If a shuttle loses connection, the system falls back to predictive routing based on its last known speed and historical data.' },
  { category: 'Schedules', question: 'What are the operating hours?', answer: 'Most routes operate from 8:00 AM to 8:00 PM on weekdays. Check individual route details for specific timings and weekend schedules.' },
  { category: 'Schedules', question: 'How often do shuttles arrive?', answer: 'During peak hours (8 AM - 10 AM, 4 PM - 6 PM), shuttles arrive every 5-10 minutes. Off-peak frequency is typically 15-20 minutes.' },
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const filteredFaqs = FAQ_DATA.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-8 pb-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-6">Frequently Asked Questions</h1>
          <p className="text-[var(--text-3)] text-lg">Everything you need to know about navigating the VIT campus.</p>
        </div>

        <div className="relative mb-16 max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-3)]" size={20} />
          <input 
            type="text" 
            placeholder="Search questions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-full py-4 pl-12 pr-4 outline-none focus:border-[var(--primary)] transition-colors shadow-lg"
          />
        </div>

        <div className="space-y-6">
          {filteredFaqs.length === 0 ? (
            <div className="text-center text-[var(--text-3)] py-10">No questions found matching your search.</div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index} 
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden transition-all duration-300"
                >
                  <button 
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-[var(--surface-2)] transition-colors focus:outline-none"
                  >
                    <span className="font-medium text-[var(--text)] pr-4">{faq.question}</span>
                    <ChevronDown 
                      size={20} 
                      className={`text-[var(--primary)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="px-6 pb-5 pt-0 text-[var(--text-3)] leading-relaxed border-t border-[var(--border)] mt-1 pt-4">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
