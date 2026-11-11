import React from "react";
import { 
  ArrowRight, ShieldCheck, Zap, Layout, Lock, CheckCircle2, 
  Globe, Users, Sparkles, FileText, Upload, Download, Play, Clock, Layers, Eye, Database
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { translations } from "../i18n";
import "../doctrans.css";

export default function Landing({ goApp, goPricingCheckout, goLogin, goSignup, locale, setLocale }) {
  const t = translations[locale] || translations["en"];

  return (
    <div className="landing-page">
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

      {/* HERO, FEATURES, ETC... (Keep your existing code for these sections) */}

      {/* PRICING SECTION ONLY */}
      <section id="pricing" className="landing-pricing">
        <div className="section-header">
          <h2>{t.landing.priceTitle}</h2>
          <p>{t.landing.priceSub}</p>
        </div>
        <div className="pricing-cards">
          
          {/* Free Plan */}
          <div className="pricing-card">
            <h3>{t.landing.pricePlan1}</h3>
            <div className="price">0 XOF<span>/{locale === 'fr' ? 'mois' : 'mo'}</span></div>
            <p className="pricing-desc">{t.landing.pricePlan1Desc}</p>
            <ul>
              <li><CheckCircle2 size={16} /> {t.landing.pricePlan1Feat1}</li>
              <li><CheckCircle2 size={16} /> {t.landing.pricePlan1Feat2}</li>
              <li><CheckCircle2 size={16} /> {t.landing.pricePlan1Feat3}</li>
            </ul>
            <button onClick={goApp} className="btn-outline w-full">{t.landing.priceGetStarted}</button>
          </div>

          {/* Pro Plan */}
          <div className="pricing-card popular">
            <div className="popular-badge">{t.landing.popular}</div>
            <h3>{t.landing.pricePlan2}</h3>
            <div className="price">3 000 XOF<span>/{locale === 'fr' ? 'mois' : 'mo'}</span></div>
            <p className="pricing-desc">{t.landing.pricePlan2Desc}</p>
            <ul>
              <li><CheckCircle2 size={16} /> {t.landing.pricePlan2Feat1}</li>
              <li><CheckCircle2 size={16} /> {t.landing.pricePlan2Feat2}</li>
              <li><CheckCircle2 size={16} /> {t.landing.pricePlan2Feat3}</li>
              <li><CheckCircle2 size={16} /> {t.landing.pricePlan2Feat4}</li>
            </ul>
            <button onClick={() => goPricingCheckout("Pro", 3000)} className="btn-primary w-full">
              {t.landing.priceUpgradeTo} {t.landing.pricePlan2}
            </button>
          </div>

          {/* Team Plan */}
          <div className="pricing-card">
            <h3>{t.landing.pricePlan3}</h3>
            <div className="price">7 500 XOF<span>/{locale === 'fr' ? 'mois' : 'mo'}</span></div>
            <p className="pricing-desc">{t.landing.pricePlan3Desc}</p>
            <ul>
              <li><CheckCircle2 size={16} /> {t.landing.pricePlan3Feat1}</li>
              <li><CheckCircle2 size={16} /> {t.landing.pricePlan3Feat2}</li>
              <li><CheckCircle2 size={16} /> {t.landing.pricePlan3Feat3}</li>
              <li><CheckCircle2 size={16} /> {t.landing.pricePlan3Feat4}</li>
            </ul>
            <button onClick={() => goPricingCheckout("Équipe", 7500)} className="btn-outline w-full">
              {t.landing.priceUpgradeTo} {t.landing.pricePlan3}
            </button>
          </div>
        </div>
      </section>

      {/* FAQ, CTA, FOOTER (Keep your existing code for these sections) */}
    </div>
  );
}