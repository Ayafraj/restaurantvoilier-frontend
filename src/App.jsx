import React, { useState, useEffect } from "react";
import "./style.css";
import AdminPage from "./AdminPage";
import { QRCodeSVG } from "qrcode.react";

// URLs de production — backend Symfony déployé sur Railway.
// Plus besoin de l'IP locale du PC ni du port 8000.
export const API_URL =
  "https://restaurantvoilier-production.up.railway.app/api";
export const ASSETS_URL = "https://restaurantvoilier-production.up.railway.app";

/*
 * IMPORTANT — sécurité backend à faire côté serveur :
 * 1. motDePasse => bcrypt/Argon2id, jamais en clair.
 * 2. POST /refresh doit valider un refresh token rotatif et révoquer l'ancien.
 * 3. /login et /register doivent avoir un rate-limit serveur (ex. 5 essais/minute/IP
 *    + limitation par compte), car le blocage JS ci-dessus n'est PAS une sécurité suffisante.
 * 4. Valider et normaliser les données côté serveur (email, password, dates, capacités,
 *    droits admin) même si le client les valide déjà.
 * 5. Pour une vraie disponibilité horaire, POST /reservations doit refuser côté serveur
 *    tout chevauchement table/date/heure.
 */

const ACCESS_TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const TOKEN_REFRESH_SKEW_SECONDS = 45;

export function readJWT(token) {
  try {
    if (!token) return null;
    const part = token.split(".")[1];
    return JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function tokenExpired(token, skewSeconds = 0) {
  const payload = readJWT(token);
  return (
    !payload ||
    !payload.exp ||
    payload.exp <= Math.floor(Date.now() / 1000) + skewSeconds
  );
}

export function passwordScore(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export function passwordStrength(password) {
  const score = passwordScore(password);
  const labels = ["Très faible", "Faible", "Moyen", "Bon", "Fort", "Très fort"];
  return { score, label: labels[score], valid: score >= 4 };
}

export function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim());
}

export function jsonHeaders(token) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function tryRefreshToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  try {
    const response = await window.__rawFetch(`${API_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.token) return null;
    localStorage.setItem(ACCESS_TOKEN_KEY, data.token);
    if (data.refreshToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    window.dispatchEvent(
      new CustomEvent("voilier-token-refreshed", { detail: data.token })
    );
    return data.token;
  } catch {
    return null;
  }
}

export async function apiFetch(input, options = {}, retry = true) {
  const opts = { ...options, headers: { ...(options.headers || {}) } };
  const authHeader = Object.keys(opts.headers).find(
    (k) => k.toLowerCase() === "authorization"
  );
  const hasBearer = authHeader && /^Bearer\s+/i.test(opts.headers[authHeader]);

  // Timeout réseau : évite les boutons bloqués indéfiniment.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  opts.signal = opts.signal || controller.signal;

  try {
    let response = await window.__rawFetch(input, opts);

    if (response.status === 401 && hasBearer && retry) {
      const newToken = await tryRefreshToken();
      if (newToken) {
        const nextHeaders = { ...opts.headers };
        nextHeaders[authHeader] = `Bearer ${newToken}`;
        return apiFetch(input, { ...options, headers: nextHeaders }, false);
      }

      localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.dispatchEvent(new CustomEvent("voilier-session-expired"));
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

// Toutes les requêtes API passent par ce wrapper.
window.__rawFetch = window.fetch.bind(window);

// Palette cohérente avec le thème (navy / brass / teal / coral),
// utilisée par les graphiques de la page Statistiques.
const CHART_COLORS = {
  Confirmée: "#4f8f86",
  Annulée: "#c1584c",
  Libre: "#4f8f86",
  Réservée: "#c9a24b",
  Occupée: "#c1584c",
};
const CHART_FALLBACK = ["#1f4267", "#8aa8bd", "#c9a24b", "#4f8f86", "#c1584c"];
export function colorForKey(key, index) {
  return CHART_COLORS[key] || CHART_FALLBACK[index % CHART_FALLBACK.length];
}

export function decodeJWT(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/* ================== THEME (dark mode) ================== */
export function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("voilier_theme") || "light"
  );
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("voilier_theme", theme);
  }, [theme]);
  return [theme, setTheme];
}

/* ================== TOASTS ================== */
let toastId = 0;
let pushToastRef = null;
export function toast(message, type = "success") {
  if (pushToastRef) pushToastRef(message, type);
}

function ToastStack() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    pushToastRef = (message, type) => {
      const id = ++toastId;
      setToasts((t) => [...t, { id, message, type, leaving: false }]);
      setTimeout(() => remove(id), 3600);
    };
    return () => {
      pushToastRef = null;
    };
  }, []);

  const remove = (id) => {
    setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 180);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.type} ${t.leaving ? "leaving" : ""}`}
        >
          <span className="toast-icon">{t.type === "error" ? "⚠️" : "✓"}</span>
          <span className="toast-msg">{t.message}</span>
          <button className="toast-close" onClick={() => remove(t.id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

/* ================== CONFIRM MODAL ================== */
let confirmResolveRef = null;
let requestConfirmRef = null;
export function askConfirm(options) {
  return new Promise((resolve) => {
    if (requestConfirmRef) {
      requestConfirmRef(options);
      confirmResolveRef = resolve;
    } else {
      resolve(window.confirm(options.message || "Confirmer ?"));
    }
  });
}

function ConfirmModal() {
  const [state, setState] = useState(null);

  useEffect(() => {
    requestConfirmRef = (options) => setState(options);
    return () => {
      requestConfirmRef = null;
    };
  }, []);

  if (!state) return null;

  const close = (result) => {
    setState(null);
    if (confirmResolveRef) {
      confirmResolveRef(result);
      confirmResolveRef = null;
    }
  };

  return (
    <div className="modal-overlay" onClick={() => close(false)}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>
          <span>⚠️</span>
          <span>{state.title || "Confirmer l'action"}</span>
        </h3>
        <p>{state.message}</p>
        <div className="modal-actions">
          <button
            className="danger"
            onClick={() => close(false)}
            style={{ background: "transparent" }}
          >
            Annuler
          </button>
          <button
            onClick={() => close(true)}
            style={{
              background:
                state.tone === "danger" ? "#c1584c" : "var(--navy-grad)",
            }}
          >
            {state.confirmLabel || "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================== PASSWORD INPUT (show/hide) ================== */
function PasswordInput({ value, onChange, placeholder, required }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-field">
      <input
        type={visible ? "text" : "password"}
        placeholder={placeholder || "••••••••"}
        value={value}
        onChange={onChange}
        required={required}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={
          visible ? "Masquer le mot de passe" : "Afficher le mot de passe"
        }
        title={visible ? "Masquer" : "Afficher"}
      >
        {visible ? "🙈" : "👁️"}
      </button>
    </div>
  );
}

/* ================== EMPTY STATE ILLUSTRÉ ================== */
export function EmptyState({ title, subtitle }) {
  return (
    <div className="empty-state-illus">
      <svg
        width="76"
        height="76"
        viewBox="0 0 76 76"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="38" cy="38" r="37" stroke="#e4dfd3" strokeWidth="2" />
        <path
          d="M22 48 Q38 30 54 48"
          stroke="#c9a24b"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="30" cy="32" r="2.6" fill="#4f8f86" />
        <circle cx="46" cy="32" r="2.6" fill="#4f8f86" />
      </svg>
      {title && <strong>{title}</strong>}
      {subtitle && <span>{subtitle}</span>}
    </div>
  );
}

/* ================== SKELETONS ================== */
function TablesGridSkeleton({ count = 8 }) {
  return (
    <div className="tables-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-table-card" />
      ))}
    </div>
  );
}

export function AdminGridSkeleton({ count = 4 }) {
  return (
    <div className="admin-tables-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-admin-card" />
      ))}
    </div>
  );
}

export function ReservationsListSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-reservation" />
      ))}
    </>
  );
}

function MenuListSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-menu-row">
          <div className="skeleton" />
          <div className="skeleton-menu-lines">
            <div className="skeleton" style={{ height: 16, width: "40%" }} />
            <div className="skeleton" style={{ height: 12, width: "85%" }} />
            <div className="skeleton" style={{ height: 12, width: "60%" }} />
          </div>
        </div>
      ))}
    </>
  );
}

/* ================== GRAPHIQUE EN BARRES (HISTOGRAMME) ================== */
export function BarChartStat({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div>
      {data.map((d) => (
        <div key={d.label} style={{ marginBottom: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 7,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 3,
                  background: d.color,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                {d.label}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span
                style={{
                  fontSize: 15,
                  color: "var(--navy-950)",
                  fontWeight: 700,
                }}
              >
                {d.value}
              </span>
              <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                {Math.round((d.value / total) * 100)}%
              </span>
            </div>
          </div>
          <div
            style={{
              background: "var(--sail-dim)",
              borderRadius: 999,
              height: 10,
              width: "100%",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(d.value / max) * 100}%`,
                height: "100%",
                borderRadius: 999,
                background: d.color,
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================== GRAPHIQUE CIRCULAIRE (DONUT) ================== */
export function DonutChartStat({ data, size = 148, thickness = 24 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 26,
        flexWrap: "wrap",
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ display: "block" }}
        >
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--sail-dim)"
              strokeWidth={thickness}
            />
            {data.map((d) => {
              const fraction = d.value / total;
              const dash = Math.max(fraction * circumference - 2, 0);
              const offset = -cumulative * circumference;
              cumulative += fraction;
              return (
                <circle
                  key={d.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{ fontSize: 22, fontWeight: 700, color: "var(--navy-950)" }}
          >
            {total}
          </span>
          <span
            style={{
              fontSize: 10,
              color: "var(--ink-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.4px",
            }}
          >
            total
          </span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {data.map((d) => (
          <div
            key={d.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              fontSize: 13,
              color: "var(--ink-soft)",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                flexShrink: 0,
                background: d.color,
                display: "inline-block",
              }}
            />
            <span>{d.label}</span>
            <strong
              style={{
                color: "var(--navy-950)",
                fontWeight: 700,
                marginLeft: "auto",
                paddingLeft: 14,
              }}
            >
              {Math.round((d.value / total) * 100)}%
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function LoadingButton({ loading, children, ...props }) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      <span className="btn-loading">
        {loading && <span className="spinner" aria-hidden="true" />}
        {loading ? "Chargement..." : children}
      </span>
    </button>
  );
}

export function PaginationControls({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let p = start; p <= end; p++) pages.push(p);
  return (
    <div className="pagination">
      <button
        className="page-button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={p === page ? "active" : ""}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        className="page-button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        ›
      </button>
      <span className="pagination-info">
        Page {page} / {totalPages}
      </span>
    </div>
  );
}

export function exportExcel(rows, filename, sheetName = "Export") {
  if (!window.XLSX) {
    toast("Module Excel indisponible.", "error");
    return;
  }
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

export function printPDF(title) {
  const oldTitle = document.title;
  document.title = title;
  window.print();
  setTimeout(() => {
    document.title = oldTitle;
  }, 500);
}

function LoginPage({
  onLoginSuccess,
  onGoToRegister,
  onGoToHome,
  adminOnly = false,
}) {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(
    Number(localStorage.getItem("voilier_login_locked_until") || 0)
  );
  const [failedAttempts, setFailedAttempts] = useState(
    Number(localStorage.getItem("voilier_login_attempts") || 0)
  );

  useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => {
      if (Date.now() >= lockedUntil) {
        localStorage.removeItem("voilier_login_locked_until");
        localStorage.setItem("voilier_login_attempts", "0");
        setLockedUntil(0);
        setFailedAttempts(0);
      }
    }, 500);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (lockedUntil && Date.now() < lockedUntil) {
      setError("Trop de tentatives. Réessayez dans quelques secondes.");
      return;
    }
    if (!validEmail(email)) {
      setError("Veuillez saisir une adresse email valide.");
      return;
    }
    if (!motDePasse) {
      setError("Veuillez saisir votre mot de passe.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, motDePasse }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Email ou mot de passe incorrect");

      if (adminOnly) {
        const loginPayload = decodeJWT(data.token);
        if (
          !loginPayload ||
          !Array.isArray(loginPayload.roles) ||
          !loginPayload.roles.includes("ROLE_ADMIN")
        ) {
          throw new Error(
            "Accès refusé : ce compte n'est pas un compte administrateur."
          );
        }
      }

      localStorage.setItem("token", data.token);
      if (data.refreshToken)
        localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("voilier_login_attempts", "0");
      localStorage.removeItem("voilier_login_locked_until");
      toast("Connexion réussie.", "success");
      onLoginSuccess(data.token);
    } catch (err) {
      const nextAttempts = failedAttempts + 1;
      if (nextAttempts >= 5) {
        const until = Date.now() + 30000;
        localStorage.setItem("voilier_login_locked_until", String(until));
        setLockedUntil(until);
        localStorage.setItem("voilier_login_attempts", "0");
        setFailedAttempts(0);
        setError(
          "Trop de tentatives. Connexion temporairement bloquée 30 secondes."
        );
      } else {
        localStorage.setItem("voilier_login_attempts", String(nextAttempts));
        setFailedAttempts(nextAttempts);
        setError(err.message);
      }
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-pad">
      <div className="container">
        <div className="logo">
          <img src="logo.png" alt="El Mehdi" className="logo-img" />
          <h1>Le Voilier</h1>
          <div className="subtitle">HÔTEL EL MEHDI</div>
        </div>
        <h2 className="section-title">
          {adminOnly ? "Connexion administrateur" : "Connexion"}
        </h2>
        <form onSubmit={handleSubmit}>
          <label className="field-label">Email</label>
          <input
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="field-label">Mot de passe</label>
          <PasswordInput
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
        {!adminOnly && onGoToRegister && (
          <p className="link-switch">
            Pas encore de compte ?{" "}
            <a onClick={onGoToRegister}>Créer un compte</a>
          </p>
        )}
        {onGoToHome && (
          <p className="link-switch back-home-link">
            <a onClick={onGoToHome}>← Retour à l'accueil</a>
          </p>
        )}
      </div>
    </div>
  );
}

function RegisterPage({ onRegisterSuccess, onGoToLogin }) {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const forceMotDePasse = passwordStrength(motDePasse);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validEmail(email)) {
      setError("Veuillez saisir une adresse email valide.");
      return;
    }
    if (!forceMotDePasse.valid) {
      setError(
        "Mot de passe trop faible : utilisez 8 caractères, majuscule, minuscule, chiffre et symbole."
      );
      return;
    }
    setLoading(true);
    try {
      const response = await apiFetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, prenom, email, telephone, motDePasse }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Erreur lors de l'inscription");
      toast("Compte créé avec succès.", "success");
      onRegisterSuccess(email);
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-pad">
      <div className="container">
        <div className="logo">
          <img src="logo.png" alt="El Mehdi" className="logo-img" />
          <h1>Le Voilier</h1>
          <div className="subtitle">HÔTEL EL MEHDI</div>
        </div>
        <h2 className="section-title">Créer un compte</h2>
        <form onSubmit={handleSubmit}>
          <div className="row-2">
            <div>
              <label className="field-label">Nom</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="field-label">Prénom</label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
              />
            </div>
          </div>
          <label className="field-label">Email</label>
          <input
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="field-label">Téléphone</label>
          <input
            type="tel"
            placeholder="Optionnel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
          />
          <label className="field-label">Mot de passe</label>
          <PasswordInput
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
          />
          <div className="password-strength" aria-live="polite">
            <div className="password-strength-bar">
              <div
                className="password-strength-fill"
                style={{
                  width: `${forceMotDePasse.score * 20}%`,
                  background:
                    forceMotDePasse.score >= 4 ? "var(--teal)" : "var(--coral)",
                }}
              />
            </div>
            <div className="password-strength-text">
              <span>Force : {forceMotDePasse.label}</span>
              <span>8+ caractères · maj · min · chiffre · symbole</span>
            </div>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Création..." : "Créer mon compte"}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
        <p className="link-switch">
          Déjà un compte ? <a onClick={onGoToLogin}>Se connecter</a>
        </p>
      </div>
    </div>
  );
}

function ChoixTable({ tables, onSelect, loading }) {
  const [filtreCapacite, setFiltreCapacite] = useState("tous");

  if (loading) {
    return (
      <>
        <h3>Choisissez une table</h3>
        <TablesGridSkeleton />
      </>
    );
  }

  const capacitesDisponibles = [...new Set(tables.map((t) => t.capacite))].sort(
    (a, b) => a - b
  );

  const tablesAffichees =
    filtreCapacite === "tous"
      ? tables
      : tables.filter((t) => t.capacite === Number(filtreCapacite));

  return (
    <>
      <h3>Choisissez une table</h3>

      {capacitesDisponibles.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setFiltreCapacite("tous")}
            style={{
              width: "auto",
              margin: 0,
              padding: "7px 14px",
              fontSize: "12px",
              background:
                filtreCapacite === "tous"
                  ? "var(--navy-700)"
                  : "var(--ink-soft)",
            }}
          >
            Toutes ({tables.length})
          </button>
          {capacitesDisponibles.map((cap) => (
            <button
              key={cap}
              onClick={() => setFiltreCapacite(String(cap))}
              style={{
                width: "auto",
                margin: 0,
                padding: "7px 14px",
                fontSize: "12px",
                background:
                  filtreCapacite === String(cap)
                    ? "var(--navy-700)"
                    : "var(--ink-soft)",
              }}
            >
              {cap} pers.
            </button>
          ))}
        </div>
      )}

      <div className="tables-grid">
        {tablesAffichees.map((table) => (
          <div
            key={table.id}
            className={`table-card ${
              table.statut === "Libre" ? "libre" : "reservee"
            }`}
            onClick={() => table.statut === "Libre" && onSelect(table)}
          >
            <strong>Table {table.numero}</strong>
            <p>{`${table.capacite} pers.`}</p>
            <small>{table.statut}</small>
          </div>
        ))}
      </div>

      {tablesAffichees.length === 0 && (
        <EmptyState
          title="Aucune table"
          subtitle="Aucune table ne correspond à cette capacité."
        />
      )}
    </>
  );
}

function FormulaireReservation({ table, token, onRetour, onSuccess }) {
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");
  const [nombrePersonnes, setNombrePersonnes] = useState(2);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReserver = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiFetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tableId: table.id,
          date,
          heure,
          nombrePersonnes: parseInt(nombrePersonnes),
        }),
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Erreur lors de la réservation");

      toast("Réservation confirmée !", "success");
      onSuccess(data.id);
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h3>Détails de la réservation</h3>
      <div className="selected-badge">
        <div>
          <strong>Table {table.numero}</strong>
          <br />
          <span>{table.capacite} personnes max</span>
        </div>
        <button onClick={onRetour}>Changer</button>
      </div>

      <form onSubmit={handleReserver}>
        <label className="field-label">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <label className="field-label">Heure</label>
        <input
          type="time"
          value={heure}
          onChange={(e) => setHeure(e.target.value)}
          required
        />
        <label className="field-label">Nombre de personnes</label>
        <input
          type="number"
          min="1"
          max={table.capacite}
          value={nombrePersonnes}
          onChange={(e) => setNombrePersonnes(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Confirmation..." : "Confirmer la réservation"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </>
  );
}

function SectionReserver({ token, onDone }) {
  const [tables, setTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [error, setError] = useState("");

  const chargerTables = () => {
    setTablesLoading(true);
    apiFetch(`${API_URL}/tables`)
      .then((res) => res.json())
      .then((data) => setTables(Array.isArray(data) ? data : []))
      .catch(() => {
        setError("Impossible de charger les tables");
        toast("Impossible de charger les tables", "error");
      })
      .finally(() => setTablesLoading(false));
  };

  useEffect(() => {
    chargerTables();
  }, []);

  const handleSuccess = (id) => {
    setSelectedTable(null);
    chargerTables();
    onDone();
  };

  return (
    <>
      <div className="main-header">
        <h1>Réserver une table</h1>
        <p>Choisissez une table disponible puis complétez votre réservation</p>
      </div>
      <div className="main-card">
        {error && <p className="error">{error}</p>}

        {!selectedTable ? (
          <ChoixTable
            tables={tables}
            onSelect={setSelectedTable}
            loading={tablesLoading}
          />
        ) : (
          <FormulaireReservation
            table={selectedTable}
            token={token}
            onRetour={() => setSelectedTable(null)}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </>
  );
}

function SectionMesReservations({ token, refreshKey }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const searchDebounced = useDebouncedValue(search, 250);

  const charger = () => {
    setLoading(true);
    apiFetch(`${API_URL}/reservations/mes-reservations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("");
        return res.json();
      })
      .then((data) => setReservations(Array.isArray(data) ? data : []))
      .catch(() => {
        setError("Impossible de charger vos réservations");
        toast("Impossible de charger vos réservations", "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
  }, [refreshKey]);

  const handleAnnuler = async (id) => {
    const ok = await askConfirm({
      title: "Annuler la réservation",
      message:
        "Voulez-vous vraiment annuler cette réservation ? Cette action est irréversible.",
      confirmLabel: "Annuler la réservation",
      tone: "danger",
    });
    if (!ok) return;

    setError("");
    setLoadingId(id);
    const previous = reservations;
    setReservations((items) =>
      items.map((r) => (r.id === id ? { ...r, statut: "Annulée" } : r))
    );
    try {
      const response = await apiFetch(`${API_URL}/reservations/${id}/annuler`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Erreur lors de l'annulation");
      toast("Réservation annulée.", "success");
      charger();
    } catch (err) {
      setReservations(previous);
      setError(err.message);
      toast(err.message, "error");
    } finally {
      setLoadingId(null);
    }
  };

  const reservationsFiltrees = reservations.filter((r) => {
    const matchDate =
      !dateFilter || String(r.date || "").slice(0, 10) === dateFilter;
    const matchStatus = statusFilter === "Tous" || r.statut === statusFilter;
    const q = searchDebounced.trim().toLowerCase();
    const matchSearch =
      !q ||
      `${r.table || ""} ${r.date || ""} ${r.heure || ""}`
        .toLowerCase()
        .includes(q);
    return matchDate && matchStatus && matchSearch;
  });

  return (
    <>
      <div className="main-header">
        <h1>Mes réservations</h1>
        <p>Historique et suivi de vos réservations</p>
      </div>
      <div className="main-card">
        {error && <p className="error">{error}</p>}
        <div className="filter-grid">
          <div>
            <label className="field-label">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>Tous</option>
              <option>Confirmée</option>
              <option>Annulée</option>
            </select>
          </div>
          <div>
            <label className="field-label">Recherche</label>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Table, date, heure..."
            />
          </div>
        </div>

        {loading ? (
          <ReservationsListSkeleton />
        ) : reservations.length === 0 ? (
          <EmptyState
            title="Aucune réservation"
            subtitle="Vous n'avez aucune réservation pour le moment."
          />
        ) : (
          reservationsFiltrees.map((r) => (
            <div key={r.id} className="reservation-item">
              <div className="row">
                <strong>
                  Table {r.table} — {r.date}
                </strong>
                <span
                  className={`badge-statut ${
                    r.statut === "Confirmée" ? "confirmee" : "annulee"
                  }`}
                >
                  {r.statut}
                </span>
              </div>
              <p>
                {`${r.heure} · ${r.nombrePersonnes} ${
                  r.nombrePersonnes > 1 ? "personnes" : "personne"
                }`}
              </p>
              {r.statut === "Confirmée" && (
                <button
                  className="danger"
                  onClick={() => handleAnnuler(r.id)}
                  disabled={loadingId === r.id}
                >
                  {loadingId === r.id ? "Annulation..." : "Annuler"}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}

/* ================== ÉTOILES / NOTE ================== */
function EtoilesInput({ note, onChange }) {
  return (
    <div style={{ display: "flex", gap: "4px", margin: "8px 0" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={() => onChange(n)}
          style={{
            cursor: "pointer",
            fontSize: "22px",
            color: n <= note ? "#c9a24b" : "#e4dfd3",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

/* ================== AVIS SUR UN PLAT ================== */
function FormulaireAvisPlat({ platId, token, onSuccess, onCancel }) {
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await apiFetch(`${API_URL}/avis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ platId, note, commentaire }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Erreur lors de l'envoi de l'avis");
      toast("Merci pour votre avis !", "success");
      onSuccess();
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
      <label className="field-label">Votre note</label>
      <EtoilesInput note={note} onChange={setNote} />
      <label className="field-label">Commentaire (optionnel)</label>
      <input
        type="text"
        value={commentaire}
        onChange={(e) => setCommentaire(e.target.value)}
        placeholder="Votre avis sur ce plat..."
      />
      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
        <button type="submit" disabled={loading} style={{ margin: 0 }}>
          {loading ? "Envoi..." : "Envoyer l'avis"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="danger"
          style={{ margin: 0 }}
        >
          Annuler
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

export function imagePlatCategorie(categorie) {
  const c = (categorie || "").toLowerCase();
  if (c.includes("pizza"))
    return "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80";
  if (c.includes("dessert"))
    return "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80";
  if (c.includes("boisson"))
    return "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80";
  if (c.includes("mer") || c.includes("poisson"))
    return "https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=900&q=80";
  if (c.includes("pâte") || c.includes("pates"))
    return "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80";
  return "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80";
}

export function urlImagePlat(plat) {
  if (!plat.image) return imagePlatCategorie(plat.categorie);
  if (/^https?:\/\//i.test(plat.image)) return plat.image;
  const chemin = plat.image.replace(/^\/+/, "");
  return `${ASSETS_URL}/${chemin}`;
}

function CartePlat({ plat, token, onAvisAjoute }) {
  const [avisData, setAvisData] = useState(null);
  const [afficherAvis, setAfficherAvis] = useState(false);
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);

  const chargerAvis = () => {
    apiFetch(`${API_URL}/plats/${plat.id}/avis`)
      .then((res) => res.json())
      .then(setAvisData)
      .catch(() => setAvisData({ moyenne: 0, avis: [] }));
  };

  useEffect(() => {
    chargerAvis();
  }, []);

  const moyenne = Number(avisData?.moyenne || 0);
  const nbAvis = Array.isArray(avisData?.avis) ? avisData.avis.length : 0;
  const disponible = plat.disponible !== false && plat.disponibilite !== false;

  return (
    <article className="menu-card">
      <div className="menu-card-img">
        <img
          src={urlImagePlat(plat)}
          alt={plat.nom}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = imagePlatCategorie(plat.categorie);
          }}
        />
        <span className={`menu-status ${disponible ? "" : "unavailable"}`}>
          {disponible ? "✓ Disponible" : "✕ Indisponible"}
        </span>
      </div>

      <div className="menu-body">
        <div className="menu-cat">{categorieVoilier(plat.categorie)}</div>
        <div className="menu-title-row">
          <h3 className="menu-title">{plat.nom}</h3>
        </div>
        <p className="menu-description">
          {plat.description || "Délicieuse spécialité du restaurant."}
        </p>

        <div className="menu-price-row">
          <span className="menu-price">
            {plat.prix != null
              ? `${Number(plat.prix).toFixed(3)} DT`
              : "Prix sur demande"}
          </span>
          <span className="menu-review-summary">
            {moyenne > 0 ? `★ ${moyenne.toFixed(1)}/5` : "☆ Pas encore noté"} ·{" "}
            {nbAvis}
          </span>
        </div>

        <div className="menu-actions">
          <button type="button" onClick={() => setAfficherAvis(!afficherAvis)}>
            {afficherAvis ? "Masquer avis" : "Avis du plat"}
          </button>
          <button
            type="button"
            onClick={() => setAfficherFormulaire(!afficherFormulaire)}
            style={{ background: "#c9a24b" }}
          >
            {afficherFormulaire ? "Fermer" : "★ Noter"}
          </button>
        </div>

        {afficherFormulaire && (
          <div className="menu-review-form">
            <FormulaireAvisPlat
              platId={plat.id}
              token={token}
              onSuccess={() => {
                setAfficherFormulaire(false);
                chargerAvis();
                onAvisAjoute();
              }}
              onCancel={() => setAfficherFormulaire(false)}
            />
          </div>
        )}

        {afficherAvis && (
          <div className="menu-review-box">
            {nbAvis === 0 ? (
              <p className="empty-state">Aucun avis pour ce plat.</p>
            ) : (
              avisData.avis.map((a) => (
                <div key={a.id} className="menu-review-item">
                  <div className="menu-stars">
                    {"★".repeat(Number(a.note || 0))}
                    {"☆".repeat(Math.max(0, 5 - Number(a.note || 0)))}
                  </div>
                  <strong>{a.client || "Client"}</strong> · {a.date || "-"}
                  {a.commentaire && <div>{a.commentaire}</div>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function SectionMenu({ token }) {
  const [plats, setPlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categorieActive, setCategorieActive] = useState("Tous");

  const charger = () => {
    setLoading(true);
    apiFetch(`${API_URL}/plats`)
      .then((res) => res.json())
      .then((data) => setPlats(Array.isArray(data) ? data : []))
      .catch(() => {
        setError("Impossible de charger le menu");
        toast("Impossible de charger le menu", "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
  }, []);

  const platsAvecCategorie = plats.map((plat) => ({
    ...plat,
    categorieVoilier: categorieVoilier(plat.categorie),
  }));

  const categories = ["Tous", ...CATEGORIES_MENU_VOILIER];

  const platsFiltres =
    categorieActive === "Tous"
      ? platsAvecCategorie
      : platsAvecCategorie.filter(
          (p) => p.categorieVoilier === categorieActive
        );

  const categoriesAffichees =
    categorieActive === "Tous" ? CATEGORIES_MENU_VOILIER : [categorieActive];

  return (
    <>
      <div className="menu-hero">
        <div className="menu-hero-row">
          <div>
            <h1>LE VOILIER</h1>
            <p>Découvrez notre carte et nos spécialités</p>
            <div className="menu-count">
              {`${plats.length} ${plats.length > 1 ? "plats" : "plat"} ${
                plats.length > 1 ? "disponibles" : "disponible"
              }`}
            </div>
          </div>
        </div>
      </div>

      <div className="main-card" style={{ padding: 0, maxWidth: "1100px" }}>
        {error && <p className="error">{error}</p>}

        <div className="menu-filters">
          <strong style={{ color: "#6f6254", fontSize: "12px" }}>
            CATÉGORIES :
          </strong>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`menu-filter ${
                categorieActive === cat ? "active" : ""
              }`}
              onClick={() => setCategorieActive(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="menu-paper">
          {loading ? (
            <MenuListSkeleton count={4} />
          ) : platsFiltres.length === 0 ? (
            <EmptyState
              title="Aucun plat"
              subtitle="Aucun plat dans cette catégorie."
            />
          ) : (
            categoriesAffichees.map((categorie) => {
              const platsCategorie = platsFiltres.filter(
                (plat) => plat.categorieVoilier === categorie
              );

              if (platsCategorie.length === 0) return null;

              return (
                <section className="menu-section" key={categorie}>
                  <h2 className="menu-section-title">{categorie}</h2>
                  <div className="menu-list">
                    {platsCategorie.map((plat) => (
                      <CartePlat
                        key={plat.id}
                        plat={plat}
                        token={token}
                        onAvisAjoute={() =>
                          toast("Merci pour votre avis !", "success")
                        }
                      />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

/* ================== RÉCLAMATIONS (CLIENT) ================== */
function FormulaireReclamation({ token, reservations, onSuccess }) {
  const [reservationId, setReservationId] = useState("");
  const [sujet, setSujet] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await apiFetch(`${API_URL}/reclamations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reservationId: parseInt(reservationId),
          sujet,
          description,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de l'envoi");
      setSujet("");
      setDescription("");
      setReservationId("");
      toast("Réclamation envoyée avec succès.", "success");
      onSuccess();
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (reservations.length === 0) {
    return (
      <EmptyState
        title="Aucune réservation"
        subtitle="Vous devez avoir une réservation pour déposer une réclamation."
      />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="field-label">Réservation concernée</label>
      <select
        value={reservationId}
        onChange={(e) => setReservationId(e.target.value)}
        required
      >
        <option value="">-- Choisir une réservation --</option>
        {reservations.map((r) => (
          <option key={r.id} value={r.id}>
            Table {r.table} — {r.date} {r.heure}
          </option>
        ))}
      </select>

      <label className="field-label">Sujet</label>
      <input
        type="text"
        value={sujet}
        onChange={(e) => setSujet(e.target.value)}
        placeholder="Ex : Retard important"
        required
      />

      <label className="field-label">Description</label>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Décrivez le problème..."
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Envoi..." : "Envoyer la réclamation"}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

function SectionReclamationsClient({ token }) {
  const [reclamations, setReclamations] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const charger = () => {
    setLoading(true);
    Promise.all([
      apiFetch(`${API_URL}/reclamations/mes-reclamations`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setReclamations(Array.isArray(data) ? data : []))
        .catch(() => setError("Impossible de charger vos réclamations")),
      apiFetch(`${API_URL}/reservations/mes-reservations`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) =>
          setReservations(
            Array.isArray(data)
              ? data.filter((r) => r.statut === "Confirmée")
              : []
          )
        )
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
  }, []);

  const handleSuccess = () => {
    charger();
  };

  return (
    <>
      <div className="main-header">
        <h1>Réclamations</h1>
        <p>Signalez un problème lié à une réservation</p>
      </div>

      <div className="main-card" style={{ marginBottom: "20px" }}>
        <h3>Nouvelle réclamation</h3>
        {loading ? (
          <ReservationsListSkeleton count={1} />
        ) : (
          <FormulaireReclamation
            token={token}
            reservations={reservations}
            onSuccess={handleSuccess}
          />
        )}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="main-card">
        <h3>Mes réclamations</h3>
        {loading ? (
          <ReservationsListSkeleton />
        ) : reclamations.length === 0 ? (
          <EmptyState
            title="Aucune réclamation"
            subtitle="Vous n'avez envoyé aucune réclamation."
          />
        ) : (
          reclamations.map((r) => (
            <div key={r.id} className="reservation-item">
              <div className="row">
                <strong>{r.sujet}</strong>
                <span
                  className={`badge-statut ${
                    r.statut === "Résolue" ? "confirmee" : "annulee"
                  }`}
                >
                  {r.statut}
                </span>
              </div>
              <p>{r.description}</p>
              <p>{r.date}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function SectionParametresClient({ payload, onLogout }) {
  return (
    <>
      <div className="main-header">
        <h1>Paramètres</h1>
        <p>Informations de votre compte</p>
      </div>
      <div className="main-card">
        <div className="settings-row">
          <span>Email</span>
          <strong>{payload?.username || "-"}</strong>
        </div>
        <div className="settings-row">
          <span>Rôle</span>
          <strong>Client</strong>
        </div>
        <div className="settings-row">
          <span>Restaurant</span>
          <strong>Le Voilier — Hôtel El Mehdi</strong>
        </div>
        <div style={{ marginTop: "20px" }}>
          <button className="danger" onClick={onLogout}>
            Se déconnecter
          </button>
        </div>
      </div>
    </>
  );
}

function getLanguage() {
  return localStorage.getItem("voilier_lang") || "fr";
}

export function LanguageSwitcher() {
  const [lang, setLang] = useState(getLanguage());
  const setLanguage = (l) => {
    localStorage.setItem("voilier_lang", l);
    setLang(l);
    window.location.reload();
  };
  return (
    <div className="language-switcher" title="Langue / Language / اللغة">
      <span className="language-icon">🌐</span>
      {[
        ["fr", "FR"],
        ["en", "EN"],
        ["ar", "AR"],
      ].map(([code, label]) => (
        <button
          key={code}
          type="button"
          className={lang === code ? "active" : ""}
          onClick={() => setLanguage(code)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function decodeJWTPayload(token) {
  return decodeJWT(token);
}

function ReservationPage({ token, onLogout }) {
  const [section, setSection] = useState("reserver");
  const [refreshKey, setRefreshKey] = useState(0);
  const [theme, setTheme] = useTheme();
  const [showMore, setShowMore] = useState(false);
  const payload = decodeJWT(token);

  const navItems = [
    { key: "reserver", icon: "🪑", label: "Ma table" },
    { key: "mes", icon: "📋", label: "Mes réservations" },
    { key: "menu", icon: "🍴", label: "Menu" },
    { key: "reclamations", icon: "📩", label: "Réclamations" },
    { key: "parametres", icon: "⚙️", label: "Paramètres" },
  ];

  return (
    <div className="shell client-shell">
      <div className="sidebar">
        <button className="sidebar-logo" onClick={() => setSection("reserver")}>
          <img src="logo.png" alt="El Mehdi" />
          <h2>Le Voilier</h2>
        </button>
        <div className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={section === item.key ? "active" : ""}
              data-tooltip={item.label}
              onClick={() => setSection(item.key)}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-footer-wrap">
          <button
            type="button"
            className="more-trigger"
            onClick={() => setShowMore((v) => !v)}
            aria-label="Plus d'options"
          >
            <span className="icon">⋯</span>
          </button>
          {showMore && (
            <div
              className="mobile-backdrop"
              onClick={() => setShowMore(false)}
            />
          )}
          <div className={"sidebar-footer" + (showMore ? " open" : "")}>
            <LanguageSwitcher />
            <button
              className="theme-toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={theme === "dark" ? "Mode clair" : "Mode sombre"}
            >
              <span className="icon">{theme === "dark" ? "☀️" : "🌙"}</span>
              <span className="footer-label">
                {theme === "dark" ? "Mode clair" : "Mode sombre"}
              </span>
            </button>
            <button
              onClick={() => {
                setShowMore(false);
                onLogout();
              }}
            >
              <span className="icon">🚪</span>
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      <div className="main-content">
        {section === "reserver" && (
          <SectionReserver
            token={token}
            onDone={() => setRefreshKey((k) => k + 1)}
          />
        )}
        {section === "mes" && (
          <SectionMesReservations token={token} refreshKey={refreshKey} />
        )}
        {section === "menu" && <SectionMenu token={token} />}
        {section === "reclamations" && (
          <SectionReclamationsClient token={token} />
        )}
        {section === "parametres" && (
          <SectionParametresClient payload={payload} onLogout={onLogout} />
        )}
      </div>
    </div>
  );
}

export const CATEGORIES_MENU_VOILIER = [
  "LES SALADES DU VOILIER",
  "LES ENTRÉES CHAUDES",
  "LES SPÉCIALITÉS EN PLAT",
  "LES PLATS",
  "LES PIZZAS",
  "LES DESSERTS",
  "EAU MINÉRALE",
  "SIROPS",
  "SODAS",
  "BOISSONS ÉNERGÉTIQUES",
];

export function categorieVoilier(categorie) {
  const c = (categorie || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (c.includes("salad")) return "LES SALADES DU VOILIER";
  if (c.includes("entree") || c.includes("entrée"))
    return "LES ENTRÉES CHAUDES";
  if (c.includes("special") || c.includes("spécial"))
    return "LES SPÉCIALITÉS EN PLAT";
  if (c === "plat" || c === "plats" || c.includes("plat principal"))
    return "LES PLATS";
  if (c.includes("pizza")) return "LES PIZZAS";
  if (c.includes("dessert")) return "LES DESSERTS";
  if (c.includes("eau") || c.includes("mineral")) return "EAU MINÉRALE";
  if (c.includes("sirop")) return "SIROPS";
  if (c.includes("soda")) return "SODAS";
  if (c.includes("boisson energetique") || c.includes("energetique"))
    return "BOISSONS ÉNERGÉTIQUES";
  return categorie || "LES PLATS";
}
function QRCodeClient() {
  const loginUrl =
    "https://restaurantvoilier-frontend.frajaya629.workers.dev/?page=login";

  return (
    <div className="qr-client-content">
      <div className="qr-image-box">
        <QRCodeSVG value={loginUrl} size={200} level="H" includeMargin={true} />
      </div>

      <small>Scannez avec votre téléphone</small>
    </div>
  );
}

function PublicRestaurantPage({ onGoToAdminLogin }) {
  return (
    <div className="public-home">
      <div className="public-home-header">
        <h1>LE VOILIER</h1>
        <p>HÔTEL EL MEHDI</p>
      </div>

      <div className="client-access-card">
        <div className="client-icon">📱</div>
        <h2>Accès Client</h2>
        <p>Scannez le QR Code pour accéder rapidement à votre espace client.</p>
        <QRCodeClient />
        <div className="qr-only-note">
          Accès client disponible uniquement via le QR Code
        </div>
      </div>

      <div className="mobile-only-note">
        <div className="client-icon">📱</div>
        <h2>Accès Client</h2>
        <p>
          Le QR Code s'affiche sur l'écran d'accueil du restaurant. Scannez-le
          avec ce téléphone pour accéder à votre espace.
        </p>
      </div>

      <button
        type="button"
        className="admin-access-btn"
        onClick={onGoToAdminLogin}
      >
        🔐 Accès Administrateur
      </button>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem(ACCESS_TOKEN_KEY));

  const [view, setView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get("page");

    if (page === "admin-login") return "admin-login";
    if (page === "login") return "login";
    if (page === "register") return "register";
    return "public";
  });

  const [registerMessage, setRegisterMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("voilier_theme") || "light";
    document.body.setAttribute("data-theme", saved);

    const checkSession = () => {
      const current = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (current && tokenExpired(current)) {
        tryRefreshToken().then((fresh) => {
          if (!fresh) {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            setToken(null);
            setView("login");
            window.history.replaceState(
              {},
              "",
              window.location.pathname + "?page=login"
            );
            toast("Session expirée. Veuillez vous reconnecter.", "error");
          }
        });
      }
    };

    const onExpired = () => {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setToken(null);
      setView("login");
      window.history.replaceState(
        {},
        "",
        window.location.pathname + "?page=login"
      );
      toast("Session expirée. Veuillez vous reconnecter.", "error");
    };

    const onRefreshed = (e) => setToken(e.detail);

    const onPageShow = (e) => {
      if (e.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", onPageShow);

    window.addEventListener("voilier-session-expired", onExpired);
    window.addEventListener("voilier-token-refreshed", onRefreshed);
    const timer = setInterval(checkSession, 15000);
    checkSession();

    return () => {
      clearInterval(timer);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("voilier-session-expired", onExpired);
      window.removeEventListener("voilier-token-refreshed", onRefreshed);
    };
  }, []);

  const goToPage = (page) => {
    window.history.replaceState(
      {},
      "",
      window.location.pathname + "?page=" + page
    );
    setView(page);
  };

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.location.replace(window.location.pathname);
  };

  const handleRegisterSuccess = (email) => {
    setRegisterMessage(
      `Compte créé pour ${email} ! Vous pouvez vous connecter.`
    );
    goToPage("login");
  };

  let content;

  if (!token) {
    if (view === "public") {
      content = (
        <PublicRestaurantPage
          onGoToAdminLogin={() => goToPage("admin-login")}
        />
      );
    } else if (view === "register") {
      content = (
        <RegisterPage
          onRegisterSuccess={handleRegisterSuccess}
          onGoToLogin={() => goToPage("login")}
        />
      );
    } else if (view === "admin-login") {
      content = (
        <LoginPage
          adminOnly
          onLoginSuccess={setToken}
          onGoToHome={() => goToPage("public")}
        />
      );
    } else {
      content = (
        <>
          <LoginPage
            onLoginSuccess={setToken}
            onGoToHome={() => goToPage("public")}
            onGoToRegister={() => {
              setRegisterMessage("");
              goToPage("register");
            }}
          />
          {registerMessage && (
            <p
              className="success"
              style={{ maxWidth: "420px", margin: "-20px auto 0" }}
            >
              {registerMessage}
            </p>
          )}
        </>
      );
    }
  } else {
    const payload = decodeJWT(token);
    const isAdmin =
      payload && payload.roles && payload.roles.includes("ROLE_ADMIN");

    content = isAdmin ? (
      <AdminPage token={token} onLogout={handleLogout} />
    ) : (
      <ReservationPage token={token} onLogout={handleLogout} />
    );
  }

  return (
    <>
      <ToastStack />
      <ConfirmModal />
      {content}
    </>
  );
}

export default App;
