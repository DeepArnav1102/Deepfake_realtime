import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { gsap } from 'gsap';
import { Shield, ArrowRight, Sparkles, Eye, Zap } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-animate',
        { opacity: 0, y: 40, filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.1,
          stagger: 0.12,
          ease: 'power4.out',
          delay: 0.2,
        }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      className="relative min-h-screen w-full bg-[#080808] text-white overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        /* Grain noise overlay */
        .grain::before {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 200px;
          opacity: 0.35;
        }

        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 999px;
          border: 1px solid rgba(52, 211, 153, 0.2);
          background: rgba(52, 211, 153, 0.06);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #34d399;
          font-family: 'DM Sans', sans-serif;
        }

        .hero-heading {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          line-height: 1.0;
          letter-spacing: -0.04em;
        }

        .gradient-text {
          background: linear-gradient(135deg, #34d399 0%, #22d3ee 50%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 14px;
          background: #fff;
          color: #080808;
          font-weight: 600;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(255,255,255,0.15);
        }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 14px;
          background: transparent;
          color: #a1a1aa;
          font-weight: 500;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }
        .btn-ghost:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.04);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
        }
        .stat-label {
          font-size: 12px;
          color: #52525b;
          font-weight: 400;
          letter-spacing: 0.02em;
        }

        .feature-card {
          padding: 28px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.026);
          backdrop-filter: blur(10px);
          transition: border-color 0.3s ease, background 0.3s ease, transform 0.3s ease;
        }
        .feature-card:hover {
          border-color: rgba(52, 211, 153, 0.15);
          background: rgba(52, 211, 153, 0.03);
          transform: translateY(-4px);
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
        }

        .nav-link {
          font-size: 13px;
          color: #71717a;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
          background: none;
          border: none;
          padding: 0;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-link:hover { color: #fff; }

        /* Subtle horizontal divider */
        .divider {
          width: 1px;
          height: 20px;
          background: rgba(255,255,255,0.08);
        }

        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.97); }
        }
        .drift { animation: drift 18s ease-in-out infinite; }
        .drift-slow { animation: drift 28s ease-in-out infinite reverse; }
      `}</style>

      {/* ── GRAIN OVERLAY ── */}
      <div className="grain" />

      {/* ── AMBIENT GLOWS ── */}
      <div
        className="glow-orb drift"
        style={{
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
      <div
        className="glow-orb drift-slow"
        style={{
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)',
          bottom: '10%',
          right: '10%',
        }}
      />

      {/* ── NAVBAR ── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: '18px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(8,8,8,0.7)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #34d399, #22d3ee)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={14} color="#080808" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: 14,
              color: '#fff',
              letterSpacing: '-0.01em',
            }}
          >
            DeepSheild<span style={{ color: '#34d399' }}>.ai</span>
          </span>
        </div>

        {/* Nav actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {isSignedIn ? (
            <button className="nav-link" onClick={() => navigate('/dashboard')}>Dashboard</button>
          ) : (
            <button className="nav-link" onClick={() => navigate('/sign-in')}>Sign in</button>
          )}
          <div className="divider" />
          <button
            className="btn-primary"
            style={{ padding: '9px 20px', borderRadius: 10, fontSize: 13 }}
            onClick={() => navigate(isSignedIn ? '/detector' : '/sign-up')}
          >
            Try for free <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <main
        ref={heroRef}
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 860,
          margin: '0 auto',
          padding: '0 24px',
          paddingTop: 160,
          paddingBottom: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Badge */}
        <div className="badge-pill hero-animate" style={{ marginBottom: 28 }}>
          <Sparkles size={10} />
          Next-Gen Media Forensics · Real-Time AI
        </div>

        {/* Headline */}
        <h1
          className="hero-heading hero-animate"
          style={{ fontSize: 'clamp(44px, 9vw, 88px)', color: '#fff', marginBottom: 28 }}
        >
          The truth is&nbsp;
          <span className="gradient-text">worth</span>
          <br />
          protecting.
        </h1>

        {/* Subheadline */}
        <p
          className="hero-animate"
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 17,
            color: '#71717a',
            lineHeight: 1.7,
            maxWidth: 520,
            marginBottom: 44,
            fontWeight: 300,
          }}
        >
          "Seeing is no longer believing." — DeepSheild.ai uses ResNet-powered AI to instantly
          detect manipulated faces across live streams, videos, and images.{' '}
          <em style={{ color: '#a1a1aa', fontStyle: 'normal' }}>No guesswork. Just facts.</em>
        </p>

        {/* CTA row */}
        <div
          className="hero-animate"
          style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 64 }}
        >
          <button
            className="btn-primary"
            onClick={() => navigate(isSignedIn ? '/dashboard' : '/sign-up')}
          >
            Start detecting free <ArrowRight size={16} />
          </button>
          <button
            className="btn-ghost"
            onClick={() => navigate('/sign-in')}
          >
            Sign in
          </button>
        </div>

        {/* Stats strip */}
        <div
          className="hero-animate"
          style={{
            display: 'flex',
            gap: 48,
            padding: '24px 40px',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(12px)',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <div className="stat-item">
            <span className="stat-num">96.64%</span>
            <span className="stat-label">Detection accuracy</span>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.06)', alignSelf: 'stretch' }} />
          <div className="stat-item">
            <span className="stat-num">&lt;2s</span>
            <span className="stat-label">Analysis per frame</span>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.06)', alignSelf: 'stretch' }} />
          <div className="stat-item">
            <span className="stat-num">3</span>
            <span className="stat-label">Input formats</span>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.06)', alignSelf: 'stretch' }} />
          <div className="stat-item">
            <span className="stat-num">Live</span>
            <span className="stat-label">Webcam support</span>
          </div>
        </div>
      </main>

      {/* ── FEATURES ── */}
      <section
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 1000,
          margin: '0 auto',
          padding: '0 24px 120px',
        }}
      >
        {/* Section label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 48,
          }}
        >
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          <span
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 11,
              color: '#52525b',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            What it does
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Feature cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {[
            {
              icon: <Zap size={18} color="#34d399" />,
              iconBg: 'rgba(52,211,153,0.1)',
              title: 'Real-Time Inference',
              desc: 'Continuous deepfake scanning every 2 seconds directly on live webcam streams — no uploads needed.',
            },
            {
              icon: <Eye size={18} color="#818cf8" />,
              iconBg: 'rgba(129,140,248,0.1)',
              title: 'Multi-Format Verification',
              desc: 'Supports JPG, PNG image files, MP4/WebM video uploads, and live RTMP/webcam sources out of the box.',
            },
            {
              icon: <Shield size={18} color="#22d3ee" />,
              iconBg: 'rgba(34,211,238,0.1)',
              title: 'ResNet AI at the Core',
              desc: 'Custom-trained ResNet models with facial extraction pre-processing deliver precision you can rely on.',
            },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon" style={{ background: f.iconBg }}>
                {f.icon}
              </div>
              <h3
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: 16,
                  color: '#fff',
                  marginBottom: 10,
                  letterSpacing: '-0.02em',
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 13.5,
                  color: '#71717a',
                  lineHeight: 1.65,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 600,
          margin: '0 auto',
          padding: '0 24px 100px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            padding: '60px 40px',
            borderRadius: 28,
            border: '1px solid rgba(52,211,153,0.12)',
            background: 'rgba(52,211,153,0.03)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 12,
              color: '#34d399',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            Free to start
          </p>
          <h2
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(28px, 5vw, 42px)',
              color: '#fff',
              letterSpacing: '-0.03em',
              marginBottom: 12,
              lineHeight: 1.1,
            }}
          >
            Don't trust what you see.
          </h2>
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              color: '#71717a',
              fontSize: 15,
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Join and start verifying media in under 60 seconds.
          </p>
          <button
            className="btn-primary"
            onClick={() => navigate(isSignedIn ? '/detector' : '/sign-up')}
          >
            Get started free <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}
