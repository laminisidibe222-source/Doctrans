import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function Signup({ onSignupSuccess, goLogin, goBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // In Login.jsx
const handleSignup = async (e) => {
  e.preventDefault();
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem("doctrans_token", data.token);
    onSignupSuccess(data.email);
  } else {
    alert(data.error);
  }
};

  const handleGoogleSignup = () => {
    alert("Google Auth will be enabled soon. Please use email for now.");
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
            <h2>Create an Account</h2>
            <p>Start your journey with DocTrans today.</p>
          </div>

          <div className="social-buttons">
            <button className="social-btn" style={{ width: '100%' }} onClick={handleGoogleSignup}>
              <FcGoogle size={22} /> Sign up with Google
            </button>
          </div>

          <div className="divider">
            <span>or continue with email</span>
          </div>

          <form onSubmit={handleSignup} className="auth-form">
            <div className="input-group">
              <User className="input-icon" size={18} />
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
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
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <span onClick={goLogin} className="link">Log in</span>
          </p>
        </div>

        {/* Right Side Illustration */}
        <div className="auth-right">
          <div className="illustration-container">
            <div className="mock-node node-1"><FcGoogle /></div>
            <div className="mock-node node-2"><Mail color="#0055ff" /></div>
            <div className="mock-browser">
              <div className="browser-header">
                <span className="dot red"></span><span className="dot yellow"></span><span className="dot green"></span>
              </div>
              <div className="browser-body">
                <div className="browser-line w-50"></div>
                <div className="browser-line w-80"></div>
                <div className="browser-line w-60"></div>
                <div className="user-row">
                  <div className="avatar"></div>
                  <div className="user-lines">
                    <div className="browser-line w-80"></div>
                    <div className="browser-line w-40"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="right-text">
            <h3>Connect with every application.</h3>
            <p>Everything you need in an easily customizable dashboard.</p>
          </div>
          <div className="dots"><span className="active"></span><span></span><span></span></div>
        </div>
      </div>
    </div>
  );
}