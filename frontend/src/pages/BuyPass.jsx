import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { payments } from '../services/api';
import { getAuth } from '../utils/auth';

const PLANS = {
  daily:   { label: 'Daily Pass',   price: 20,    priceDisplay: '₹20',    days: 1,   icon: 'today',           color: 'blue',   desc: 'Valid for 24 hours • Perfect for one-time rides' },
  monthly: { label: 'Monthly Pass', price: 400,   priceDisplay: '₹400',   days: 30,  icon: 'date_range',      color: 'green',  desc: 'Valid for 30 days • Best value for regulars' },
  yearly:  { label: 'Yearly Pass',  price: 3000,  priceDisplay: '₹3,000', days: 365, icon: 'calendar_month',  color: 'purple', desc: 'Valid for 365 days • Maximum savings' },
};

// Load Razorpay SDK
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BuyPass() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const defaultType = params.get('type') || 'monthly';
  const [selected, setSelected] = useState(defaultType);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passResult, setPassResult] = useState(null);

  const plan = PLANS[selected];
  const auth = getAuth();

  // Preload Razorpay SDK
  useEffect(() => { loadRazorpay(); }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    try {
      // 1) Load Razorpay SDK
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) throw new Error('Failed to load Razorpay SDK. Check your internet connection.');

      // 2) Create order on backend
      const order = await payments.createOrder(selected);

      // 3) Open Razorpay Checkout
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'VIT Shuttle',
        description: `${order.label} — Campus Transit Pass`,
        image: 'https://api.dicebear.com/7.x/initials/svg?seed=VIT&backgroundColor=2563eb&textColor=ffffff',
        order_id: order.orderId,
        prefill: {
          name: auth?.name || '',
          email: auth?.email || '',
          contact: auth?.phone || '',
        },
        notes: {
          passType: selected,
          userId: auth?.userId || '',
        },
        theme: {
          color: '#0d9488',
          backdrop_color: 'rgba(0,0,0,0.6)',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment cancelled. You can try again.');
          },
        },
        handler: async function (response) {
          // 4) Verify payment on backend
          try {
            const verifyRes = await payments.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentDbId: order.paymentDbId,
            });
            setPassResult(verifyRes);
            setStep(3);
          } catch (verifyErr) {
            setError(`Payment received but verification failed: ${verifyErr.message}. Contact support.`);
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setLoading(false);
        setError(`Payment failed: ${response.error.description || 'Unknown error'}. Please try again.`);
      });
      rzp.open();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <div className="page-tag"><span className="material-symbols-outlined">shopping_cart</span> Purchase</div>
        <h1>Buy Shuttle Pass</h1>
        <p>Select a plan and pay securely with Razorpay</p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.5rem' }}>
        {['Select Plan', 'Review & Pay', 'Confirmation'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '.74rem', fontWeight: 800,
              background: step > i + 1 ? 'var(--green)' : step === i + 1 ? 'var(--primary)' : 'var(--surface-3)',
              color: step >= i + 1 ? '#fff' : 'var(--text-4)',
              transition: 'all .3s',
            }}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '.8rem', fontWeight: 600, color: step === i + 1 ? 'var(--text)' : 'var(--text-4)' }}>{s}</span>
            {i < 2 && <div style={{ width: 40, height: 2, background: step > i + 1 ? 'var(--green)' : 'var(--border)', borderRadius: 1 }} />}
          </div>
        ))}
      </div>

      {/* ━━━ STEP 1: Select Plan ━━━ */}
      {step === 1 && (
        <>
          <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
            {Object.entries(PLANS).map(([key, p]) => (
              <div
                key={key}
                className="card"
                onClick={() => setSelected(key)}
                style={{
                  cursor: 'pointer', textAlign: 'center', padding: '1.75rem 1.25rem',
                  border: selected === key ? '2px solid var(--primary)' : '1px solid var(--border)',
                  boxShadow: selected === key ? '0 0 0 3px var(--primary-muted)' : undefined,
                  position: 'relative', transition: 'all .2s',
                }}
              >
                {key === 'monthly' && (
                  <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--grad-primary)', color: '#fff', fontSize: '.6rem', fontWeight: 800, padding: '.2rem .65rem', borderRadius: 'var(--radius-full)', letterSpacing: '.04em' }}>
                    BEST VALUE
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', marginBottom: '.65rem' }}>
                  <div className={`stat-icon ${p.color}`}><span className="material-symbols-outlined">{p.icon}</span></div>
                  {selected === key && <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.1rem', position: 'absolute', top: 12, right: 12 }}>check_circle</span>}
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{p.label}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', margin: '.35rem 0' }}>{p.priceDisplay}</div>
                <div style={{ fontSize: '.76rem', color: 'var(--text-3)', lineHeight: 1.5 }}>{p.desc}</div>
                <div style={{ marginTop: '.75rem', display: 'flex', flexDirection: 'column', gap: '.25rem', fontSize: '.72rem', color: 'var(--text-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '.75rem', color: 'var(--green)' }}>check</span> Unlimited rides
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '.75rem', color: 'var(--green)' }}>check</span> Digital QR pass
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '.75rem', color: 'var(--green)' }}>check</span> All routes access
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary" style={{ fontSize: '.9rem', padding: '.65rem 1.5rem' }} onClick={() => setStep(2)}>
            Continue to Payment <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span>
          </button>
        </>
      )}

      {/* ━━━ STEP 2: Review & Pay ━━━ */}
      {step === 2 && (
        <div className="grid-main-side">
          <div className="card">
            <div className="card-title"><span className="material-symbols-outlined">receipt</span>Order Summary</div>

            <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <div className={`stat-icon ${plan.color}`} style={{ width: 48, height: 48 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.3rem' }}>{plan.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{plan.label}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>{plan.days} day{plan.days > 1 ? 's' : ''} unlimited campus shuttle access</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--primary)' }}>{plan.priceDisplay}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '.55rem', marginBottom: '1.25rem' }}>
              {[
                { l: 'Subtotal', v: plan.priceDisplay },
                { l: 'GST (18%)', v: 'Included' },
                { l: 'Platform Fee', v: '₹0' },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.84rem' }}>
                  <span style={{ color: 'var(--text-3)' }}>{r.l}</span>
                  <span style={{ fontWeight: 600 }}>{r.v}</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--border)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                <span style={{ fontWeight: 800 }}>Total</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{plan.priceDisplay}</span>
              </div>
            </div>

            {/* Payment method info */}
            <div style={{ padding: '1rem', background: 'var(--primary-bg)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.3rem', color: 'var(--primary)' }}>account_balance</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--primary)' }}>Razorpay Secure Checkout</div>
                <div style={{ fontSize: '.74rem', color: 'var(--text-3)' }}>UPI • Credit/Debit Card • Net Banking • Wallets</div>
              </div>
            </div>

            {error && (
              <div style={{ marginBottom: '.75rem', padding: '.65rem', borderRadius: 'var(--radius-sm)', background: 'var(--red-bg)', color: 'var(--red)', fontSize: '.82rem', display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '.95rem' }}>error</span>{error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '.5rem' }}>
              <button className="btn btn-secondary" onClick={() => { setStep(1); setError(''); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_back</span> Back
              </button>
              <button className="btn btn-primary" onClick={handlePayment} disabled={loading} style={{ flex: 1, justifyContent: 'center', fontSize: '.92rem', padding: '.7rem' }}>
                {loading ? (
                  <><span className="material-symbols-outlined" style={{ fontSize: '1rem', animation: 'spin 1s linear infinite' }}>progress_activity</span> Processing…</>
                ) : (
                  <>Pay {plan.priceDisplay} <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>lock</span></>
                )}
              </button>
            </div>
          </div>

          {/* Side info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card">
              <div className="card-title"><span className="material-symbols-outlined">shield</span>Secure Payment</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
                {[
                  { icon: 'lock', text: '256-bit SSL encrypted payment' },
                  { icon: 'verified', text: 'RBI compliant payment gateway' },
                  { icon: 'replay', text: 'Instant refund on failed payments' },
                  { icon: 'support_agent', text: '24/7 payment support' },
                ].map(i => (
                  <div key={i.text} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.8rem', color: 'var(--text-3)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '.95rem', color: 'var(--green)' }}>{i.icon}</span>
                    {i.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--primary)' }}>qr_code_2</span>
              <div style={{ fontWeight: 700, fontSize: '.88rem', marginTop: '.35rem' }}>What you'll get</div>
              <div style={{ fontSize: '.76rem', color: 'var(--text-3)', marginTop: '.2rem', lineHeight: 1.5 }}>
                A digital shuttle pass with QR code. Show it to the driver when boarding any campus shuttle.
              </div>
            </div>

            <div className="card" style={{ background: 'var(--surface-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.76rem', color: 'var(--text-3)' }}>
                <img src="https://razorpay.com/favicon.png" alt="Razorpay" style={{ width: 16, height: 16 }} onError={e => e.target.style.display = 'none'} />
                Powered by <strong style={{ color: 'var(--primary)' }}>Razorpay</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ━━━ STEP 3: Success ━━━ */}
      {step === 3 && passResult && (
        <div className="card" style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto', padding: '2rem' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--green)' }}>check_circle</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '.4rem' }}>Payment Successful! 🎉</div>
          <div style={{ fontSize: '.92rem', color: 'var(--text-3)', marginBottom: '1.5rem' }}>
            Your {plan.label} is now active. Show the QR code when boarding.
          </div>

          {passResult.pass?.qrCode && (
            <div style={{ width: 200, height: 200, margin: '0 auto 1.25rem', background: '#fff', borderRadius: 'var(--radius-lg)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(passResult.pass.qrCode)}`}
                alt="Pass QR Code"
                style={{ width: 180, height: 180 }}
              />
            </div>
          )}

          <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', padding: '1.15rem', marginBottom: '1.25rem', textAlign: 'left' }}>
            <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.65rem' }}>Transaction Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', fontSize: '.84rem' }}>
              {[
                { l: 'Pass Type', v: passResult.pass?.type?.toUpperCase() },
                { l: 'Amount Paid', v: `₹${passResult.payment?.amount}` },
                { l: 'Valid From', v: new Date(passResult.pass?.startDate).toLocaleDateString('en-IN') },
                { l: 'Valid Until', v: new Date(passResult.pass?.endDate).toLocaleDateString('en-IN') },
                { l: 'Receipt No.', v: passResult.payment?.receiptNumber },
                { l: 'Payment ID', v: passResult.payment?.id?.slice(-8).toUpperCase() },
              ].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-3)' }}>{r.l}</span>
                  <span style={{ fontWeight: 700 }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/portal/settings')}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>qr_code_2</span> View My Pass
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/portal')}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>home</span> Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
