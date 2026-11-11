import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function Login({ onLoginSuccess, goSignup, goBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, "");
      
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      // Save the token securely
      localStorage.setItem("doctrans_token", data.token);
      onLoginSuccess(data.email); 
      
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert("Google Auth is coming soon. Please use email/password.");
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
            <p>Welcome back! Enter your credentials to continue.</p>
          </div>

          <div className="social-buttons">
            <button className="social-btn" style={{ width: '100%' }} onClick={handleGoogleLogin}>
              <FcGoogle size={22} /> Continue with Google
            </button>
          </div>

          <div className="divider">
            <span>or continue with email</span>
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

            <div className="form-options">
              <label className="remember"><input type="checkbox" /> Remember me</label>
              <a href="#forgot" className="forgot-link">Forgot Password?</a>
            </div>

            <button type="submit" className="btn-primary auth-btn" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <span onClick={goSignup} className="link">Create an account</span>
          </p>
        </div>

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