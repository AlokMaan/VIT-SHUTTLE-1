import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, getUserName, getAvatarUrl } from '../utils/auth';

// ── Scroll-reveal hook
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ── Animated counter
function CountUp({ to, duration = 1800, suffix = '' }) {
  const [val, setVal] = useState(0);
  const [ref, visible] = useScrollReveal(0.3);
  useEffect(() => {
    if (!visible) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(ease * to));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, to, duration]);
  return <span ref={ref}>{val.toLocaleString('en-IN')}{suffix}</span>;
}

const ROUTE_COLOURS = {
  Alpha:   { color: '#00d4b8', bg: 'rgba(0,212,184,.1)',   stops: ['Main Gate', 'SJT Block', 'SMV Block', 'Tech Tower', "Men's Hostel"] },
  Beta:    { color: '#7c6dfa', bg: 'rgba(124,109,250,.1)', stops: ['Library / LRC', 'GDN Block', 'MB Labs', 'Annapurna'] },
  Charlie: { color: '#ff9d4d', bg: 'rgba(255,157,77,.1)',  stops: ['Gate 2 (South)', 'Sports Ground', 'Admin Block', "Women's Hostel"] },
};

const STATS = [
  { label: 'Active Buses',    value: 4,    suffix: '',   icon: 'directions_bus', color: 'var(--primary)', glow: 'var(--primary-glow)', desc: 'On campus right now' },
  { label: 'On-Time Rate',    value: 94,   suffix: '%',  icon: 'speed',          color: 'var(--green)',   glow: 'var(--green-glow)',   desc: 'Last 7 days average' },
  { label: 'Routes Active',   value: 3,    suffix: '',   icon: 'route',          color: 'var(--accent)',  glow: 'var(--accent-glow)',  desc: 'Alpha · Beta · Charlie' },
  { label: 'Students Served', value: 2840, suffix: '+',  icon: 'group',          color: 'var(--orange)',  glow: 'var(--orange-glow)',  desc: 'This semester' },
];

const QUICK_ACTIONS = [
  { label: 'Live Tracking',  icon: 'location_on',         to: '/portal/live-map', color: 'var(--primary)', bg: 'var(--primary-bg)' },
  { label: 'Schedule',       icon: 'calendar_month',      to: '/portal/schedule', color: 'var(--accent)',  bg: 'var(--accent-bg)'  },
  { label: 'Buy Pass',       icon: 'confirmation_number', to: '/portal/buy-pass', color: 'var(--green)',   bg: 'var(--green-bg)'   },
  { label: 'Fleet Status',   icon: 'directions_bus',      to: '/portal/fleet',    color: 'var(--orange)',  bg: 'var(--orange-bg)'  },
  { label: 'Alerts',         icon: 'notifications',       to: '/portal/alerts',   color: 'var(--red)',     bg: 'var(--red-bg)'     },
  { label: 'Support',        icon: 'chat_bubble',         to: '/portal/chat',     color: 'var(--purple)',  bg: 'var(--purple-bg)'  },
];

const SCHEDULE_PREVIEW = [
  { route: 'Alpha',   from: 'Main Gate',  to: "Men's Hostel",    time: '06:00 AM', status: 'On Time' },
  { route: 'Beta',    from: 'Library',    to: 'Annapurna',        time: '06:30 AM', status: 'On Time' },
  { route: 'Charlie', from: 'Gate 2',     to: "Women's Hostel",   time: '07:00 AM', status: 'Delayed' },
  { route: 'Alpha',   from: 'Main Gate',  to: "Men's Hostel",    time: '07:30 AM', status: 'On Time' },
  { route: 'Beta',    from: 'Library',    to: 'Annapurna',        time: '08:00 AM', status: 'On Time' },
];

export default function Portal() {
  const navigate = useNavigate();
  const userName = getUserName();
  const heroImgRef = useRef(null);

  // Parallax on scroll
  useEffect(() => {
    const fn = () => {
      if (!heroImgRef.current) return;
      heroImgRef.current.style.transform = `translateY(${window.scrollY * 0.38}px) scale(1.12)`;
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const [statsRef, statsVisible]       = useScrollReveal(0.1);
  const [actionsRef, actionsVisible]   = useScrollReveal(0.1);
  const [routesRef, routesVisible]     = useScrollReveal(0.1);
  const [scheduleRef, scheduleVisible] = useScrollReveal(0.1);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="portal-root">

      {/* ══════════ HERO ══════════ */}
      <section className="portal-hero">
        <div className="portal-hero-img-wrap">
          <img ref={heroImgRef} src="/assets/campus.jpg" alt="VIT Vellore campus" className="portal-hero-img" />
          <div className="portal-hero-overlay" />
        </div>

        <div className="portal-hero-content">
          <div className="portal-hero-tag fade-up">
            <span className="live-dot" style={{ width: 7, height: 7 }} />
            <span>System Live · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
          <h1 className="portal-hero-title fade-up" style={{ animationDelay: '.1s' }}>
            {greeting()},<br />
            <span className="portal-hero-name">{userName.split(' ')[0]}</span> 👋
          </h1>
          <p className="portal-hero-sub fade-up" style={{ animationDelay: '.2s' }}>
            VIT Vellore Campus Transit System — 4 shuttles active, all routes on schedule
          </p>
          <div className="portal-hero-btns fade-up" style={{ animationDelay: '.3s' }}>
            <button className="hero-btn-primary" onClick={() => navigate('/portal/live-map')}>
              <span className="material-symbols-outlined">location_on</span>
              Track Live
            </button>
            <button className="hero-btn-ghost" onClick={() => navigate('/portal/schedule')}>
              <span className="material-symbols-outlined">calendar_month</span>
              View Schedule
            </button>
          </div>
        </div>

        <div className="portal-hero-hud fade-up" style={{ animationDelay: '.45s' }}>
          {[
            { label: 'Next Bus',    value: '06 min', icon: 'schedule',           color: 'var(--primary)' },
            { label: 'Route Alpha', value: 'On Time', icon: 'check_circle',      color: 'var(--green)' },
            { label: 'Pass Valid',  value: '22 days', icon: 'confirmation_number', color: 'var(--accent)' },
          ].map((h) => (
            <div key={h.label} className="hero-hud-card">
              <span className="material-symbols-outlined" style={{ fontSize: '1.15rem', color: h.color }}>{h.icon}</span>
              <div>
                <div className="hero-hud-val">{h.value}</div>
                <div className="hero-hud-label">{h.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="portal-scroll-cue">
          <span className="material-symbols-outlined">keyboard_arrow_down</span>
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <section ref={statsRef} className="portal-section" style={{ paddingTop: '3rem' }}>
        <div className={`portal-stats-grid stagger ${statsVisible ? 'reveal-done' : 'reveal-hidden'}`}>
          {STATS.map((s) => (
            <div key={s.label} className="stat-card fade-up">
              <div className="stat-card-top">
                <div className="stat-icon-wrap" style={{ background: `color-mix(in srgb, ${s.color} 12%, transparent)`, boxShadow: `0 0 20px ${s.glow}` }}>
                  <span className="material-symbols-outlined" style={{ color: s.color }}>{s.icon}</span>
                </div>
                <span className="stat-card-arrow material-symbols-outlined">arrow_outward</span>
              </div>
              <div className="stat-val" style={{ color: s.color }}>
                <CountUp to={s.value} suffix={s.suffix} />
              </div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-desc">{s.desc}</div>
              <div className="stat-bar">
                <div className="stat-bar-fill" style={{ background: s.color, width: `${Math.min((s.value / (s.suffix === '%' ? 100 : s.value * 1.3)) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ QUICK ACTIONS ══════════ */}
      <section ref={actionsRef} className="portal-section">
        <div className={`section-header ${actionsVisible ? 'reveal-done' : 'reveal-hidden'}`}>
          <div>
            <div className="page-tag"><span className="material-symbols-outlined">bolt</span> Quick Access</div>
            <h2 className="section-title">What would you like to do?</h2>
          </div>
        </div>
        <div className={`quick-actions-grid stagger ${actionsVisible ? 'reveal-done' : 'reveal-hidden'}`}>
          {QUICK_ACTIONS.map((a) => (
            <button key={a.label} className="qa-card fade-up" onClick={() => navigate(a.to)}>
              <div className="qa-icon" style={{ background: a.bg, color: a.color }}>
                <span className="material-symbols-outlined">{a.icon}</span>
              </div>
              <span className="qa-label">{a.label}</span>
              <span className="material-symbols-outlined qa-arrow">arrow_forward</span>
            </button>
          ))}
        </div>
      </section>

      {/* ══════════ ROUTES ══════════ */}
      <section ref={routesRef} className="portal-section">
        <div className={`section-header ${routesVisible ? 'reveal-done' : 'reveal-hidden'}`}>
          <div>
            <div className="page-tag"><span className="material-symbols-outlined">route</span> Active Routes</div>
            <h2 className="section-title">Campus Route Network</h2>
          </div>
          <button className="section-link" onClick={() => navigate('/portal/live-map')}>
            View Live Map <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
        <div className={`routes-grid stagger ${routesVisible ? 'reveal-done' : 'reveal-hidden'}`}>
          {Object.entries(ROUTE_COLOURS).map(([name, route], idx) => (
            <div
              key={name}
              className="route-card fade-up"
              onClick={() => navigate('/portal/live-map')}
              style={{ '--route-color': route.color, '--route-bg': route.bg, animationDelay: `${idx * .1}s` }}
            >
              <div className="route-card-glow" />
              <div className="route-card-header">
                <div className="route-badge" style={{ background: route.bg, color: route.color }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '.9rem' }}>directions_bus</span>
                  Route {name}
                </div>
                <span className="live-badge" style={{ fontSize: '.6rem' }}>
                  <span className="live-dot" style={{ width: 6, height: 6 }} />
                  LIVE
                </span>
              </div>
              <div className="stop-chain">
                {route.stops.map((stop, i) => (
                  <div key={stop} className="stop-chain-item">
                    <div className="stop-chain-dot" style={{
                      background: i === 0 || i === route.stops.length - 1 ? route.color : 'transparent',
                      border: `2px solid ${route.color}`,
                    }} />
                    {i < route.stops.length - 1 && <div className="stop-chain-line" style={{ background: `${route.color}40` }} />}
                    <span className="stop-chain-label" style={{ color: (i === 0 || i === route.stops.length - 1) ? 'var(--text)' : 'var(--text-3)', fontWeight: (i === 0 || i === route.stops.length - 1) ? 700 : 400 }}>
                      {stop}
                    </span>
                  </div>
                ))}
              </div>
              <div className="route-card-footer">
                <span style={{ fontSize: '.72rem', color: 'var(--text-4)' }}>
                  VIT-00{idx + 1} · {['18', '16', '15'][idx]} km/h
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: route.color }}>chevron_right</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ SCHEDULE ══════════ */}
      <section ref={scheduleRef} className="portal-section" style={{ paddingBottom: '3rem' }}>
        <div className={`section-header ${scheduleVisible ? 'reveal-done' : 'reveal-hidden'}`}>
          <div>
            <div className="page-tag"><span className="material-symbols-outlined">schedule</span> Today</div>
            <h2 className="section-title">Upcoming Departures</h2>
          </div>
          <button className="section-link" onClick={() => navigate('/portal/schedule')}>
            Full Schedule <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
        <div className={`schedule-list ${scheduleVisible ? 'reveal-done' : 'reveal-hidden'}`}>
          {SCHEDULE_PREVIEW.map((item, i) => {
            const rc = ROUTE_COLOURS[item.route];
            return (
              <div key={i} className="schedule-row fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="schedule-route-dot" style={{ background: rc.color, boxShadow: `0 0 10px ${rc.color}60` }} />
                <div className="schedule-route-tag" style={{ color: rc.color, background: rc.bg }}>{item.route}</div>
                <div className="schedule-from-to">
                  <span>{item.from}</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '.85rem', color: 'var(--text-4)' }}>east</span>
                  <span>{item.to}</span>
                </div>
                <div className="schedule-time">{item.time}</div>
                <div className={`schedule-status ${item.status === 'On Time' ? 'on-time' : 'delayed'}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '.85rem' }}>
                    {item.status === 'On Time' ? 'check_circle' : 'warning'}
                  </span>
                  {item.status}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
