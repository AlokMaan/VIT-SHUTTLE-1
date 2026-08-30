import React from 'react';
import { Terminal, Database, Map as MapIcon } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-[var(--bg)] pt-8 pb-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-black mb-6 text-[var(--text)]">
            About <span style={{ color: 'var(--primary)' }}>ShuttleAI</span>
          </h1>
          <p className="text-xl text-[var(--text-3)] max-w-2xl mx-auto leading-relaxed">
            Redefining campus mobility at VIT Vellore through real-time intelligence and community-driven technology.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-8 md:p-12 mb-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full" style={{ background: 'var(--grad-primary)' }}></div>
          <h2 className="text-3xl font-bold text-[var(--text)] mb-6">Our Mission</h2>
          <p className="text-lg text-[var(--text-2)] leading-relaxed mb-6">
            With thousands of students traversing the sprawling VIT campus daily, the need for a reliable, predictable transport system has never been higher. ShuttleAI was built to eliminate the guesswork of commuting.
          </p>
          <p className="text-lg text-[var(--text-2)] leading-relaxed">
            By combining IoT hardware with smart prediction models, we aim to make every commute seamless, ensuring students spend less time waiting and more time learning.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-[var(--text)] mb-10 text-center">Powered By</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 text-center hover:border-[var(--primary)] transition-colors">
              <Terminal size={40} className="mx-auto mb-4 text-[var(--primary)]" />
              <h3 className="text-xl font-bold text-[var(--text)] mb-2">Modern Frontend</h3>
              <p className="text-[var(--text-3)]">Built with React 19, Vite, and Tailwind CSS for lightning-fast, responsive UI.</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 text-center hover:border-[var(--accent)] transition-colors">
              <Database size={40} className="mx-auto mb-4 text-[var(--accent)]" />
              <h3 className="text-xl font-bold text-[var(--text)] mb-2">Robust Backend</h3>
              <p className="text-[var(--text-3)]">Node.js and MongoDB handling thousands of realtime spatial queries effortlessly.</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
              <MapIcon size={40} className="mx-auto mb-4 text-blue-400" />
              <h3 className="text-xl font-bold text-[var(--text)] mb-2">Spatial Intelligence</h3>
              <p className="text-[var(--text-3)]">Powered by Leaflet and custom ML models for accurate routing and ETAs.</p>
            </div>
          </div>
        </div>

        {/* Credits */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[var(--text)] mb-4">Meet the Team</h2>
            <p className="text-[var(--text-3)] max-w-2xl mx-auto">
              Proudly Built by VIT Vellore Students. Supported by IEEE PELS VIT Student Chapter.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Alok Maan', role: 'Lead Developer' },
              { name: 'Arshdeep Singh', role: 'Backend Engineer' },
              { name: 'Ankush', role: 'Frontend Developer' },
              { name: 'Saksham', role: 'UI/UX Designer' },
              { name: 'Aviral', role: 'Systems Architect' }
            ].map((member, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center p-6 rounded-[var(--radius-lg)]"
                style={{ 
                  background: 'rgba(14,20,32,0.7)', 
                  backdropFilter: 'blur(12px)', 
                  border: '1px solid var(--border)' 
                }}
              >
                <img 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=0e1420&textColor=00d4b8`} 
                  alt={member.name} 
                  className="w-20 h-20 rounded-full mb-4 border-2" 
                  style={{ borderColor: 'var(--primary)' }} 
                />
                <h3 className="text-xl font-bold text-[var(--text)]">{member.name}</h3>
                <p className="text-sm mt-1 font-medium" style={{ color: 'var(--primary)' }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
