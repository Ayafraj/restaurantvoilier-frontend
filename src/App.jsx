import React, { useState, useEffect } from "react";
import "./style.css";
import AdminPage from "./AdminPage";
import { QRCodeSVG } from "qrcode.react";
import {
  useTranslation,
  setLanguage as setGlobalLanguage,
  getLanguage,
} from "./useTranslation";
import { translateStatus, translateCategoryName } from "./translations";

/* ============================================================
 * 1) CONFIGURATION — URLs de production (backend Symfony / Railway)
 * ============================================================ */
export const API_URL =
  "https://restaurantvoilier-production-3c05.up.railway.app/api";
export const ASSETS_URL =
  "https://restaurantvoilier-production-3c05.up.railway.app";

const ACCESS_TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const TOKEN_REFRESH_SKEW_SECONDS = 45;

/* ============================================================
 * 2) UTILITAIRES — JWT / mots de passe / email / headers
 * ============================================================ */
export function readJWT(token) {
  try {
    if (!token) return null;
    const part = token.split(".")[1];
    return JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function decodeJWT(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
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

export function passwordStrength(password, t) {
  const score = passwordScore(password);
  const labels = [
    t("veryWeak"),
    t("weak"),
    t("medium"),
    t("good"),
    t("strong"),
    t("veryStrong"),
  ];
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

/* ============================================================
 * 3) COUCHE RÉSEAU — fetch brut + refresh automatique du token
 * ============================================================ */
window.__rawFetch = window.fetch.bind(window);

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
    if (data.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }

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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  opts.signal = opts.signal || controller.signal;

  try {
    const response = await window.__rawFetch(input, opts);

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
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(
        "Le serveur a mis du temps à répondre. Vérifiez la liste avant de renvoyer — votre demande a peut-être bien été enregistrée."
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/* ============================================================
 * 4) THÈME / COULEURS DES GRAPHIQUES
 * ============================================================ */
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

/* ============================================================
 * 5) TOASTS (notifications)
 * ============================================================ */
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

/* ============================================================
 * 6) MODALE DE CONFIRMATION
 * ============================================================ */
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
  const { t } = useTranslation();
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
          <span>{state.title || t("confirmAction")}</span>
        </h3>
        <p>{state.message}</p>
        <div className="modal-actions">
          <button
            className="danger"
            onClick={() => close(false)}
            style={{ background: "transparent" }}
          >
            {t("cancel")}
          </button>
          <button
            onClick={() => close(true)}
            style={{
              background:
                state.tone === "danger" ? "#c1584c" : "var(--navy-grad)",
            }}
          >
            {state.confirmLabel || t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * 7) COMPOSANTS UI GÉNÉRIQUES RÉUTILISABLES
 * ============================================================ */

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

/* --- Skeletons (états de chargement) --- */
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

/* --- Graphiques --- */
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

/* --- Hooks & helpers divers --- */
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function PaginationControls({ page, totalPages, onPageChange }) {
  const { t } = useTranslation();
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
        {t("page")} {page} {t("of")} {totalPages}
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

/* ============================================================
 * 8) AUTHENTIFICATION — Login / Register
 * ============================================================ */
function LoginPage({
  onLoginSuccess,
  onGoToRegister,
  onGoToHome,
  adminOnly = false,
}) {
  const { t } = useTranslation();
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
      setError(t("invalidEmail"));
      return;
    }
    if (!motDePasse) {
      setError(t("passwordRequired"));
      return;
    }

    setLoading(true);
    try {
      const loginEndpoint = adminOnly
        ? `${API_URL}/admin/login`
        : `${API_URL}/login`;

      const response = await apiFetch(loginEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, motDePasse }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || t("invalidCredentials"));
      }
      if (!data.token) {
        throw new Error("Token de connexion manquant.");
      }

      localStorage.setItem(ACCESS_TOKEN_KEY, data.token);
      if (data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      }

      localStorage.setItem("voilier_login_attempts", "0");
      localStorage.removeItem("voilier_login_locked_until");
      setFailedAttempts(0);
      setLockedUntil(0);

      toast(t("loginSuccess"), "success");
      onLoginSuccess(data.token);
    } catch (err) {
      const message = err?.message || t("error");
      const nextAttempts = failedAttempts + 1;

      if (nextAttempts >= 5) {
        const until = Date.now() + 30000;
        localStorage.setItem("voilier_login_locked_until", String(until));
        localStorage.setItem("voilier_login_attempts", "0");
        setLockedUntil(until);
        setFailedAttempts(0);

        const lockMessage =
          "Trop de tentatives. Connexion temporairement bloquée 30 secondes.";
        setError(lockMessage);
        toast(lockMessage, "error");
      } else {
        localStorage.setItem("voilier_login_attempts", String(nextAttempts));
        setFailedAttempts(nextAttempts);
        setError(message);
        toast(message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-pad">
      <div className="container">
        <div className="logo">
          <img src="logo.png" alt="El Mehdi" className="logo-img" />
          <h1>{t("appName")}</h1>
          <div className="subtitle">{t("hotelName")}</div>
        </div>

        <h2 className="section-title">
          {adminOnly ? t("adminLogin") : t("login")}
        </h2>

        <form onSubmit={handleSubmit}>
          <label className="field-label">{t("email")}</label>
          <input
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <label className="field-label">{t("password")}</label>
          <PasswordInput
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? t("loggingIn") : t("loginButton")}
          </button>

          {error && <p className="error">{error}</p>}
        </form>

        {!adminOnly && onGoToRegister && (
          <p className="link-switch">
            {t("noAccount")}{" "}
            <a onClick={onGoToRegister}>{t("createAccount")}</a>
          </p>
        )}

        {onGoToHome && (
          <p className="link-switch back-home-link">
            <a onClick={onGoToHome}>{t("backHome")}</a>
          </p>
        )}
      </div>
    </div>
  );
}

function RegisterPage({ onRegisterSuccess, onGoToLogin }) {
  const { t } = useTranslation();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const forceMotDePasse = passwordStrength(motDePasse, t);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validEmail(email)) {
      setError(t("invalidEmail"));
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

      toast(t("accountCreated"), "success");
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
          <h1>{t("appName")}</h1>
          <div className="subtitle">{t("hotelName")}</div>
        </div>

        <h2 className="section-title">{t("createAccount")}</h2>

        <form onSubmit={handleSubmit}>
          <div className="row-2">
            <div>
              <label className="field-label">{t("lastName")}</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="field-label">{t("firstName")}</label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
              />
            </div>
          </div>

          <label className="field-label">{t("email")}</label>
          <input
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="field-label">{t("phone")}</label>
          <input
            type="tel"
            placeholder={t("optional")}
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
          />

          <label className="field-label">{t("password")}</label>
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
              <span>
                {t("passwordStrength")} : {forceMotDePasse.label}
              </span>
              <span>8+ · Aa · 0-9 · !@#</span>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? t("creating") : t("createMyAccount")}
          </button>

          {error && <p className="error">{error}</p>}
        </form>

        <p className="link-switch">
          {t("alreadyAccount")} <a onClick={onGoToLogin}>{t("login")}</a>
        </p>
      </div>
    </div>
  );
}

/* ============================================================
 * 9) ESPACE CLIENT — Réservation d'une table
 * ============================================================ */
function ChoixTable({ tables, onSelect, loading }) {
  const { t, lang } = useTranslation();
  const [filtreCapacite, setFiltreCapacite] = useState("tous");

  if (loading) {
    return (
      <>
        <h3>{t("chooseTable")}</h3>
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
      : tables.filter((tb) => tb.capacite === Number(filtreCapacite));

  return (
    <>
      <h3>{t("chooseTable")}</h3>

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
            {t("all")} ({tables.length})
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
              {cap} {t("people")}
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
            <strong>
              {t("table")} {table.numero}
            </strong>
            <p>{`${table.capacite} ${t("people")}`}</p>
            <small>{translateStatus(table.statut, lang)}</small>
          </div>
        ))}
      </div>

      {tablesAffichees.length === 0 && (
        <EmptyState title={t("noTable")} subtitle={t("noTableCapacity")} />
      )}
    </>
  );
}

function FormulaireReservation({ table, token, onRetour, onSuccess }) {
  const { t } = useTranslation();
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
      if (!response.ok) throw new Error(data.error || t("reservationError"));

      toast(t("reservationConfirmed"), "success");
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
      <h3>{t("reservationDetails")}</h3>
      <div className="selected-badge">
        <div>
          <strong>
            {t("table")} {table.numero}
          </strong>
          <br />
          <span>
            {table.capacite} {t("maxPeople")}
          </span>
        </div>
        <button onClick={onRetour}>{t("change")}</button>
      </div>

      <form onSubmit={handleReserver}>
        <label className="field-label">{t("date")}</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <label className="field-label">{t("time")}</label>
        <input
          type="time"
          value={heure}
          onChange={(e) => setHeure(e.target.value)}
          required
        />
        <label className="field-label">{t("numberOfPeople")}</label>
        <input
          type="number"
          min="1"
          max={table.capacite}
          value={nombrePersonnes}
          onChange={(e) => setNombrePersonnes(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? t("confirming") : t("confirmReservation")}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </>
  );
}

function SectionReserver({ token, onDone }) {
  const { t } = useTranslation();
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
        setError(t("impossibleLoad"));
        toast(t("impossibleLoad"), "error");
      })
      .finally(() => setTablesLoading(false));
  };

  useEffect(() => {
    chargerTables();
  }, []);

  const handleSuccess = () => {
    setSelectedTable(null);
    chargerTables();
    onDone();
  };

  return (
    <>
      <div className="main-header">
        <h1>{t("reserveTable")}</h1>
        <p>{t("chooseTable")}</p>
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

/* ============================================================
 * 10) ESPACE CLIENT — Mes réservations
 * ============================================================ */
function SectionMesReservations({ token, refreshKey }) {
  const { t, lang } = useTranslation();
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
        setError(t("impossibleLoad"));
        toast(t("impossibleLoad"), "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
  }, [refreshKey]);

  const handleAnnuler = async (id) => {
    const ok = await askConfirm({
      title: t("cancelReservation"),
      message: t("cancelReservationQuestion"),
      confirmLabel: t("cancelReservation"),
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
      if (!response.ok) throw new Error(data.error || t("error"));

      toast(t("reservationCancelled"), "success");
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
        <h1>{t("myReservations")}</h1>
        <p>{t("reservationHistory")}</p>
      </div>
      <div className="main-card">
        {error && <p className="error">{error}</p>}

        <div className="filter-grid">
          <div>
            <label className="field-label">{t("date")}</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">{t("filters")}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Tous">{t("allStatuses")}</option>
              <option value="Confirmée">{t("confirmed")}</option>
              <option value="Annulée">{t("cancelled")}</option>
            </select>
          </div>
          <div>
            <label className="field-label">{t("search")}</label>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
            />
          </div>
        </div>

        {loading ? (
          <ReservationsListSkeleton />
        ) : reservations.length === 0 ? (
          <EmptyState
            title={t("noReservations")}
            subtitle={t("noReservationsText")}
          />
        ) : (
          reservationsFiltrees.map((r) => (
            <div key={r.id} className="reservation-item">
              <div className="row">
                <strong>
                  {t("table")} {r.table} — {r.date}
                </strong>
                <span
                  className={`badge-statut ${
                    r.statut === "Confirmée" ? "confirmee" : "annulee"
                  }`}
                >
                  {translateStatus(r.statut, lang)}
                </span>
              </div>
              <p>
                {`${r.heure} · ${r.nombrePersonnes} ${
                  r.nombrePersonnes > 1 ? t("people") : t("person")
                }`}
              </p>
              {r.statut === "Confirmée" && (
                <button
                  className="danger"
                  onClick={() => handleAnnuler(r.id)}
                  disabled={loadingId === r.id}
                >
                  {loadingId === r.id ? t("cancelling") : t("cancel")}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}

/* ============================================================
 * 11) ESPACE CLIENT — Menu & avis sur les plats
 * ============================================================ */
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

function FormulaireAvisPlat({ platId, token, onSuccess, onCancel }) {
  const { t } = useTranslation();
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
      if (!response.ok) throw new Error(data.error || t("error"));

      toast(t("thankYouReview"), "success");
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
      <label className="field-label">{t("yourRating")}</label>
      <EtoilesInput note={note} onChange={setNote} />
      <label className="field-label">{t("optionalComment")}</label>
      <input
        type="text"
        value={commentaire}
        onChange={(e) => setCommentaire(e.target.value)}
        placeholder={t("yourDishReview")}
      />
      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
        <button type="submit" disabled={loading} style={{ margin: 0 }}>
          {loading ? t("sending") : t("sendReview")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="danger"
          style={{ margin: 0 }}
        >
          {t("cancel")}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

function CartePlat({ plat, token, onAvisAjoute }) {
  const { t, lang } = useTranslation();
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
          {disponible ? `✓ ${t("dishAvailable")}` : `✕ ${t("dishUnavailable")}`}
        </span>
      </div>

      <div className="menu-body">
        <div className="menu-cat">
          {translateCategoryName(categorieVoilier(plat.categorie), lang)}
        </div>
        <div className="menu-title-row">
          <h3 className="menu-title">{plat.nom}</h3>
        </div>
        <p className="menu-description">
          {plat.description || t("deliciousSpecialty")}
        </p>

        <div className="menu-price-row">
          <span className="menu-price">
            {plat.prix != null
              ? `${Number(plat.prix).toFixed(3)} DT`
              : t("priceOnRequest")}
          </span>
          <span className="menu-review-summary">
            {moyenne > 0 ? `★ ${moyenne.toFixed(1)}/5` : `☆ ${t("notRated")}`} ·{" "}
            {nbAvis}
          </span>
        </div>

        <div className="menu-actions">
          <button type="button" onClick={() => setAfficherAvis(!afficherAvis)}>
            {afficherAvis ? t("hideReviews") : t("dishReviews")}
          </button>
          <button
            type="button"
            onClick={() => setAfficherFormulaire(!afficherFormulaire)}
            style={{ background: "#c9a24b" }}
          >
            {afficherFormulaire ? t("close") : `★ ${t("rate")}`}
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
              <p className="empty-state">{t("noReviews")}</p>
            ) : (
              avisData.avis.map((a) => (
                <div key={a.id} className="menu-review-item">
                  <div className="menu-stars">
                    {"★".repeat(Number(a.note || 0))}
                    {"☆".repeat(Math.max(0, 5 - Number(a.note || 0)))}
                  </div>
                  <strong>{a.client || t("client")}</strong> · {a.date || "-"}
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
  const { t, lang } = useTranslation();
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
        setError(t("impossibleLoad"));
        toast(t("impossibleLoad"), "error");
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
            <h1>{t("appName").toUpperCase()}</h1>
            <p>{t("discoverMenu")}</p>
            <div className="menu-count">
              {`${plats.length} ${
                plats.length > 1 ? t("availableDishes") : t("availableDish")
              }`}
            </div>
          </div>
        </div>
      </div>

      <div className="main-card" style={{ padding: 0, maxWidth: "1100px" }}>
        {error && <p className="error">{error}</p>}

        <div className="menu-filters">
          <strong style={{ color: "#6f6254", fontSize: "12px" }}>
            {t("categories").toUpperCase()} :
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
              {cat === "Tous" ? t("catAll") : translateCategoryName(cat, lang)}
            </button>
          ))}
        </div>

        <div className="menu-paper">
          {loading ? (
            <MenuListSkeleton count={4} />
          ) : platsFiltres.length === 0 ? (
            <EmptyState
              title={t("noDishes")}
              subtitle={t("noDishesCategory")}
            />
          ) : (
            categoriesAffichees.map((categorie) => {
              const platsCategorie = platsFiltres.filter(
                (plat) => plat.categorieVoilier === categorie
              );
              if (platsCategorie.length === 0) return null;

              return (
                <section className="menu-section" key={categorie}>
                  <h2 className="menu-section-title">
                    {translateCategoryName(categorie, lang)}
                  </h2>
                  <div className="menu-list">
                    {platsCategorie.map((plat) => (
                      <CartePlat
                        key={plat.id}
                        plat={plat}
                        token={token}
                        onAvisAjoute={() =>
                          toast(t("thankYouReview"), "success")
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

/* ============================================================
 * 12) ESPACE CLIENT — Réclamations
 * ============================================================ */
function FormulaireReclamation({ token, reservations, onSuccess }) {
  const { t } = useTranslation();
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
      if (!response.ok) throw new Error(data.error || t("complaintError"));

      setSujet("");
      setDescription("");
      setReservationId("");
      toast(t("complaintSent"), "success");
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
        title={t("noReservations")}
        subtitle="Vous devez avoir une réservation pour déposer une réclamation."
      />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="field-label">{t("reservation")}</label>
      <select
        value={reservationId}
        onChange={(e) => setReservationId(e.target.value)}
        required
      >
        <option value="">-- {t("chooseTable")} --</option>
        {reservations.map((r) => (
          <option key={r.id} value={r.id}>
            {t("table")} {r.table} — {r.date} {r.heure}
          </option>
        ))}
      </select>

      <label className="field-label">{t("complaintSubject")}</label>
      <input
        type="text"
        value={sujet}
        onChange={(e) => setSujet(e.target.value)}
        placeholder={t("complaintSubjectPlaceholder")}
        required
      />

      <label className="field-label">{t("complaintDescription")}</label>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t("complaintDescriptionPlaceholder")}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? t("sendingComplaint") : t("sendComplaint")}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

function SectionReclamationsClient({ token }) {
  const { t, lang } = useTranslation();
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
        .catch(() => setError(t("impossibleLoad"))),
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

  return (
    <>
      <div className="main-header">
        <h1>{t("complaints")}</h1>
        <p>{t("reportProblem")}</p>
      </div>

      <div className="main-card" style={{ marginBottom: "20px" }}>
        <h3>{t("newComplaint")}</h3>
        {loading ? (
          <ReservationsListSkeleton count={1} />
        ) : (
          <FormulaireReclamation
            token={token}
            reservations={reservations}
            onSuccess={charger}
          />
        )}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="main-card">
        <h3>{t("myComplaints")}</h3>
        {loading ? (
          <ReservationsListSkeleton />
        ) : reclamations.length === 0 ? (
          <EmptyState
            title={t("noComplaints")}
            subtitle={t("noComplaintsText")}
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
                  {translateStatus(r.statut, lang)}
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

/* ============================================================
 * 13) ESPACE CLIENT — Paramètres du compte
 * ============================================================ */
function SectionParametresClient({ payload, onLogout }) {
  const { t } = useTranslation();
  return (
    <>
      <div className="main-header">
        <h1>{t("settingsTitle")}</h1>
        <p>{t("accountInformation")}</p>
      </div>
      <div className="main-card">
        <div className="settings-row">
          <span>{t("accountEmail")}</span>
          <strong>{payload?.username || "-"}</strong>
        </div>
        <div className="settings-row">
          <span>{t("accountRole")}</span>
          <strong>{t("client")}</strong>
        </div>
        <div className="settings-row">
          <span>{t("accountRestaurant")}</span>
          <strong>Le Voilier — Hôtel El Mehdi</strong>
        </div>
        <div style={{ marginTop: "20px" }}>
          <button className="danger" onClick={onLogout}>
            {t("logout")}
          </button>
        </div>
      </div>
    </>
  );
}

/* ============================================================
 * 14) I18N — Sélecteur de langue
 * ============================================================ */
export function LanguageSwitcher() {
  const { lang } = useTranslation();
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
          onClick={() => setGlobalLanguage(code)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
 * 15) SHELL CLIENT — Sidebar + routing des sections
 * ============================================================ */
function ReservationPage({ token, onLogout }) {
  const { t } = useTranslation();
  const [section, setSection] = useState("reserver");
  const [refreshKey, setRefreshKey] = useState(0);
  const [theme, setTheme] = useTheme();
  const [showMore, setShowMore] = useState(false);
  const payload = decodeJWT(token);

  const navItems = [
    { key: "reserver", icon: "🪑", label: t("myTable") },
    { key: "mes", icon: "📋", label: t("myReservations") },
    { key: "menu", icon: "🍴", label: t("menu") },
    { key: "reclamations", icon: "📩", label: t("complaints") },
    { key: "parametres", icon: "⚙️", label: t("settings") },
  ];

  return (
    <div className="shell client-shell">
      <div className="sidebar">
        <button className="sidebar-logo" onClick={() => setSection("reserver")}>
          <img src="logo.png" alt="El Mehdi" />
          <h2>{t("appName")}</h2>
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
              <span>{t("logout")}</span>
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

/* ============================================================
 * 16) PAGE PUBLIQUE — Accueil + QR code d'accès client
 * ============================================================ */
function QRCodeClient() {
  const { t } = useTranslation();
  const loginUrl =
    "https://restaurantvoilier-frontend.frajaya629.workers.dev/?page=login";

  return (
    <div className="qr-client-content">
      <div className="qr-image-box">
        <QRCodeSVG value={loginUrl} size={200} level="H" includeMargin={true} />
      </div>
      <small>{t("scanQr")}</small>
    </div>
  );
}

function PublicRestaurantPage({ onGoToAdminLogin }) {
  const { t } = useTranslation();
  return (
    <div className="public-home">
      <div className="public-home-header">
        <h1>{t("appName").toUpperCase()}</h1>
        <p>{t("hotelName")}</p>
      </div>

      <div className="client-access-card">
        <div className="client-icon">📱</div>
        <h2>{t("clientArea")}</h2>
        <p>{t("scanQrHint")}</p>
        <QRCodeClient />
        <div className="qr-only-note">{t("qrOnlyNote")}</div>
      </div>

      <div className="mobile-only-note">
        <div className="client-icon">📱</div>
        <h2>{t("clientArea")}</h2>
        <p>{t("mobileQrNote")}</p>
      </div>

      <button
        type="button"
        className="admin-access-btn"
        onClick={onGoToAdminLogin}
      >
        {t("adminAccessBtn")}
      </button>
    </div>
  );
}

/* ============================================================
 * 17) APP — Point d'entrée : routing + session
 * ============================================================ */
function App() {
  const { t } = useTranslation();
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
    const savedTheme = localStorage.getItem("voilier_theme") || "light";
    document.body.setAttribute("data-theme", savedTheme);
    document.body.classList.toggle("rtl", getLanguage() === "ar");

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
            toast(t("sessionExpired"), "error");
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
      toast(t("sessionExpired"), "error");
    };

    const onRefreshed = (e) => setToken(e.detail);

    const onPageShow = (e) => {
      if (e.persisted) window.location.reload();
    };

    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("voilier-session-expired", onExpired);
    window.addEventListener("voilier-token-refreshed", onRefreshed);
    const timer = setInterval(checkSession, 15000);
    checkSession();

    // Réveille le backend Railway dès le chargement de l'app (évite le cold start plus tard)
    window.__rawFetch(`${API_URL}/tables`).catch(() => {});

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
    setRegisterMessage(`${t("accountCreated")} (${email})`);
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
