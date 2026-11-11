import React, { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, Plus, FileText, CreditCard, Settings, LogOut,
  UploadCloud, Globe, Search, Bell, ArrowUpRight, Award,
  X, Menu, ArrowRightLeft, File, Check, User, Shield,
  Sliders, AlertTriangle, Trash2, Download, Eye
} from "lucide-react";
import "../doctrans.css";
import { translations } from "../i18n";
import LanguageSwitcher from "./LanguageSwitcher";

export default function AppView({
  onOpenCheckout, plan, locale, setLocale, onLogout, email, setEmail,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const t = translations[locale] || translations["en"];

  const [sourceLang, setSourceLang] = useState("Auto-Detect");
  const [targetLang, setTargetLang] = useState("French (FR)");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [translating, setTranslating] = useState(false);
  const [translatedDoc, setTranslatedDoc] = useState(null); 
  const [documents, setDocuments] = useState([]); 
  const [translationsUsed, setTranslationsUsed] = useState(0);
  const [maxTranslations, setMaxTranslations] = useState(2);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const [defaultLang, setDefaultLang] = useState("French (FR)");
  const [preserveLayout, setPreserveLayout] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);

  const fileInputRef = useRef(null);
  const displayName = email ? email.split("@")[0] : "User";

  useEffect(() => {
    if (!email) return;
    const rawUrl = import.meta.env.VITE_BACKEND_URL || "https://doctrans-6o6h.onrender.com";
    const backendUrl = rawUrl.replace(/\/+$/, ""); 
    
    fetch(`${backendUrl}/api/account?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.subscription) {
          setTranslationsUsed(data.subscription.translationsUsed || 0);
          if (data.subscription.maxTranslations) setMaxTranslations(data.subscription.maxTranslations);
        }
      })
      .catch(err => console.error("Error fetching account:", err));

    if (activeTab === "documents") {
      fetch(`${backendUrl}/api/documents?email=${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => setDocuments(data))
        .catch(err => console.error("Error fetching documents:", err));
    }
  }, [activeTab, email]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedFile(file); setTranslatedDoc(null); }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) { setSelectedFile(file); setTranslatedDoc(null); }
  };

  const handleSwap = () => {
    if (sourceLang === "Auto-Detect" || sourceLang === "Détection auto") return;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  const handleTranslate = async () => {
    if (!selectedFile) return;
    setTranslating(true);
    setTranslatedDoc(null);
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("sourceLang", sourceLang);
    formData.append("targetLang", targetLang);
    formData.append("email", email);
    formData.append("preserveLayout", preserveLayout);

    try {
      const rawUrl = import.meta.env.VITE_BACKEND_URL || "https://doctrans-6o6h.onrender.com";
      const backendUrl = rawUrl.replace(/\/+$/, "");

      const response = await fetch(`${backendUrl}/api/translate`, { method: "POST", body: formData });
      const contentType = response.headers.get("content-type");
      
      if (!response.ok || !contentType || !contentType.includes("application/json")) {
        throw new Error("Server error. Please ensure the backend is running.");
      }

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "LIMIT_REACHED" || data.error === "FREE_LIMIT_REACHED") { 
          onOpenCheckout("Pro", 3000); 
          return; 
        }
        if (data.error === "FILE_TOO_LARGE") { 
          alert(data.message); 
          return; 
        }
        throw new Error(data.error || "Translation failed.");
      }

      setTranslatedDoc(data.document);
      if (data.translationsUsed !== undefined) setTranslationsUsed(data.translationsUsed);
      
    } catch (error) {
      console.error(error);
      alert("The translation server is waking up or timed out. Please wait 30 seconds and try again.");
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div className="eduplex-layout">
      {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* SIDEBAR, HEADER, DASHBOARD, AND TRANSLATION TABS (Keep your existing code) */}

      {/* BILLING TAB */}
      {activeTab === "billing" && (
        <div className="billing-container">
          <div className="billing-top-row">
            <div className="current-plan-card">
              <div className="plan-header-row">
                <div className="plan-title"><h3>{t.dash.currentPlanTitle}</h3><span className={`plan-pill ${plan ? 'pro' : 'free'}`}>{plan ? plan.name : "Free"}</span></div>
                <CreditCard className="plan-icon-large" />
              </div>
              <div className="usage-section">
                <div className="usage-text">
                  <span>{t.dash.pagesUsed}</span>
                  <strong>{translationsUsed} / {maxTranslations}</strong>
                </div>
                <div className="usage-bar-bg">
                  <div className="usage-bar-fill" style={{ width: `${Math.min(100, (translationsUsed / maxTranslations) * 100)}%` }}></div>
                </div>
              </div>
              <div className="billing-info-row">
                <div className="info-item"><span className="info-label">{t.dash.nextDate}</span><span className="info-value">{plan ? "Nov 22, 2026" : "N/A"}</span></div>
                <div className="info-item"><span className="info-label">{t.dash.amount}</span><span className="info-value">{plan ? `${plan.price} XOF / mo` : "0 XOF"}</span></div>
              </div>
            </div>
            <div className="payment-method-card">
              <h3>{t.dash.paymentMethod}</h3>
              <div className="empty-payment">
                <div className="card-icon-mock"></div>
                <p>{t.dash.noPayment}</p>
                <button className="btn-outline-sm">{t.dash.addCard}</button>
              </div>
            </div>
          </div>

          <div className="upgrade-section">
            <div className="upgrade-header"><h3>{t.dash.availablePlans}</h3><p>{t.dash.choosePlan}</p></div>
            <div className="upgrade-cards-grid">
              {/* Free */}
              <div className="upgrade-card">
                <div className="card-top"><h4>Ponctuel</h4><div className="upgrade-price">0 XOF<span>{t.dash.mo}</span></div></div>
                <ul className="upgrade-features">
                  <li><Check size={18} className="check-icon" /> {t.landing.pricePlan1Feat1}</li>
                  <li><Check size={18} className="check-icon" /> {t.landing.pricePlan1Feat2}</li>
                  <li><Check size={18} className="check-icon" /> {t.landing.pricePlan1Feat3}</li>
                </ul>
                <button className="btn-outline w-full" disabled>{t.dash.currentPlanTitle}</button>
              </div>
              {/* Pro */}
              <div className="upgrade-card popular">
                <div className="popular-tag">MOST POPULAR</div>
                <div className="card-top"><h4>Pro</h4><div className="upgrade-price">3 000 XOF<span>{t.dash.mo}</span></div></div>
                <ul className="upgrade-features">
                  <li><Check size={18} className="check-icon" /> {t.landing.pricePlan2Feat1}</li>
                  <li><Check size={18} className="check-icon" /> {t.landing.pricePlan2Feat2}</li>
                  <li><Check size={18} className="check-icon" /> {t.landing.pricePlan2Feat3}</li>
                  <li><Check size={18} className="check-icon" /> {t.landing.pricePlan2Feat4}</li>
                </ul>
                <button className="btn-primary w-full" onClick={() => onOpenCheckout("Pro", 3000)}>Upgrade</button>
              </div>
              {/* Team */}
              <div className="upgrade-card">
                <div className="card-top"><h4>Équipe</h4><div className="upgrade-price">7 500 XOF<span>{t.dash.mo}</span></div></div>
                <ul className="upgrade-features">
                  <li><Check size={18} className="check-icon" /> {t.landing.pricePlan3Feat1}</li>
                  <li><Check size={18} className="check-icon" /> {t.landing.pricePlan3Feat2}</li>
                  <li><Check size={18} className="check-icon" /> {t.landing.pricePlan3Feat3}</li>
                  <li><Check size={18} className="check-icon" /> {t.landing.pricePlan3Feat4}</li>
                </ul>
                <button className="btn-outline w-full" onClick={() => onOpenCheckout("Équipe", 7500)}>Upgrade</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS TAB AND MODAL (Keep your existing code) */}
    </div>
  );
}