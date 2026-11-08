import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function Login({ onLoginSuccess, goSignup, goBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Temporary login: Just pass the email
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(email);
    }, 800);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-left">
          <button className="back-btn" onClick={goBack}>
            <ArrowLeft size={18} /> Back to Home
          </button>

          <div className="auth-header">
            <div className="brand-logo" onClick={goBack} style={{ marginBottom: '1.5rem', cursor: 'pointer' }}>
              <div className="brand-icon">D</div>
              <span className="brand-name">DocTrans</span>
            </div>
            <h2>Log in to your Account</h2>
            <p>Welcome back! Enter your email to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <Mail className="input-icon" size={18} />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <Lock className="input-icon" size={18} />
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <button type="submit" className="btn-primary auth-btn" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <span onClick={goSignup} className="link">Create an account</span>
          </p>
        </div>

        {/* Right Side Illustration */}
        <div className="auth-right">
           {/* ... (Keep your existing illustration code here) ... */}
        </div>
      </div>
    </div>
  );
}