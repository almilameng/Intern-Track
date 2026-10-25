import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CalendarDays,
  LayoutDashboard,
  Sparkles,
  MoveUpRight,
} from "lucide-react";
import Brand from "@/components/brand";
export default function Home() {
  return (
    <div className="landing">
      <header className="site-header">
        <Brand />
        <nav aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <Link href="/dashboard" className="button small">
            Get started <ArrowRight size={16} />
          </Link>
        </nav>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="live-dot" /> BIG DREAMS. SMALL NEXT STEPS.
            </span>
            <h1>
              Your next chapter.
              <br />
              <span>All in one place.</span>
            </h1>
            <p>
              From your first application to your first offer. Organize your
              internship search, stay ahead of deadlines, and make your next
              move with confidence.
            </p>
            <Link href="/dashboard" className="button">
              Start tracking for free <ArrowRight size={18} />
            </Link>
            <div className="hero-note">
              <CheckCircle2 size={16} /> No account needed. Just a little
              ambition.
            </div>
          </div>
          <div className="hero-visual">
            <div className="preview-top">
              <span className="preview-dots">● ● ●</span>
              <span>your next opportunity, organized</span>
            </div>
            <div className="preview-content">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-500">
                  MY WORKSPACE
                </span>
                <Sparkles size={19} className="text-blue-600" />
              </div>
              <h2>You’re making moves.</h2>
              <p className="text-sm text-slate-500">
                Every application is a step forward.
              </p>
              <div className="preview-stats">
                <div>
                  <span>Applications</span>
                  <strong>
                    12 <small>↗ 4 this week</small>
                  </strong>
                </div>
                <div>
                  <span>Interviews</span>
                  <strong>
                    3 <small>Looking good!</small>
                  </strong>
                </div>
              </div>
              <div className="preview-row">
                <span className="company-logo purple">L</span>
                <div>
                  <strong>Product Design Intern</strong>
                  <span>Linear · San Francisco</span>
                </div>
                <span className="badge interview">Interview</span>
              </div>
              <div className="preview-row">
                <span className="company-logo green">S</span>
                <div>
                  <strong>Engineering Intern</strong>
                  <span>Spotify · New York</span>
                </div>
                <span className="badge applied">Applied</span>
              </div>
              <div className="preview-row">
                <span className="company-logo dark">N</span>
                <div>
                  <strong>Marketing Intern</strong>
                  <span>Notion · Remote</span>
                </div>
                <span className="badge wishlist">Wishlist</span>
              </div>
              <div className="offer-note">
                <span>🎉</span>
                <div>
                  <strong>A little structure. A lot of possibility.</strong>
                  <p>Your future self will thank you.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="landing-caption">
          LESS SPREADSHEET CHAOS. MORE MAIN-CHARACTER ENERGY.
        </div>
        <section id="features" className="landing-section">
          <span className="section-kicker">BUILT FOR YOUR NEXT STEP</span>
          <h2>A clearer path to “you’re hired.”</h2>
          <p className="section-description">
            Your job search has enough moving parts. Keeping track shouldn’t be
            one of them.
          </p>
          <div className="feature-grid">
            {[
              {
                icon: LayoutDashboard,
                title: "One home for every opportunity",
                text: "Keep companies, roles, notes, and application statuses together in a workspace that makes sense.",
              },
              {
                icon: CalendarDays,
                title: "Keep deadlines in sight",
                text: "See what’s coming up, prioritize your next application, and give every opportunity your best shot.",
              },
              {
                icon: MoveUpRight,
                title: "See how far you’ve come",
                text: "From wishlist to offer, follow your progress and celebrate the small wins along the way.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title} className="feature-card">
                <span className="feature-icon">
                  <Icon size={23} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="pricing" className="pricing-section">
          <div>
            <span className="section-kicker">STUDENT-FRIENDLY. ALWAYS.</span>
            <h2>
              Big ambitions.
              <br />
              Zero cost to get started.
            </h2>
            <p>
              Start with the essentials. Build a habit that helps you take the
              next step.
            </p>
          </div>
          <div className="pricing-card">
            <div className="flex justify-between items-center">
              <h3>Starter</h3>
              <span className="badge applied">Available now</span>
            </div>
            <div className="price">
              $0 <span>/ free demo</span>
            </div>
            <p>Everything you need to get organized.</p>
            <ul>
              {[
                "Unlimited applications in this browser",
                "Search, filters, and progress overview",
                "Deadlines and personal notes",
              ].map((t) => (
                <li key={t}>
                  <Check size={17} />
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/dashboard" className="button w-full">
              Get started <ArrowRight size={17} />
            </Link>
            <small>Saved on this device. No signup or payment.</small>
          </div>
        </section>
        <section className="final-cta">
          <Sparkles size={26} />
          <h2>Your next opportunity starts with a little organization.</h2>
          <Link href="/dashboard" className="button">
            Let’s make your next move <ArrowRight size={18} />
          </Link>
        </section>
      </main>
      <footer>
        <Brand />
        <p>Made for the journey ahead.</p>
        <span>InternTrack · Local demo</span>
      </footer>
    </div>
  );
}
