import React, { useState } from "react";
import { X, Lock, AlertCircle, Loader2, Check } from "lucide-react";
import "../doctrans.css";

export default function Checkout({ plan, price, email, onEmailCaptured, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputEmail, setInputEmail] = useState(email || "");

  // Define available plans with XOF prices
  const availablePlans = [
    { name: "Ponctuel", price: 0, desc: "Gratuit", displayPrice: "0 XOF" },
    { name: "Pro", price: 3000, desc: "/ mois", displayPrice: "3 000 XOF" },
    { name: "Équipe", price: 7500, desc: "/ mois", displayPrice: "7 500 XOF" }
  ];

  const [selectedPlan, setSelectedPlan] = useState(
    availablePlans.find((p) => p.name === plan) || availablePlans[1]
  );

  const handlePayment = async () => {
    if (!inputEmail) {
      setError("Veuillez entrer votre adresse email.");
      return;
    }
    
    setLoading(true);
    setError(null);
    onEmailCaptured(inputEmail);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, "");
      
      const res = await fetch(`${backendUrl}/api/saspay/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          plan: selectedPlan.name, 
          price: selectedPlan.price, // Sends 3000 or 7500
          email: inputEmail 
        }),
      });

      if (!res.ok) throw new Error("Erreur serveur");
      
      const data = await res.json();
      
      if (data.payment_url) {
        window.location.href = data.payment_url; 
      } else {
        throw new Error("Aucun lien de paiement reçu.");
      }
    } catch (err) {
      setError("Impossible de créer la session de paiement. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-overlay">
      <div className="checkout-modal">
        <button className="checkout-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="checkout-header">
          <h2>Choisissez votre plan</h2>
          <p className="checkout-subtitle">Sélectionnez l'offre qui vous convient.</p>
        </div>

        {error && (
          <div className="checkout-error">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="checkout-body">
          <div className="plan-selector">
            {availablePlans.map((p) => (
              <div 
                key={p.name}
                className={`plan-option ${selectedPlan.name === p.name ? "selected" : ""}`}
                onClick={() => setSelectedPlan(p)}
              >
                {selectedPlan.name === p.name && (
                  <div className="check-icon"><Check size={12} /></div>
                )}
                <h4>{p.name}</h4>
                <div className="plan-price">
                  {p.displayPrice} <span>{p.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label>Adresse Email</label>
            <input 
              type="email" 
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="vous@exemple.com"
            />
          </div>

          <button 
            className="btn-primary checkout-btn" 
            onClick={handlePayment}
            disabled={loading || selectedPlan.price === 0}
          >
            {loading ? <Loader2 className="spin" size={20} /> : <Lock size={18} />}
            {loading ? "Traitement..." : selectedPlan.price === 0 ? "Plan Gratuit" : `Payer ${selectedPlan.displayPrice}`}
          </button>
          
          <p className="checkout-secure">
            Paiement 100% sécurisé via SasPay
          </p>
        </div>
      </div>
    </div>
  );
}