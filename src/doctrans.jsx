import { useState, useEffect } from "react";
import Landing from "./components/Landing";
import AppView from "./components/AppView";
import Checkout from "./components/Checkout";
import Login from "./components/Login";
import Signup from "./components/Signup";
import "./doctrans.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://doctrans-6o6h.onrender.com";

export default function DocTrans() {
  const [screen, setScreen] = useState("landing");
  const [checkingAuth, setCheckingAuth] = useState(true); 
  const [checkout, setCheckout] = useState(null);
  const [plan, setPlan] = useState(null);
  const [locale, setLocale] = useState(() => {
    const saved = localStorage.getItem("doctrans_locale");
    if (saved) return saved;
    return navigator.language.startsWith("fr") ? "fr" : "en";
  });
  
  const [email, setEmailState] = useState(() => {
    return localStorage.getItem("doctrans_email") || "";
  });

  const setEmail = (value) => {
    setEmailState(value);
    localStorage.setItem("doctrans_email", value);
  };

  // Secure Auth Check
  useEffect(() => {
    const savedToken = localStorage.getItem("doctrans_token");
    const savedEmail = localStorage.getItem("doctrans_email");
    
    // In a production app, you would also verify this token with the backend here
    if (savedToken && savedEmail) {
      setScreen("app");
    }
    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("doctrans_locale", locale);
  }, [locale]);

  const openCheckout = (planName, price) => setCheckout({ plan: planName, price });
  
  const handleLogout = () => { 
    localStorage.removeItem("doctrans_token");
    localStorage.removeItem("doctrans_email");
    setEmailState("");
    setScreen("landing"); 
    setPlan(null); 
  };

  if (checkingAuth) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  return (
    <div>
      {screen === "landing" && (
        <Landing 
          goApp={() => setScreen("app")} 
          goPricingCheckout={openCheckout}
          goLogin={() => setScreen("login")} 
          goSignup={() => setScreen("signup")}
          locale={locale} setLocale={setLocale} 
        />
      )}
      {screen === "login" && (
        <Login 
          onLoginSuccess={(userEmail) => {
            setEmail(userEmail);
            setScreen("app");
          }} 
          goSignup={() => setScreen("signup")} 
          goBack={() => setScreen("landing")}
          locale={locale} setLocale={setLocale} 
        />
      )}
      {screen === "signup" && (
        <Signup 
          onSignupSuccess={(userEmail) => {
            setEmail(userEmail);
            setScreen("app");
          }} 
          goLogin={() => setScreen("login")} 
          goBack={() => setScreen("landing")}
          locale={locale} setLocale={setLocale} 
        />
      )}
      {screen === "app" && (
        <AppView
          onOpenCheckout={openCheckout}
          plan={plan} locale={locale} setLocale={setLocale}
          onLogout={handleLogout} email={email} setEmail={setEmail}
        />
      )}
      {checkout && (
        <Checkout
          plan={checkout.plan} price={checkout.price} email={email}
          onEmailCaptured={setEmail} onClose={() => setCheckout(null)}
          locale={locale} setLocale={setLocale}
        />
      )}
    </div>
  );
}