import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Map, Clock, Route as RouteIcon, Users, ChevronRight, Activity } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <div 
    className="feature-card flex flex-col items-start p-6 rounded-[var(--radius-lg)] border"
    style={{ 
      backgroundColor: 'rgba(20, 28, 46, 0.6)', 
      borderColor: 'var(--border)',
      backdropFilter: 'blur(12px)'
    }}
  >
    <div 
      className="p-3 mb-4 rounded-xl"
      style={{ backgroundColor: 'rgba(0, 212, 184, 0.1)', color: 'var(--primary)' }}
    >
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold mb-2 text-[var(--text)]">{title}</h3>
    <p className="text-[var(--text-3)] leading-relaxed">{description}</p>
  </div>
);

const StatCounter = ({ end, label, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const counterRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCount(end);
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: counterRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: end,
            duration: 2,
            ease: 'power2.out',
            onUpdate: function() {
              setCount(Math.floor(this.targets()[0].val));
            }
          });
        },
        once: true
      });
    }, counterRef);
    return () => ctx.revert();
  }, [end]);

  return (
    <div ref={counterRef} className="text-center p-6">
      <div 
        className="text-4xl md:text-5xl font-black mb-2"
        style={{ 
          background: 'var(--grad-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        {count}{suffix}
      </div>
      <div className="text-[var(--text-2)] font-medium tracking-wide uppercase text-sm">
        {label}
      </div>
    </div>
  );
};

export default function LandingPage() {
  const containerRef = useRef(null);
  const layersRef = useRef([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Parallax effect
      layersRef.current.forEach((layer, i) => {
        if (!layer) return;
        const speed = (i + 1) * 0.15;
        gsap.to(layer, {
          y: () => window.innerHeight * speed,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        });
      });

      // Feature cards stagger reveal
      gsap.from('.feature-card', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.features-section',
          start: 'top 75%'
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full bg-[var(--bg)] min-h-screen flex flex-col overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative w-full min-h-[calc(100vh-64px)] overflow-hidden flex items-center justify-center pt-24 pb-16">
        {/* CSS/SVG Parallax Background */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #080c14 0%, #141c2e 100%)' }}>
          
          {/* Layer 1: Distant silhouette */}
          <div ref={el => layersRef.current[0] = el} className="absolute inset-0 w-full h-full will-change-transform opacity-30">
            <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto" preserveAspectRatio="none">
              <path fill="var(--surface-2)" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>

          {/* Layer 2: Mid-ground buildings */}
          <div ref={el => layersRef.current[1] = el} className="absolute inset-0 w-full h-full will-change-transform opacity-50">
            <svg viewBox="0 0 1440 250" className="absolute bottom-0 w-full h-auto" preserveAspectRatio="none">
              <rect x="100" y="50" width="80" height="200" fill="var(--surface)" rx="4" />
              <rect x="300" y="80" width="120" height="170" fill="var(--surface)" rx="4" />
              <rect x="600" y="30" width="90" height="220" fill="var(--surface)" rx="4" />
              <rect x="850" y="100" width="150" height="150" fill="var(--surface)" rx="4" />
              <rect x="1150" y="60" width="100" height="190" fill="var(--surface)" rx="4" />
            </svg>
          </div>

          {/* Layer 3: Roads */}
          <div ref={el => layersRef.current[2] = el} className="absolute inset-0 w-full h-full will-change-transform">
             <svg viewBox="0 0 1440 100" className="absolute bottom-0 w-full h-auto" preserveAspectRatio="none">
               <path d="M0,80 Q360,20 720,50 T1440,80 L1440,100 L0,100 Z" fill="#0a0f18" />
               <path d="M0,80 Q360,20 720,50 T1440,80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="10 10" />
             </svg>
          </div>

          {/* Layer 4: Foreground elements */}
          <div ref={el => layersRef.current[3] = el} className="absolute inset-0 w-full h-full will-change-transform">
            <svg viewBox="0 0 1440 50" className="absolute bottom-0 w-full h-auto" preserveAspectRatio="none">
              <circle cx="150" cy="40" r="15" fill="var(--primary)" opacity="0.1" />
              <circle cx="150" cy="40" r="4" fill="var(--primary)" />
              <rect x="148" y="44" width="4" height="20" fill="var(--surface)" />
              
              <circle cx="950" cy="30" r="15" fill="var(--accent)" opacity="0.1" />
              <circle cx="950" cy="30" r="4" fill="var(--accent)" />
              <rect x="948" y="34" width="4" height="30" fill="var(--surface)" />
            </svg>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border" style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(14, 20, 32, 0.6)', backdropFilter: 'blur(8px)' }}>
            <Activity size={16} className="text-[var(--primary)]" />
            <span className="text-[var(--text-2)] text-sm font-medium">ShuttleAI v2.0 is Live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-[var(--text)]">
            Never Miss Your <br className="hidden md:block" />
            <span style={{ 
              background: 'var(--grad-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'var(--shadow-glow)'
            }}>Shuttle Again</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[var(--text-3)] mb-10 max-w-2xl mx-auto leading-relaxed">
            The intelligent transport network for VIT Vellore. Track live locations, get smart ETAs, and navigate campus with ease.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/track"
              className="flex items-center justify-center w-full sm:w-auto px-8 py-4 rounded-[var(--radius-lg)] font-bold text-[#080c14] transition-transform hover:scale-105 active:scale-95"
              style={{ background: 'var(--grad-primary)', boxShadow: 'var(--shadow-glow)' }}
            >
              <Map size={20} className="mr-2" />
              Track Live
            </Link>
            <Link 
              to="/routes"
              className="flex items-center justify-center w-full sm:w-auto px-8 py-4 rounded-[var(--radius-lg)] font-bold text-[var(--text)] transition-colors border hover:bg-[var(--surface-2)]"
              style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <RouteIcon size={20} className="mr-2" />
              View Routes
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative z-10 border-y" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 divide-x divide-[var(--border)]">
            <StatCounter end={5} label="Active Routes" />
            <StatCounter end={15} label="Campus Stops" suffix="+" />
            <StatCounter end={10} label="Live Shuttles" suffix="+" />
            <StatCounter end={2000} label="Daily Users" suffix="+" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-24 container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text)]">Smarter Campus Commutes</h2>
          <p className="text-[var(--text-3)] max-w-2xl mx-auto">Everything you need to get around campus efficiently, all in one place.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={Map}
            title="Live Tracking"
            description="Watch shuttles move in real-time on our interactive campus map with sub-second latency."
          />
          <FeatureCard 
            icon={Clock}
            title="Smart ETAs"
            description="Machine learning powered arrival predictions that factor in traffic and campus delays."
          />
          <FeatureCard 
            icon={RouteIcon}
            title="Route Planning"
            description="Find the optimal route to your class or hostel. We'll show you exactly where to wait."
          />
          <FeatureCard 
            icon={Users}
            title="Capacity Info"
            description="Know how crowded a shuttle is before it arrives with our live occupancy indicators."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-center relative z-10" style={{ background: 'var(--surface)' }}>
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text)]">Ready to Ride?</h2>
          <p className="text-[var(--text-3)] mb-8 text-lg leading-relaxed">
            Join thousands of VIT students who never miss a shuttle. Sign up takes less than 30 seconds.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-[var(--radius-lg)] font-bold text-[#080c14] transition-transform hover:scale-105 active:scale-95 no-underline"
            style={{ background: 'var(--grad-primary)', boxShadow: 'var(--shadow-glow)' }}
          >
            Get Started <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Credits */}
      <div className="text-center py-6 pb-10" style={{ backgroundColor: 'var(--bg)' }}>
        <p className="text-sm" style={{ color: 'var(--text-4)' }}>
          Built by Alok Maan, Arshdeep Singh, Ankush, Saksham & Aviral | VIT Vellore
        </p>
      </div>

    </div>
  );
}
