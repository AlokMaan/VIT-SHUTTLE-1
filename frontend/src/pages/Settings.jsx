import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, setAuth, getUserName, getAvatarUrl } from '../utils/auth';
import { auth as authApi, passes, payments, card as cardApi } from '../services/api';

/* ── Card Helpers ── */
function getCardData() {
  const auth = getAuth();
  const stored = JSON.parse(localStorage.getItem('vit-card') || 'null');
  if (stored && stored.userId === auth?.userId) return stored;
  // Generate new card
  const num = `4917 ${Math.floor(1000+Math.random()*9000)} ${Math.floor(1000+Math.random()*9000)} ${Math.floor(1000+Math.random()*9000)}`;
  const card = { userId: auth?.userId, number: num, balance: 500, cvv: Math.floor(100+Math.random()*900), expiry: '03/29', transactions: [] };
  localStorage.setItem('vit-card', JSON.stringify(card));
  return card;
}
function saveCard(c) { localStorage.setItem('vit-card', JSON.stringify(c)); }

const TABS = [
  { label: 'Profile', icon: 'person' },
  { label: 'Shuttle Card', icon: 'credit_card' },
  { label: 'Subscription', icon: 'confirmation_number' },
  { label: 'Shuttle Access', icon: 'qr_code_2' },
  { label: 'Payment History', icon: 'receipt_long' },
  { label: 'Preferences', icon: 'tune' },
  { label: 'Help & Support', icon: 'help' },
];

export default function Settings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const userData = getAuth();
  const userName = getUserName();
  const avatarUrl = getAvatarUrl(userName);

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-tag"><span className="material-symbols-outlined">settings</span> Settings</div>
        <h1>Settings</h1>
        <p>Manage your account, card, passes, and preferences</p>
      </div>

      <div className="grid-main-side" style={{ gridTemplateColumns: '220px 1fr' }}>
        <div className="card" style={{ padding: '.5rem', height: 'fit-content', position: 'sticky', top: 'calc(var(--nav-h) + 1.5rem)' }}>
          {TABS.map((t, i) => (
            <button key={t.label} onClick={() => setTab(i)} style={{
              display: 'flex', alignItems: 'center', gap: '.5rem', width: '100%', padding: '.6rem .75rem',
              borderRadius: 'var(--radius-sm)', border: 'none', background: i === tab ? 'var(--primary-bg)' : 'transparent',
              color: i === tab ? 'var(--primary)' : 'var(--text-3)', fontWeight: i === tab ? 700 : 500,
              fontSize: '.82rem', cursor: 'pointer', transition: 'var(--transition)', textAlign: 'left',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.05rem' }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div>
          {tab === 0 && <ProfileTab userData={userData} avatarUrl={avatarUrl} />}
          {tab === 1 && <ShuttleCardTab />}
          {tab === 2 && <SubscriptionTab navigate={navigate} />}
          {tab === 3 && <ShuttleAccessTab />}
          {tab === 4 && <PaymentHistoryTab />}
          {tab === 5 && <PreferencesTab />}
          {tab === 6 && <HelpTab />}
        </div>
      </div>
    </div>
  );
}

/* ━━━━ PROFILE ━━━━ */
function ProfileTab({ userData, avatarUrl }) {
  const [form, setForm] = useState({
    name: userData?.name || '', phone: userData?.phone || '', regNo: userData?.regNo || '',
    department: userData?.department || '', hostel: userData?.hostel || '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const save = async () => {
    setSaving(true); setMsg('');
    try { await authApi.updateProfile(form); const a = getAuth(); setAuth({ ...a, ...form }); setMsg('✅ Profile updated!'); }
    catch (err) { setMsg(`❌ ${err.message}`); }
    finally { setSaving(false); }
  };
  return (
    <div>
      <div className="card" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
        <img src={avatarUrl} alt="" style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid var(--primary)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{form.name || 'Student'}</div>
          <div style={{ fontSize: '.82rem', color: 'var(--text-3)' }}>{userData?.email}</div>
          <div style={{ display: 'flex', gap: '.4rem', marginTop: '.35rem' }}>
            <span className="badge badge-blue">{userData?.role || 'Student'}</span>
            {form.regNo && <span className="badge badge-purple">{form.regNo}</span>}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-title"><span className="material-symbols-outlined">edit</span>Edit Profile</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={set('name')} /></div>
          <div className="form-group"><label className="form-label">Registration No</label><input className="form-input" value={form.regNo} onChange={set('regNo')} /></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={set('phone')} /></div>
          <div className="form-group"><label className="form-label">Department</label><input className="form-input" value={form.department} onChange={set('department')} /></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">Hostel</label><input className="form-input" value={form.hostel} onChange={set('hostel')} /></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">Email <span style={{ color: 'var(--text-4)', fontWeight: 400 }}>(cannot change)</span></label><input className="form-input" value={userData?.email || ''} disabled style={{ opacity: .6 }} /></div>
        </div>
        {msg && <div style={{ fontSize: '.82rem', marginTop: '.5rem', color: msg.startsWith('✅') ? 'var(--green)' : 'var(--red)' }}>{msg}</div>}
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={save} disabled={saving}>
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{saving ? 'progress_activity' : 'save'}</span>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

/* ━━━━ SHUTTLE CARD (Razorpay + MongoDB) ━━━━ */
function ShuttleCardTab() {
  const auth = getAuth();
  const [cardData, setCardData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addMsg, setAddMsg] = useState('');
  const [paying, setPaying] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const quickAmounts = [100, 200, 500, 1000, 2000];

  useEffect(() => {
    loadCard();
  }, []);

  const loadCard = async () => {
    try {
      const [cRes, tRes] = await Promise.all([cardApi.getCard(), cardApi.transactions()]);
      setCardData(cRes.card);
      setTransactions(tRes.transactions || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Load Razorpay SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        resolve(true); return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleAddMoney = async (amt) => {
    const amount = Number(amt || addAmount);
    if (!amount || amount < 10) { setAddMsg('❌ Minimum ₹10'); return; }
    if (amount > 10000) { setAddMsg('❌ Maximum ₹10,000 per top-up'); return; }

    setPaying(true);
    setAddMsg('');

    try {
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) { setAddMsg('❌ Failed to load Razorpay'); setPaying(false); return; }

      const orderRes = await cardApi.topup(amount);

      const options = {
        key: orderRes.key,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: 'VIT Shuttle',
        description: `Card Top-up ₹${amount}`,
        order_id: orderRes.orderId,
        prefill: { name: auth?.name || '', email: auth?.email || '', contact: auth?.phone || '' },
        theme: { color: '#0d9488' },
        handler: async (response) => {
          try {
            const verifyRes = await cardApi.verifyTopup({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              topupAmount: amount,
            });
            setAddMsg(`✅ ${verifyRes.message} New balance: ₹${verifyRes.newBalance?.toLocaleString('en-IN')}`);
            setAddAmount('');
            loadCard(); // refresh
          } catch (err) { setAddMsg(`❌ ${err.message}`); }
          setPaying(false);
        },
        modal: { ondismiss: () => { setPaying(false); setAddMsg('Payment cancelled.'); } },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setAddMsg(`❌ ${err.message}`);
      setPaying(false);
    }
  };

  if (loading) return <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)' }}>Loading card…</div>;
  if (!cardData) return <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)' }}>Failed to load card.</div>;

  return (
    <div>
      {/* ── The Card ── */}
      <div style={{ perspective: 1000, marginBottom: '1.5rem' }}>
        <div style={{
          width: '100%', maxWidth: 420, aspectRatio: '1.586', borderRadius: 18,
          background: 'linear-gradient(135deg, #0c1220 0%, #14403b 40%, #0d9488 100%)',
          padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.3)',
          fontFamily: "'Inter', 'SF Pro', sans-serif",
        }}>
          <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(13,148,136,.14)', top: -100, right: -80 }} />
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(99,102,241,.08)', bottom: -60, left: -40 }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent)' }} />

          {/* Top row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', opacity: .6, textTransform: 'uppercase' }}>VIT SHUTTLE</div>
              <div style={{ fontSize: '.85rem', fontWeight: 800, letterSpacing: '.06em', marginTop: '.15rem' }}>TRANSIT CARD</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
              <div style={{ width: 28, height: 20, borderRadius: 3, background: 'linear-gradient(135deg, #fbbf24, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 10, height: 10, border: '1px solid rgba(0,0,0,.3)', borderRadius: 2 }} />
              </div>
              <span className="material-symbols-outlined" style={{ fontSize: '1.3rem', opacity: .5 }}>contactless</span>
            </div>
          </div>

          {/* Number */}
          <div style={{ position: 'relative', zIndex: 1, margin: '.5rem 0' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '.2em', fontFamily: "'Courier New', monospace" }}>
              {cardData.number}
            </div>
          </div>

          {/* Bottom */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ fontSize: '.55rem', fontWeight: 600, opacity: .5, textTransform: 'uppercase', letterSpacing: '.08em' }}>CARD HOLDER</div>
              <div style={{ fontSize: '.88rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '.1rem' }}>{cardData.holder || 'STUDENT'}</div>
              <div style={{ fontSize: '.65rem', opacity: .6, marginTop: '.05rem' }}>{cardData.regNo || '—'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '.55rem', fontWeight: 600, opacity: .5, letterSpacing: '.08em' }}>BALANCE</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#4ade80', marginTop: '.1rem', cursor: 'pointer' }} onClick={() => setShowBalance(!showBalance)}>
                {showBalance ? `₹${cardData.balance?.toLocaleString('en-IN')}` : '₹ • • • •'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '.55rem', fontWeight: 600, opacity: .5, letterSpacing: '.08em' }}>VALID</div>
              <div style={{ fontSize: '.78rem', fontWeight: 600, marginTop: '.1rem' }}>{cardData.expiry}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Card Details + Wallet ── */}
      <div className="grid-2" style={{ marginBottom: '1rem' }}>
        <div className="card">
          <div className="card-title"><span className="material-symbols-outlined">credit_card</span>Card Details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            {[
              { l: 'Card Number', v: cardData.number },
              { l: 'Card Holder', v: cardData.holder?.toUpperCase() || '—' },
              { l: 'Registration No', v: cardData.regNo || '—' },
              { l: 'Valid Thru', v: cardData.expiry },
              { l: 'CVV', v: showCvv ? cardData.cvv : '•••', priv: true },
            ].map(r => (
              <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.45rem .6rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>{r.l}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '.84rem', fontFamily: (r.l === 'CVV' || r.l === 'Card Number') ? 'monospace' : 'inherit' }}>{r.v}</span>
                  {r.priv && <button onClick={() => setShowCvv(!showCvv)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-4)' }}><span className="material-symbols-outlined" style={{ fontSize: '.9rem' }}>{showCvv ? 'visibility_off' : 'visibility'}</span></button>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title"><span className="material-symbols-outlined">account_balance_wallet</span>Wallet Balance</div>
          <div style={{ textAlign: 'center', padding: '.5rem 0 1rem' }}>
            <div style={{ fontSize: '.68rem', color: 'var(--text-4)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 700 }}>Available Balance</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--green)', cursor: 'pointer' }} onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? `₹${cardData.balance?.toLocaleString('en-IN')}` : '₹ ••••'}
            </div>
            <div style={{ fontSize: '.72rem', color: 'var(--text-4)', marginTop: '.15rem' }}>Click to {showBalance ? 'hide' : 'reveal'}</div>
          </div>

          <div style={{ fontSize: '.78rem', fontWeight: 700, marginBottom: '.4rem' }}>Quick Top-up (via Razorpay)</div>
          <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap', marginBottom: '.65rem' }}>
            {quickAmounts.map(a => (
              <button key={a} className="btn btn-secondary" style={{ fontSize: '.72rem', padding: '.3rem .55rem' }} onClick={() => handleAddMoney(a)} disabled={paying}>
                +₹{a}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '.35rem' }}>
            <input className="form-input" type="number" placeholder="Custom ₹" value={addAmount} onChange={e => setAddAmount(e.target.value)} style={{ flex: 1 }} disabled={paying} />
            <button className="btn btn-primary" onClick={() => handleAddMoney()} disabled={paying} style={{ whiteSpace: 'nowrap' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '.95rem' }}>{paying ? 'progress_activity' : 'add'}</span>
              {paying ? '…' : 'Add'}
            </button>
          </div>
          {addMsg && <div style={{ fontSize: '.78rem', marginTop: '.5rem', color: addMsg.startsWith('✅') ? 'var(--green)' : 'var(--red)' }}>{addMsg}</div>}
        </div>
      </div>

      {/* ── Card Benefits ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-title"><span className="material-symbols-outlined">stars</span>Card Benefits</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.75rem' }}>
          {[
            { icon: 'speed', title: 'Tap & Ride', desc: 'No pass needed — just tap your card at the bus entrance', color: 'blue' },
            { icon: 'savings', title: 'Auto Deduct', desc: 'Fare auto-deducted from balance. No overpayment.', color: 'green' },
            { icon: 'loyalty', title: 'Rewards', desc: 'Earn 2% cashback on every ride. Redeem for free passes.', color: 'purple' },
            { icon: 'shield', title: 'Secure', desc: 'Encrypted card data. Balance visible only to you.', color: 'orange' },
            { icon: 'autorenew', title: 'Auto Recharge', desc: 'Set auto-recharge when balance drops below ₹50.', color: 'blue' },
            { icon: 'share', title: 'Transfer', desc: 'Send balance to other VIT students instantly.', color: 'green' },
          ].map(b => (
            <div key={b.title} style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-start' }}>
              <div className={`stat-icon ${b.color}`} style={{ width: 32, height: 32, flexShrink: 0 }}><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{b.icon}</span></div>
              <div><div style={{ fontWeight: 700, fontSize: '.82rem' }}>{b.title}</div><div style={{ fontSize: '.7rem', color: 'var(--text-3)', lineHeight: 1.4 }}>{b.desc}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MongoDB Transaction History ── */}
      <div className="card" style={{ padding: 0 }}>
        <button onClick={() => setShowHistory(!showHistory)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 800, fontSize: '.88rem', color: 'var(--text)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>history</span>
            Card Transactions ({transactions.length})
          </div>
          <span className="material-symbols-outlined" style={{ transition: 'transform .2s', transform: showHistory ? 'rotate(180deg)' : 'none' }}>expand_more</span>
        </button>
        {showHistory && (
          transactions.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-4)', borderTop: '1px solid var(--border)' }}>No transactions yet — top-up to get started!</div>
          ) : (
            <div style={{ borderTop: '1px solid var(--border)' }}>
              {transactions.slice(0, 15).map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.65rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.type === 'credit' ? 'var(--green-bg)' : 'var(--red-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '.95rem', color: t.type === 'credit' ? 'var(--green)' : 'var(--red)' }}>
                      {t.type === 'credit' ? 'add' : 'remove'}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '.82rem' }}>{t.desc}</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--text-4)' }}>{new Date(t.date).toLocaleString('en-IN')}</div>
                    {t.paymentId && <div style={{ fontSize: '.6rem', color: 'var(--text-4)', fontFamily: 'monospace' }}>ID: {t.paymentId}</div>}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '.92rem', color: t.type === 'credit' ? 'var(--green)' : 'var(--red)' }}>
                    {t.type === 'credit' ? '+' : '-'}₹{t.amount}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* ━━━━ SUBSCRIPTION ━━━━ */
function SubscriptionTab({ navigate }) {
  const [activePass, setActivePass] = useState(null);
  const [allPasses, setAllPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { Promise.all([passes.active(), passes.myPasses()]).then(([a, m]) => { setActivePass(a.pass); setAllPasses(m.passes || []); }).catch(() => {}).finally(() => setLoading(false)); }, []);
  const PLANS = [
    { type: 'daily', label: 'Daily Pass', price: '₹20', desc: 'Valid for 24 hours', icon: 'today', color: 'blue' },
    { type: 'monthly', label: 'Monthly Pass', price: '₹400', desc: 'Valid for 30 days', icon: 'date_range', color: 'green', popular: true },
    { type: 'yearly', label: 'Yearly Pass', price: '₹3,000', desc: 'Valid for 365 days', icon: 'calendar_month', color: 'purple' },
  ];
  return (
    <div>
      {activePass && (
        <div className="card" style={{ marginBottom: '1rem', background: 'var(--green-bg)', borderColor: 'var(--green)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}><span className="material-symbols-outlined" style={{ fontSize: '1.3rem', color: 'var(--green)' }}>verified</span><div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: '.92rem', color: 'var(--green)' }}>Active: {activePass.type?.toUpperCase()} PASS</div><div style={{ fontSize: '.76rem', color: 'var(--text-3)' }}>Expires {new Date(activePass.endDate).toLocaleDateString('en-IN')}</div></div></div>
        </div>
      )}
      <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
        {PLANS.map(p => (
          <div key={p.type} className="card" style={{ position: 'relative', border: p.popular ? '2px solid var(--primary)' : undefined, textAlign: 'center', padding: '1.5rem' }}>
            {p.popular && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--grad-primary)', color: '#fff', fontSize: '.6rem', fontWeight: 800, padding: '.18rem .65rem', borderRadius: 'var(--radius-full)' }}>BEST VALUE</div>}
            <div className={`stat-icon ${p.color}`} style={{ margin: '0 auto .65rem' }}><span className="material-symbols-outlined">{p.icon}</span></div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>{p.label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', margin: '.3rem 0' }}>{p.price}</div>
            <div style={{ fontSize: '.76rem', color: 'var(--text-3)', marginBottom: '1rem', lineHeight: 1.5 }}>{p.desc}</div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate(`/portal/buy-pass?type=${p.type}`)}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>shopping_cart</span> Buy Now
            </button>
          </div>
        ))}
      </div>
      {allPasses.length > 0 && (
        <div className="card" style={{ padding: 0 }}><div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '.88rem' }}><span className="material-symbols-outlined" style={{ fontSize: '1rem', color: 'var(--primary)' }}>history</span> Pass History ({allPasses.length})</div>
          <div className="table-wrap"><table className="table"><thead><tr><th>Type</th><th>Status</th><th>Start</th><th>End</th></tr></thead><tbody>{allPasses.map(p => (<tr key={p._id}><td><span className="badge badge-blue">{p.type}</span></td><td><span className={`status-pill ${p.status === 'active' ? 'active' : 'offline'}`}>{p.status}</span></td><td style={{ fontSize: '.76rem' }}>{new Date(p.startDate).toLocaleDateString('en-IN')}</td><td style={{ fontSize: '.76rem' }}>{new Date(p.endDate).toLocaleDateString('en-IN')}</td></tr>))}</tbody></table></div>
        </div>
      )}
    </div>
  );
}

/* ━━━━ SHUTTLE ACCESS ━━━━ */
function ShuttleAccessTab() {
  const [activePass, setActivePass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  useEffect(() => { passes.active().then(res => setActivePass(res.pass)).catch(() => {}).finally(() => setLoading(false)); return () => stopCamera(); }, []);
  const startCamera = async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); streamRef.current = stream; if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); } setCameraActive(true); } catch { alert('Camera access denied.'); } };
  const stopCamera = () => { if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; } setCameraActive(false); };
  const handleVerify = async () => { if (!verifyCode.trim()) return; try { const res = await passes.verify(verifyCode.trim()); setVerifyResult(res); } catch (err) { setVerifyResult({ valid: false, message: err.message }); } };
  return (
    <div><div className="grid-2">
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="card-title" style={{ justifyContent: 'center' }}><span className="material-symbols-outlined">qr_code_2</span> My Shuttle Pass</div>
        {loading ? <div style={{ padding: '2rem', color: 'var(--text-3)' }}>Loading…</div> : activePass ? (
          <div>
            <div style={{ width: 200, height: 200, margin: '0 auto 1rem', borderRadius: 'var(--radius-lg)', background: '#fff', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(activePass.qrCode)}`} alt="QR" style={{ width: 180, height: 180 }} />
            </div>
            <div className="badge badge-green" style={{ marginBottom: '.5rem', padding: '.25rem .7rem' }}>✓ ACTIVE</div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>{activePass.type?.toUpperCase()} PASS</div>
            <div style={{ fontSize: '.76rem', color: 'var(--text-3)', marginTop: '.25rem' }}>Valid until {new Date(activePass.endDate).toLocaleDateString('en-IN')}</div>
          </div>
        ) : (
          <div style={{ padding: '2rem' }}><span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--text-4)', display: 'block', marginBottom: '.5rem' }}>credit_card_off</span><div style={{ fontWeight: 700, color: 'var(--text-3)' }}>No Active Pass</div><button className="btn btn-primary" onClick={() => navigate('/portal/buy-pass')} style={{ marginTop: '.75rem' }}><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>shopping_cart</span> Buy Pass</button></div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="card">
          <div className="card-title"><span className="material-symbols-outlined">qr_code_scanner</span>QR Scanner</div>
          <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000', marginBottom: '.75rem', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {cameraActive ? (<><video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline muted /><div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}><div style={{ width: 180, height: 180, border: '3px solid rgba(13,148,136,.7)', borderRadius: 12, boxShadow: '0 0 0 9999px rgba(0,0,0,.3)' }} /></div></>) : (<div style={{ textAlign: 'center', color: 'var(--text-4)' }}><span className="material-symbols-outlined" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '.35rem' }}>photo_camera</span><div style={{ fontSize: '.78rem' }}>Camera preview</div></div>)}
          </div>
          <button className={`btn ${cameraActive ? 'btn-danger' : 'btn-primary'}`} style={{ width: '100%', justifyContent: 'center' }} onClick={cameraActive ? stopCamera : startCamera}><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{cameraActive ? 'videocam_off' : 'videocam'}</span>{cameraActive ? 'Stop Camera' : 'Start Camera'}</button>
        </div>
        <div className="card">
          <div className="card-title"><span className="material-symbols-outlined">search</span>Manual Verify</div>
          <div className="form-group"><label className="form-label">QR Code String</label><input className="form-input" placeholder="VIT-PASS-xxxx" value={verifyCode} onChange={e => setVerifyCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleVerify()} /></div>
          <button className="btn btn-primary" onClick={handleVerify}><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>verified</span> Verify</button>
          {verifyResult && (<div style={{ marginTop: '.75rem', padding: '.75rem', borderRadius: 'var(--radius-md)', background: verifyResult.valid ? 'var(--green-bg)' : 'var(--red-bg)' }}><div style={{ fontWeight: 700, fontSize: '.88rem', color: verifyResult.valid ? 'var(--green)' : 'var(--red)', display: 'flex', alignItems: 'center', gap: '.4rem' }}><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>{verifyResult.valid ? 'check_circle' : 'cancel'}</span>{verifyResult.valid ? 'Valid Pass ✓' : 'Invalid Pass ✗'}</div><div style={{ fontSize: '.76rem', color: 'var(--text-3)', marginTop: '.2rem' }}>{verifyResult.message}</div></div>)}
        </div>
      </div>
    </div></div>
  );
}

/* ━━━━ PAYMENT HISTORY ━━━━ */
function PaymentHistoryTab() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { payments.history().then(res => setHistory(res.payments || [])).catch(() => {}).finally(() => setLoading(false)); }, []);
  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '.92rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}><span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>receipt_long</span>Payment History</div>
      {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)' }}>Loading…</div> : history.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}><span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--text-4)', display: 'block', marginBottom: '.5rem' }}>receipt_long</span><div style={{ color: 'var(--text-3)', fontSize: '.88rem' }}>No payments yet</div></div>
      ) : (
        <div className="table-wrap"><table className="table"><thead><tr><th>Receipt</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>{history.map(p => (<tr key={p._id}><td style={{ fontWeight: 600 }}>{p.receiptNumber || p._id.slice(-6).toUpperCase()}</td><td><span className="badge badge-blue">{p.passType}</span></td><td style={{ fontWeight: 700 }}>₹{(p.amount / 100).toFixed(0)}</td><td><span className={`status-pill ${p.status === 'paid' ? 'active' : 'offline'}`}>{p.status}</span></td><td style={{ fontSize: '.76rem', color: 'var(--text-3)' }}>{p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : '—'}</td></tr>))}</tbody></table></div>
      )}
    </div>
  );
}

/* ━━━━ PREFERENCES ━━━━ */
function PreferencesTab() {
  const [theme, setTheme] = useState(localStorage.getItem('vit-theme') || 'light');
  const [notifs, setNotifs] = useState(true);
  const [language, setLanguage] = useState('en');
  const toggleTheme = () => { const next = theme === 'dark' ? 'light' : 'dark'; setTheme(next); localStorage.setItem('vit-theme', next); document.documentElement.setAttribute('data-theme', next); };
  return (
    <div className="card">
      <div className="card-title"><span className="material-symbols-outlined">tune</span>Preferences</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)' }}><div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}><span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>{theme === 'dark' ? 'dark_mode' : 'light_mode'}</span><div><div style={{ fontWeight: 700, fontSize: '.88rem' }}>Theme</div><div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</div></div></div><button className="btn btn-secondary" style={{ fontSize: '.78rem' }} onClick={toggleTheme}>Switch to {theme === 'dark' ? 'Light' : 'Dark'}</button></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)' }}><div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}><span className="material-symbols-outlined" style={{ color: 'var(--orange)' }}>notifications</span><div><div style={{ fontWeight: 700, fontSize: '.88rem' }}>Push Notifications</div><div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>Delays & schedule alerts</div></div></div><label style={{ position: 'relative', width: 42, height: 24, cursor: 'pointer' }}><input type="checkbox" checked={notifs} onChange={() => setNotifs(!notifs)} style={{ opacity: 0, width: 0, height: 0 }} /><span style={{ position: 'absolute', inset: 0, borderRadius: 12, background: notifs ? 'var(--primary)' : 'var(--surface-3)', transition: '.2s' }}><span style={{ position: 'absolute', top: 2, left: notifs ? 20 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: '.2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} /></span></label></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)' }}><div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}><span className="material-symbols-outlined" style={{ color: 'var(--green)' }}>language</span><div><div style={{ fontWeight: 700, fontSize: '.88rem' }}>Language</div><div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>Interface language</div></div></div><select value={language} onChange={e => setLanguage(e.target.value)} className="form-input" style={{ width: 'auto', padding: '.4rem .6rem', fontSize: '.8rem' }}><option value="en">English</option><option value="hi">हिन्दी</option><option value="ta">தமிழ்</option></select></div>
      </div>
    </div>
  );
}

/* ━━━━ HELP ━━━━ */
function HelpTab() {
  const FAQS = [
    { q: 'How do I buy a shuttle pass?', a: 'Go to Settings → Subscription or click "Buy Pass". Choose Daily, Monthly, or Yearly and pay with Razorpay.' },
    { q: 'How do I use VIT Shuttle Card?', a: 'Go to Settings → Shuttle Card to view your card details and balance. Add money via quick top-up or custom amount.' },
    { q: 'How does the QR code work?', a: 'Open Settings → Shuttle Access. Show the QR code to the bus driver when boarding. The driver scans it to verify.' },
    { q: 'What routes are available?', a: 'Check the Schedule tab for Route Alpha, Beta, and Charlie with all stops and timings.' },
    { q: 'How do I report an issue?', a: 'Use Chat or contact the helpline at 0416-220-2020.' },
  ];
  const [open, setOpen] = useState(-1);
  return (
    <div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="card-title"><span className="material-symbols-outlined">help</span>FAQ</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
          {FAQS.map((f, i) => (<div key={i} style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}><button onClick={() => setOpen(open === i ? -1 : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem', background: open === i ? 'var(--primary-bg)' : 'var(--surface-2)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '.84rem', color: 'var(--text)', textAlign: 'left' }}>{f.q}<span className="material-symbols-outlined" style={{ fontSize: '1rem', color: 'var(--primary)', transition: 'transform .2s', transform: open === i ? 'rotate(180deg)' : 'none' }}>expand_more</span></button>{open === i && <div style={{ padding: '.75rem', fontSize: '.82rem', color: 'var(--text-3)', lineHeight: 1.6, borderTop: '1px solid var(--border)' }}>{f.a}</div>}</div>))}
        </div>
      </div>
      <div className="card">
        <div className="card-title"><span className="material-symbols-outlined">contact_support</span>Contact</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
          {[{ icon: 'call', title: 'Helpline', val: '0416-220-2020', color: 'primary' }, { icon: 'mail', title: 'Email', val: 'transport@vit.ac.in', color: 'green' }, { icon: 'location_on', title: 'Office', val: 'Admin Block, Room 204', color: 'orange' }, { icon: 'schedule', title: 'Hours', val: 'Mon-Sat: 8AM - 6PM', color: 'purple' }].map(c => (
            <div key={c.title} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: '.6rem' }}><span className="material-symbols-outlined" style={{ color: `var(--${c.color})`, fontSize: '1.3rem' }}>{c.icon}</span><div><div style={{ fontWeight: 700, fontSize: '.84rem' }}>{c.title}</div><div style={{ fontSize: '.76rem', color: 'var(--text-3)' }}>{c.val}</div></div></div>
          ))}
        </div>
      </div>
    </div>
  );
}
