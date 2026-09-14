import { useEffect, useRef } from 'react';

/* ── STATS BAR ── */
const stats = [
  { num: '4.2ms', label: 'Avg. Sync Latency' },
  { num: '99.9%', label: 'Uptime SLA' },
  { num: '12+', label: 'Language Commands' },
  { num: '∞', label: 'File Storage' },
  { num: 'US-E2', label: 'Active Region' },
];

export function StatsBar() {
  return (
    <div
      className="stats-bar"
      style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '1.5rem 2rem',
        display: 'flex',
        gap: '4rem',
        overflowX: 'auto',
        background: 'var(--bg)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -1,
          left: '10%',
          right: '10%',
          height: 1,
          background: 'var(--edge-gradient)',
          opacity: 0.3,
        }}
      />
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`stat-item reveal${i > 0 ? ` reveal-delay-${i}` : ''}`}
          style={{ flexShrink: 0 }}
        >
          <div
            className="stat-num"
            style={{
              fontSize: '2rem',
              fontWeight: 900,
              fontStyle: 'italic',
              color: 'var(--neon)',
              lineHeight: 1,
              transition: 'text-shadow 0.3s cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            {s.num}
          </div>
          <div
            style={{
              fontSize: 8,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'var(--text-muted)',
              marginTop: 4,
            }}
          >
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── CODE PREVIEW ── */
export function CodePreviewSection() {
  return (
    <div className="code-preview-section" style={{ padding: '6rem 2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <p className="section-label reveal">Vik Script in action</p>
        <h2 className="section-title reveal reveal-delay-1">
          Plain English.<br />Real results.
        </h2>
        <div
          className="reveal reveal-delay-2"
          style={{
            maxWidth: 860,
            margin: '3rem auto 0',
            border: '1px solid var(--border)',
            background: 'var(--panel)',
            position: 'relative',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4), 0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(57,255,20,0.06)',
            clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
            transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1), border-color 0.4s',
          }}
        >
          <div
            style={{
              content: "''",
              position: 'absolute',
              top: -1,
              left: 10,
              right: 10,
              height: 1,
              background: 'var(--edge-gradient)',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ width: 8, height: 8, background: '#ff5f57' }} />
            <div style={{ width: 8, height: 8, background: '#febc2e' }} />
            <div style={{ width: 8, height: 8, background: '#28c840' }} />
            <span
              style={{
                fontSize: 9,
                color: 'var(--text-muted)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginLeft: 'auto',
              }}
            >
              hello_world.vik — VIK_PRO_ENGINE
            </span>
          </div>
          <div
            style={{
              textAlign: 'left',
              padding: '1.5rem 2rem',
              fontSize: 12,
              lineHeight: 2,
              overflowX: 'auto',
            }}
          >
            <pre style={{ fontFamily: 'inherit' }}>
              <span style={{ color: 'rgba(255,255,255,0.22)' }}>
                // Ask the user for their name and age
              </span>
              {'\n'}
              <span style={{ color: '#bb9af7' }}>get</span> name{' '}
              <span style={{ color: '#9ece6a' }}>What is your name?</span>
              {'\n'}
              <span style={{ color: '#bb9af7' }}>getIn</span> age{' '}
              <span style={{ color: '#9ece6a' }}>How old are you?</span>
              {'\n\n'}
              <span style={{ color: 'rgba(255,255,255,0.22)' }}>
                // Say hello with their name
              </span>
              {'\n'}
              <span style={{ color: '#bb9af7' }}>say</span> Hello{' '}
              <span style={{ color: '#e0af68' }}>vari,name</span>!
              {'\n\n'}
              <span style={{ color: 'rgba(255,255,255,0.22)' }}>
                // Check their age
              </span>
              {'\n'}
              <span style={{ color: '#bb9af7' }}>i</span> age{' >= '}
              <span style={{ color: '#ff9e64' }}>18</span>
              {'\n  '}
              <span style={{ color: '#bb9af7' }}>say</span> You are an adult.
              Welcome!
              {'\n'}
              <span style={{ color: '#bb9af7' }}>enif</span>
              {'\n'}
              <span style={{ color: '#bb9af7' }}>i</span> age{' >= '}
              <span style={{ color: '#ff9e64' }}>13</span>
              {'\n  '}
              <span style={{ color: '#bb9af7' }}>say</span> Hey there, teenager!
              {'\n'}
              <span style={{ color: '#bb9af7' }}>enif</span>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── CTA SECTION ── */
export function CTASection() {
  return (
    <div
      className="cta-section"
      style={{
        padding: '8rem 2rem',
        textAlign: 'center',
        background:
          'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(57,255,20,0.05) 0%, transparent 70%)',
      }}
    >
      <p className="section-label reveal">Ready to code?</p>
      <h2
        className="section-title reveal reveal-delay-1"
        style={{ marginBottom: '2.5rem' }}
      >
        Start writing Vik Script<br />
        <span style={{ color: 'var(--neon)' }}>in 10 seconds.</span>
      </h2>
      <div
        className="reveal reveal-delay-2"
        style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <button className="btn-primary">Get Started Free</button>
        <button className="btn-outline">Try the Sandbox</button>
      </div>
    </div>
  );
}

/* ── LANGUAGES ── */
const languages = [
  { icon: '🐍', name: 'Python', count: '3 lessons' },
  { icon: '☕', name: 'Java', count: '1 lesson' },
  { icon: '🌐', name: 'Web', count: '4 lessons' },
  { icon: '⚡', name: 'C++', count: '1 lesson' },
  { icon: '🧠', name: 'Algorithms', count: '2 lessons' },
];

export function LanguagesSection() {
  return (
    <div
      className="languages-section"
      style={{
        padding: '6rem 2rem',
        background:
          'radial-gradient(ellipse 50% 50% at 30% 50%, rgba(57,255,20,0.03) 0%, transparent 70%)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <p className="section-label reveal">Learn & Code</p>
        <h2 className="section-title reveal reveal-delay-1">
          Supported <span style={{ color: 'var(--neon)' }}>Languages.</span>
        </h2>
        <div
          className="reveal reveal-delay-2"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '1px',
            background: 'var(--border)',
            marginTop: '3rem',
            maxWidth: 700,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {languages.map(lang => (
            <div
              key={lang.name}
              style={{
                background: 'var(--bg)',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                transition: 'background 0.3s, transform 0.3s',
              }}
            >
              <span style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block' }}>
                {lang.icon}
              </span>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#fff',
                }}
              >
                {lang.name}
              </div>
              <div
                style={{
                  fontSize: 8,
                  color: 'var(--text-muted)',
                  marginTop: 4,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}
              >
                {lang.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── TESTIMONIALS ── */
const testimonials = [
  {
    text: 'Vik Script made programming click for me. The plain English commands meant I could focus on logic, not syntax errors. Built my first real project in a weekend!',
    author: '— Alex Chen',
    role: 'First-year CS Student',
  },
  {
    text: "I've been teaching coding for 5 years. Vik Pro is the first tool I've found that truly bridges the gap between complete beginners and real programming concepts. The built-in interpreter is genius.",
    author: '— Sarah Mitchell',
    role: 'High School CS Teacher',
  },
  {
    text: "My 12-year-old went from zero to writing a calculator app with loops and functions in under an hour. Vik Script's get/say/calc pattern is incredibly intuitive for newcomers.",
    author: '— Marcus Johnson',
    role: 'Parent & Developer',
  },
];

export function TestimonialsSection() {
  return (
    <div className="testimonials-section" style={{ padding: '6rem 2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <p className="section-label reveal">From the community</p>
        <h2 className="section-title reveal reveal-delay-1">
          What learners <span style={{ color: 'var(--neon)' }}>say.</span>
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            marginTop: '3rem',
            maxWidth: 900,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {testimonials.map((t, i) => (
            <div
              key={t.author}
              className={`reveal${i > 0 ? ` reveal-delay-${i}` : ''}`}
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                padding: '1.75rem',
                position: 'relative',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4)',
                clipPath:
                  'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)',
                transition:
                  'border-color 0.3s cubic-bezier(0.22,1,0.36,1), transform 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--neon)';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow =
                  'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4), 0 12px 40px rgba(57,255,20,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4)';
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 14,
                  fontSize: '3rem',
                  color: 'var(--neon)',
                  opacity: 0.15,
                  fontWeight: 900,
                  fontStyle: 'italic',
                  lineHeight: 1,
                }}
              >
                "
              </div>
              <div
                style={{
                  fontSize: 10,
                  lineHeight: 1.8,
                  color: 'var(--text-muted)',
                  marginBottom: '1rem',
                  fontStyle: 'italic',
                  paddingTop: '0.5rem',
                }}
              >
                {t.text}
              </div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#fff',
                }}
              >
                {t.author}
              </div>
              <div
                style={{
                  fontSize: 8,
                  color: 'var(--neon)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginTop: 2,
                  opacity: 0.7,
                }}
              >
                {t.role}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── PRICING ── */
const plans = [
  {
    name: 'Sandbox',
    price: '0',
    period: 'Forever free',
    features: [
      'Full Vik Script interpreter',
      'Local file storage',
      'Syntax reference panel',
      'Anonymous sandbox access',
    ],
    featured: false,
    cta: 'Try Free',
    primary: false,
  },
  {
    name: 'Pro',
    price: '9',
    period: 'Per month',
    features: [
      'Everything in Sandbox',
      'Cloud project sync',
      'AI co-pilot (Gemini)',
      'Priority support',
      'Advanced analytics',
    ],
    featured: true,
    cta: 'Get Pro',
    primary: true,
  },
  {
    name: 'Team',
    price: '29',
    period: 'Per month',
    features: [
      'Everything in Pro',
      'Team workspaces',
      'Teacher dashboard',
      'Custom lesson creation',
      'Student progress tracking',
    ],
    featured: false,
    cta: 'Contact Sales',
    primary: false,
  },
];

export function PricingSection() {
  return (
    <div className="pricing-section" style={{ padding: '6rem 2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <p className="section-label reveal">Plans & Pricing</p>
        <h2 className="section-title reveal reveal-delay-1">
          Start free.<br />
          <span style={{ color: 'var(--neon)' }}>Scale when ready.</span>
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
            marginTop: '3rem',
            maxWidth: 900,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {plans.map((p, i) => (
            <div
              key={p.name}
              className={`reveal${i > 0 ? ` reveal-delay-${i}` : ''}`}
              style={{
                background: p.featured ? '#0A1310' : 'var(--panel)',
                border: `1px solid ${p.featured ? 'var(--neon-mid)' : 'var(--border)'}`,
                padding: '2.5rem 2rem',
                textAlign: 'center',
                position: 'relative',
                boxShadow: p.featured
                  ? 'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4), 0 0 40px rgba(57,255,20,0.06)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4)',
                clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
                transform: p.featured ? 'scale(1.03)' : 'none',
                transition:
                  'border-color 0.3s cubic-bezier(0.22,1,0.36,1), transform 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--neon)';
                e.currentTarget.style.boxShadow =
                  'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4), 0 12px 40px rgba(57,255,20,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = p.featured
                  ? 'var(--neon-mid)'
                  : 'var(--border)';
                e.currentTarget.style.boxShadow = p.featured
                  ? 'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4), 0 0 40px rgba(57,255,20,0.06)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4)';
              }}
            >
              {p.featured && (
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    fontSize: 7,
                    fontWeight: 900,
                    letterSpacing: '0.2em',
                    color: '#000',
                    background: 'var(--neon)',
                    padding: '2px 8px',
                    clipPath: 'polygon(2px 0%, 100% 0%, calc(100% - 2px) 100%, 0% 100%)',
                  }}
                >
                  POPULAR
                </div>
              )}
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: '#fff',
                  marginBottom: '0.75rem',
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  fontStyle: 'italic',
                  color: 'var(--neon)',
                  lineHeight: 1,
                  marginBottom: '0.25rem',
                }}
              >
                <span style={{ fontSize: '1rem', verticalAlign: 'super' }}>$</span>
                {p.price}
              </div>
              <div
                style={{
                  fontSize: 8,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  marginBottom: '1.5rem',
                }}
              >
                {p.period}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem' }}>
                {p.features.map(f => (
                  <li
                    key={f}
                    style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      padding: '5px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <span style={{ color: 'var(--neon)', opacity: 0.5 }}>✦ </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={p.primary ? 'btn-primary' : 'btn-outline'}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── COMMUNITY STATS ── */
const communityStats = [
  { id: 'stat-users', target: 12450, label: 'Active Coders' },
  { id: 'stat-projects', target: 8920, label: 'Projects Created' },
  { id: 'stat-lessons', target: 15630, label: 'Lessons Completed' },
  { id: 'stat-xp', target: 284500, label: 'Total XP Earned' },
];

export function CommunityStats() {
  return (
    <div
      className="stats-community"
      style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '3rem 2rem',
        background: 'var(--bg)',
        display: 'flex',
        justifyContent: 'center',
        gap: '4rem',
        flexWrap: 'wrap',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -1,
          left: '10%',
          right: '10%',
          height: 1,
          background: 'var(--edge-gradient)',
          opacity: 0.2,
        }}
      />
      {communityStats.map((s, i) => (
        <Counter
          key={s.id}
          target={s.target}
          label={s.label}
          delay={i}
        />
      ))}
    </div>
  );
}

function Counter({ target, label, delay }: { target: number; label: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            let current = 0;
            const step = Math.max(1, Math.floor(target / 60));
            const interval = setInterval(() => {
              current += step;
              if (displayRef.current) {
                displayRef.current.textContent = current >= target
                  ? target.toLocaleString()
                  : current.toLocaleString();
              }
              if (current >= target) {
                clearInterval(interval);
              }
            }, 20);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    obs.observe(el);

    return () => obs.disconnect();
  }, [target]);

  return (
    <div
      ref={ref}
      className={`reveal${delay > 0 ? ` reveal-delay-${delay}` : ''}`}
      style={{ textAlign: 'center' }}
    >
      <div
        ref={displayRef}
        style={{
          fontSize: '2.5rem',
          fontWeight: 900,
          fontStyle: 'italic',
          color: 'var(--neon)',
          lineHeight: 1,
          transition: 'text-shadow 0.3s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        0
      </div>
      <div
        style={{
          fontSize: 8,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: 'var(--text-muted)',
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
}
