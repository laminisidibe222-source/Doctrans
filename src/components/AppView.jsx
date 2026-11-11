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

      {/* SIDEBAR */}
      <aside className={`eduplex-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-logo">
          <div className="logo-icon-box"><span className="logo-symbol">D</span></div>
          <span className="logo-text">DocTrans</span>
          <button className="mobile-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} color="#ffffff" />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-btn ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }}>
            <LayoutDashboard size={18} /> {t.nav.dashboard}
          </button>
          <button className={`nav-btn ${activeTab === "new" ? "active" : ""}`} onClick={() => { setActiveTab("new"); setIsSidebarOpen(false); }}>
            <Plus size={18} /> {t.nav.newTrans}
          </button>
          <button className={`nav-btn ${activeTab === "documents" ? "active" : ""}`} onClick={() => { setActiveTab("documents"); setIsSidebarOpen(false); }}>
            <FileText size={18} /> {t.nav.docs}
          </button>
          <button className={`nav-btn ${activeTab === "billing" ? "active" : ""}`} onClick={() => { setActiveTab("billing"); setIsSidebarOpen(false); }}>
            <CreditCard size={18} /> {t.nav.billing}
          </button>
          <button className={`nav-btn ${activeTab === "settings" ? "active" : ""}`} onClick={() => { setActiveTab("settings"); setIsSidebarOpen(false); }}>
            <Settings size={18} /> {t.nav.settings}
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="promo-card">
            <div className="promo-icon"><Award size={20} /></div>
            <p>{t.nav.upgrade}</p>
            <span>{t.nav.upgradeDesc}</span>
            <button onClick={() => onOpenCheckout("Pro", 3000)}>{t.nav.upgrade}</button>
          </div>
          <button className="logout-btn" onClick={onLogout}><LogOut size={16} /> {t.nav.logout}</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="eduplex-main">
        <header className="eduplex-header">
          <div className="header-greeting">
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} color="#111827" />
            </button>
            <div>
              <h1>
                {activeTab === "dashboard" && <>{t.dash.welcome}, <span>{displayName}</span> 👋</>}
                {activeTab === "new" && t.dash.newTransTitle}
                {activeTab === "documents" && t.dash.docsTitle}
                {activeTab === "billing" && t.dash.billingTitle}
                {activeTab === "settings" && t.dash.settingsTitle}
              </h1>
              <p>
                {activeTab === "dashboard" && t.dash.subtitle}
                {activeTab === "new" && t.dash.newTransSub}
                {activeTab === "billing" && t.dash.billingSub}
                {activeTab === "settings" && t.dash.settingsSub}
                {activeTab === "documents" && t.dash.docsSub}
              </p>
            </div>
          </div>
          <div className="header-actions">
            <LanguageSwitcher locale={locale} setLocale={setLocale} />
            <div className="search-bar"><Search size={16} /><input type="text" placeholder="Search..." /></div>
            <button className="icon-btn"><Bell size={18} /></button>
            <div className="header-avatar">{email ? email[0].toUpperCase() : "U"}</div>
          </div>
        </header>

        <div className="dashboard-grid">
          
          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <>
              <div className="grid-main">
                <div className="quick-actions-row">
                  <div className="action-card" onClick={() => setActiveTab("new")}>
                    <div className="action-icon bg-purple"><UploadCloud size={20} /></div>
                    <div className="action-info"><h4>{t.dash.newUpload}</h4><p>{t.dash.translateFile}</p></div>
                  </div>
                  <div className="action-card">
                    <div className="action-icon bg-green"><FileText size={20} /></div>
                    <div className="action-info"><h4>{t.dash.recentFiles}</h4><p>{translationsUsed} {t.dash.translated}</p></div>
                  </div>
                  <div className="action-card">
                    <div className="action-icon bg-orange"><Globe size={20} /></div>
                    <div className="action-info"><h4>{t.dash.languages}</h4><p>22 {t.dash.available}</p></div>
                  </div>
                </div>
                <div className="chart-card">
                  <div className="card-header">
                    <h3>{t.dash.activity}</h3>
                    <select className="chart-select"><option>{t.dash.thisWeek}</option></select>
                  </div>
                  <div className="chart-container">
                    <div className="mock-chart">
                      {[40, 70, 45, 90, 65, 85, 50].map((height, i) => (
                        <div key={i} className="chart-bar-wrapper">
                          <div className="chart-bar" style={{ height: `${height}%` }}></div>
                          <span className="chart-label">{['M','T','W','T','F','S','S'][i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid-side">
                <div className="side-card plan-card">
                  <div className="plan-header">
                    <div className="plan-badge-icon">D</div>
                    <div><h4>DocTrans {plan ? plan.name : "Free"}</h4><p>{t.dash.currentPlan}</p></div>
                  </div>
                  <p className="plan-desc">
                    {plan && plan.name !== "Free" 
                      ? `${Math.max(0, maxTranslations - translationsUsed)} ${t.dash.remaining}` 
                      : `${Math.max(0, maxTranslations - translationsUsed)} / ${maxTranslations} ${t.dash.remaining}`}
                  </p>
                  <button className="btn-lime" onClick={() => onOpenCheckout("Pro", 3000)}>{t.dash.upgradePlan} <ArrowUpRight size={16} /></button>
                </div>
                <div className="side-card">
                  <div className="card-header"><h3>{t.dash.recentAct}</h3></div>
                  <div className="activity-feed">
                    <div className="feed-item">
                      <div className="feed-dot bg-green"></div>
                      <div className="feed-text"><h4>{t.dash.docTranslated}</h4><p>Q3_Financials.pdf ➔ ES</p><span>2 hours ago</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* NEW TRANSLATION */}
          {activeTab === "new" && (
            <div className="translation-workspace">
              <div className="translation-card">
                {translationsUsed >= maxTranslations ? (
                  <div className="translation-success-state">
                    <div className="success-icon-wrapper" style={{ background: '#fee2e2' }}>
                      <Award size={40} style={{ color: '#ef4444' }} />
                    </div>
                    <h3>{t.dash.freeLimit}</h3>
                    <p>{t.dash.freeLimitSub}</p>
                    <button className="btn-primary w-full mt-4" onClick={() => onOpenCheckout("Pro", 3000)}>{t.dash.upgradeNow}</button>
                  </div>
                ) : translatedDoc ? (
                  <div className="translation-success-state">
                    <div className="success-icon-wrapper"><Check size={40} className="success-icon" /></div>
                    <h3>{t.dash.success}</h3>
                    <p>{t.dash.successSub}</p>
                    <a href={translatedDoc.url} download className="btn-download" target="_blank" rel="noreferrer">
                      <Download size={20} /> {t.dash.download} {translatedDoc.name}
                    </a>
                    <button className="btn-outline-sm mt-4" onClick={() => { setSelectedFile(null); setTranslatedDoc(null); }}>{t.dash.translateAnother}</button>
                  </div>
                ) : (
                  <>
                    <div className={`beautiful-dropzone ${isDragging ? "dragging" : ""} ${selectedFile ? "has-file" : ""}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current.click()}>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden-file-input" accept=".pdf,.doc,.docx,.ppt,.pptx" />
                      {!selectedFile ? (
                        <>
                          <div className="dropzone-icon-wrapper"><UploadCloud size={32} className="dropzone-icon" /></div>
                          <h3>{t.dash.dragDrop}</h3>
                          <p>{t.dash.or} <span className="browse-text">{t.dash.browse}</span></p>
                          <p className="hint">{t.dash.hint}</p>
                        </>
                      ) : (
                        <div className="selected-file-display">
                          <div className="file-icon-box"><File size={24} /></div>
                          <div className="file-details">
                            <h3>{selectedFile.name}</h3>
                            <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button className="remove-file-btn" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}><X size={18} /></button>
                        </div>
                      )}
                    </div>

                    <div className="language-section">
                      <div className="lang-group">
                        <label>{t.dash.from}</label>
                        <div className="custom-select-wrapper">
                          <Globe size={16} className="select-icon" />
                          <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
                            <option>{t.dash.auto}</option><option>English (EN)</option><option>French (FR)</option><option>Spanish (ES)</option>
                          </select>
                        </div>
                      </div>
                      <button className="swap-btn" onClick={handleSwap} title="Swap"><ArrowRightLeft size={18} /></button>
                      <div className="lang-group">
                        <label>{t.dash.to}</label>
                        <div className="custom-select-wrapper">
                          <Globe size={16} className="select-icon" />
                          <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                            <option>French (FR)</option><option>English (EN)</option><option>Spanish (ES)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button className="btn-translate" disabled={!selectedFile || translating} onClick={handleTranslate}>
                      {translating ? "Translating..." : t.dash.translateBtn}
                      {!translating && <ArrowRightLeft size={18} style={{ transform: 'rotate(90deg)' }} />}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="documents-table-card">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>{t.dash.name}</th>
                    <th>{t.dash.lang}</th>
                    <th className="hide-mobile">{t.dash.date}</th>
                    <th>{t.dash.status}</th>
                    <th>{t.dash.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-8 text-muted">{t.dash.noDocs}</td></tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id}>
                        <td className="doc-name-cell"><FileText size={16} /> {doc.name}</td>
                        <td>{doc.lang}</td>
                        <td className="hide-mobile">{doc.date}</td>
                        <td><span className="status-badge success">{doc.status}</span></td>
                        <td>
                          <button className="btn-view-doc" onClick={() => setSelectedDoc(doc)}>
                            <Eye size={16} /> <span className="hide-mobile">{t.dash.view}</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* BILLING */}
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
                  <div className="upgrade-card">
                    <div className="card-top"><h4>Ponctuel</h4><div className="upgrade-price">0 XOF<span>{t.dash.mo}</span></div></div>
                    <ul className="upgrade-features">
                      <li><Check size={18} className="check-icon" /> {t.landing.pricePlan1Feat1}</li>
                      <li><Check size={18} className="check-icon" /> {t.landing.pricePlan1Feat2}</li>
                      <li><Check size={18} className="check-icon" /> {t.landing.pricePlan1Feat3}</li>
                    </ul>
                    <button className="btn-outline w-full" disabled>{t.dash.currentPlanTitle}</button>
                  </div>
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

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div className="settings-container">
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-icon-wrapper bg-purple"><User size={20} /></div>
                  <div className="settings-header-text">
                    <h3>{t.dash.profile}</h3>
                    <p>{t.dash.profileSub}</p>
                  </div>
                </div>
                <div className="settings-card-body">
                  <div className="form-group">
                    <label>{t.dash.emailLabel}</label>
                    <input type="email" value={email || ""} disabled className="settings-input disabled" />
                    <p className="input-hint">{t.dash.emailHint}</p>
                  </div>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-icon-wrapper bg-orange"><Shield size={20} /></div>
                  <div className="settings-header-text">
                    <h3>{t.dash.security}</h3>
                    <p>{t.dash.securitySub}</p>
                  </div>
                </div>
                <div className="settings-card-body">
                  <button className="btn-outline-sm">{t.dash.changePass}</button>
                </div>
              </div>

              <div className="settings-card danger-zone">
                <div className="settings-card-header">
                  <div className="settings-icon-wrapper bg-red"><AlertTriangle size={20} /></div>
                  <div className="settings-header-text">
                    <h3>{t.dash.danger}</h3>
                    <p>{t.dash.dangerSub}</p>
                  </div>
                </div>
                <div className="settings-card-body">
                  <button className="btn-danger"><Trash2 size={16} /> {t.dash.delete}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedDoc && (
        <div className="doc-modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="doc-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDoc(null)}><X size={20} /></button>
            <div className="modal-header">
              <div className="file-icon-box"><FileText size={32} /></div>
              <h3>{selectedDoc.name}</h3>
              <span className="status-badge success">{selectedDoc.status}</span>
            </div>
            <div className="modal-body">
              <div className="detail-row"><span className="detail-label">{t.dash.lang}</span><span className="detail-value">{selectedDoc.lang}</span></div>
              <div className="detail-row"><span className="detail-label">{t.dash.date}</span><span className="detail-value">{selectedDoc.date}</span></div>
            </div>
            <div className="modal-footer">
              <a href={selectedDoc.url} download className="btn-download w-full" target="_blank" rel="noreferrer">
                <Download size={18} /> {t.dash.download}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}