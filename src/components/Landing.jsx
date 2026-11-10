import React from "react";
import { 
  ArrowRight, ShieldCheck, Zap, Layout, Lock, CheckCircle2, 
  Globe, Users, Sparkles, FileText, Upload, Download, Play, Clock, Layers, Eye, Database
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { translations } from "../i18n";
import "../doctrans.css";

export default function Landing({ goApp, goPricingCheckout, goLogin, goSignup, locale, setLocale }) {
  // Load translations
  const t = translations[locale] || translations["en"];

  return (
    <div className="landing-page">
      
      {/* NAVBAR */}
      <nav className="landing-navbar">
        <div className="brand-logo" onClick={goApp} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">D</div>
          <span className="brand-name">DocTrans</span>
        </div>
        
        <div className="landing-nav-links">
          <a href="#features">{t.landing.navFeatures}</a>
          <a href="#how-it-works">{t.landing.navHowItWorks}</a>
          <a href="#pricing">{t.landing.navPricing}</a>
          <a href="#faq">{t.landing.navFaq}</a>
        </div>
        
        <div className="landing-auth-buttons">
          <LanguageSwitcher locale={locale} setLocale={setLocale} />
          <button onClick={goLogin} className="btn-outline" style={{ marginLeft: '1rem' }}>{t.landing.login}</button>
          <button onClick={goSignup} className="btn-primary">{t.landing.signup}</button>
        </div>
      </nav>

      {/* HERO */}
      <header className="landing-hero">
        <div className="hero-text">
          <div className="hero-badge">
            <Sparkles size={14} /> {t.landing.earlyAccess}
          </div>
          <h1>{t.landing.heroTitle}</h1>
          <p>{t.landing.heroSubtitle}</p>
          <div className="hero-actions">
            <button onClick={goSignup} className="btn-primary btn-large">
              {t.landing.getStartedFree} <ArrowRight size={18} />
            </button>
            <button onClick={goApp} className="btn-outline btn-large">
              <Play size={18} /> {t.landing.tryApp}
            </button>
          </div>
          <p className="hero-subtext">{t.landing.noCard}</p>
        </div>
        
        <div className="hero-visual">
          <div className="visual-card">
            <div className="visual-header">
              <span className="dot red"></span><span className="dot yellow"></span><span className="dot green"></span>
            </div>
            <div className="visual-body">
              <div className="visual-line long"></div>
              <div className="visual-line short"></div>
              <div className="visual-line medium"></div>
              <div className="visual-stat">
                <span>{locale === 'fr' ? 'Mise en page' : 'Layout'}</span> {locale === 'fr' ? 'Préservée' : 'Preserved'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SOCIAL PROOF */}
      <section className="landing-proof">
        <p className="proof-title">{t.landing.socialProofTitle}</p>
        <div className="proof-logos">
          <span>Google Drive</span><span>Dropbox</span><span>OneDrive</span><span>Notion</span><span>Slack</span>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="landing-problem">
        <div className="problem-grid">
          <div className="problem-card problem">
            <h3>{t.landing.problemTitle}</h3>
            <p>{t.landing.problemDesc}</p>
          </div>
          <div className="problem-card solution">
            <h3>{t.landing.solutionTitle}</h3>
            <p>{t.landing.solutionDesc}</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="landing-features">
        <div className="section-header">
          <h2>{t.landing.featuresTitle}</h2>
          <p>{t.landing.featuresSub}</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card"><Layout className="feature-icon" /><h3>{t.landing.featFormatTitle}</h3><p>{t.landing.featFormatDesc}</p></div>
          <div className="feature-card"><ShieldCheck className="feature-icon" /><h3>{t.landing.featPrivacyTitle}</h3><p>{t.landing.featPrivacyDesc}</p></div>
          <div className="feature-card"><Zap className="feature-icon" /><h3>{t.landing.featSpeedTitle}</h3><p>{t.landing.featSpeedDesc}</p></div>
          <div className="feature-card"><Globe className="feature-icon" /><h3>{t.landing.featLangTitle}</h3><p>{t.landing.featLangDesc}</p></div>
          <div className="feature-card"><FileText className="feature-icon" /><h3>{t.landing.featFormatTypeTitle}</h3><p>{t.landing.featFormatTypeDesc}</p></div>
          <div className="feature-card"><Users className="feature-icon" /><h3>{t.landing.featTeamTitle}</h3><p>{t.landing.featTeamDesc}</p></div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="landing-steps">
        <div className="section-header">
          <h2>{t.landing.howTitle}</h2>
          <p>{t.landing.howSub}</p>
        </div>
        <div className="steps-container">
          <div className="step"><div className="step-icon-wrapper"><Upload className="step-icon" /></div><h4>{t.landing.step1Title}</h4><p>{t.landing.step1Desc}</p></div>
          <div className="step-connector"></div>
          <div className="step"><div className="step-icon-wrapper"><Layers className="step-icon" /></div><h4>{t.landing.step2Title}</h4><p>{t.landing.step2Desc}</p></div>
          <div className="step-connector"></div>
          <div className="step"><div className="step-icon-wrapper"><Download className="step-icon" /></div><h4>{t.landing.step3Title}</h4><p>{t.landing.step3Desc}</p></div>
        </div>
      </section>

      {/* TRUST */}
      <section className="landing-trust">
        <div className="trust-content">
          <h2>{t.landing.trustTitle}</h2>
          <p>{t.landing.trustSub}</p>
          <div className="trust-badges">
            <div className="badge"><Lock className="badge-icon" /><span>{t.landing.trustBadge1}</span></div>
            <div className="badge"><Eye className="badge-icon" /><span>{t.landing.trustBadge2}</span></div>
            <div className="badge"><Database className="badge-icon" /><span>{t.landing.trustBadge3}</span></div>
            <div className="badge"><Clock className="badge-icon" /><span>{t.landing.trustBadge4}</span></div>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="landing-comparison">
        <div className="section-header">
          <h2>{t.landing.compTitle}</h2>
          <p>{t.landing.compSub}</p>
        </div>
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr><th>{t.landing.compFeature}</th><th>{t.landing.compDocTrans}</th><th>{t.landing.compTraditional}</th></tr>
            </thead>
            <tbody>
              <tr><td>{t.landing.compRow1}</td><td><CheckCircle2 className="text-green" size={20} /></td><td><span className="text-red">✕</span></td></tr>
              <tr><td>{t.landing.compRow2}</td><td><CheckCircle2 className="text-green" size={20} /></td><td><span className="text-red">✕</span></td></tr>
              <tr><td>{t.landing.compRow3}</td><td><CheckCircle2 className="text-green" size={20} /></td><td><span className="text-red">✕</span></td></tr>
              <tr><td>{t.landing.compRow4}</td><td><CheckCircle2 className="text-green" size={20} /></td><td><span className="text-red">✕</span></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="landing-pricing">
        <div className="section-header">
          <h2>{t.landing.priceTitle}</h2>
          <p>{t.landing.priceSub}</p>
        </div>
        <div className="pricing-cards">
          <div className="pricing-card">
            <h3>{t.landing.pricePlan1}</h3>
            <div className="price">0€<span>/{locale === 'fr' ? 'mois' : 'mo'}</span></div>
            <p className="pricing-desc">{t.landing.pricePlan1Desc}</p>
            <ul>
              <li><CheckCircle2 size={16} /> {t.landing.pricePlan1Feat1}</li>
              <li><CheckCircle2 size={16} /> {t.landing.pricePlan1Feat2}</li>
            </ul>
            <button onClick={goApp} className="btn-outline w-full">{t.landing.priceGetStarted}</button>
          </div>
          <div className="pricing-card popular">
            <div className="popular-badge">{t.landing.popular}</div>
            <h3>{t.landing.pricePlan2}</h3>
            <div className="price">29€<span>/{locale === 'fr' ? 'mois' : 'mo'}</span></div>
            <p className="pricing-desc">{t.landing.pricePlan2Desc}</p>
            <ul>
              <li><CheckCircle2 size={16} /> {t.landing.pricePlan2Feat1}</li>
              <li><CheckCircle2 size={16} /> {t.landing.pricePlan2Feat2}</li>
              <li><CheckCircle2 size={16} /> {t.landing.pricePlan2Feat3}</li>
            </ul>
            <button onClick={() => goPricingCheckout("Pro", 29)} className="btn-primary w-full">
              {t.landing.priceUpgradeTo} {t.landing.pricePlan2}
            </button>
          </div>
          <div className="pricing-card">
            <h3>{t.landing.pricePlan3}</h3>
            <div className="price">79€<span>/{locale === 'fr' ? 'mois' : 'mo'}</span></div>
            <p className="pricing-desc">{t.landing.pricePlan3Desc}</p>
            <ul>
              <li><CheckCircle2 size={16} /> {t.landing.pricePlan3Feat1}</li>
              <li><CheckCircle2 size={16} /> {t.landing.pricePlan3Feat2}</li>
              <li><CheckCircle2 size={16} /> {t.landing.pricePlan3Feat3}</li>
            </ul>
            <button onClick={() => goPricingCheckout("Équipe", 79)} className="btn-outline w-full">
              {t.landing.priceUpgradeTo} {t.landing.pricePlan3}
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="landing-faq">
        <div className="section-header">
          <h2>{t.landing.faqTitle}</h2>
          <p>{t.landing.faqSub}</p>
        </div>
        <div className="faq-list">
          <details className="faq-item"><summary>{t.landing.faqQ1}</summary><p>{t.landing.faqA1}</p></details>
          <details className="faq-item"><summary>{t.landing.faqQ2}</summary><p>{t.landing.faqA2}</p></details>
          <details className="faq-item"><summary>{t.landing.faqQ3}</summary><p>{t.landing.faqA3}</p></details>
          <details className="faq-item"><summary>{t.landing.faqQ4}</summary><p>{t.landing.faqA4}</p></details>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="landing-final-cta-wrapper">
        <div className="landing-final-cta">
          <div className="cta-glow cta-glow-1"></div>
          <div className="cta-glow cta-glow-2"></div>
          <div className="cta-content">
            <h2>{t.landing.ctaTitle}</h2>
            <p>{t.landing.ctaSub}</p>
            <div className="cta-actions">
              <button onClick={goSignup} className="btn-cta">
                {t.landing.ctaBtn} <ArrowRight size={18} />
              </button>
            </div>
            <span className="cta-subtext">{t.landing.noCard}</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="landing-logo"><span className="logo-dot">●</span> DocTrans</div>
            <p>{t.landing.footerDesc}</p>
          </div>
          <div className="footer-links-col">
            <h4>{t.landing.footerProduct}</h4>
            <a href="#features">{t.landing.navFeatures}</a>
            <a href="#pricing">{t.landing.navPricing}</a>
            <a href="#how-it-works">{t.landing.navHowItWorks}</a>
          </div>
          <div className="footer-links-col">
            <h4>{t.landing.footerCompany}</h4>
            <a href="#faq">{t.landing.navFaq}</a>
            <span onClick={goLogin} style={{ cursor: 'pointer' }}>{t.landing.login}</span>
            <span onClick={goSignup} style={{ cursor: 'pointer' }}>{t.landing.signup}</span>
          </div>
          <div className="footer-links-col">
            <h4>{t.landing.footerLegal}</h4>
            <a href="#">{t.landing.footerPrivacy}</a>
            <a href="#">{t.landing.footerTerms}</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} DocTrans. {t.landing.rights}</p>
        </div>
      </footer>

    </div>
  );
}