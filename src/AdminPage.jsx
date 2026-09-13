import React, { useState, useEffect } from "react";
import {
  API_URL,
  apiFetch,
  toast,
  askConfirm,
  EmptyState,
  AdminGridSkeleton,
  ReservationsListSkeleton,
  BarChartStat,
  DonutChartStat,
  useDebouncedValue,
  PaginationControls,
  exportExcel,
  printPDF,
  colorForKey,
  useTheme,
  LanguageSwitcher,
  decodeJWT,
  categorieVoilier,
  CATEGORIES_MENU_VOILIER,
  urlImagePlat,
  imagePlatCategorie,
} from "./App";

/* ================== HELPERS BUSINESS HUB ================== */
function readLocalJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function writeLocalJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
async function safeJson(url, options = {}, fallback = []) {
  try {
    const r = await apiFetch(url, options);
    if (!r.ok) return fallback;
    return await r.json();
  } catch {
    return fallback;
  }
}
function formatDT(n) {
  return `${Number(n || 0).toFixed(3)} DT`;
}
function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function sameMonth(value, ref = new Date()) {
  if (!value) return false;
  const d = new Date(value);
  const r = startOfMonth(ref);
  return d.getFullYear() === r.getFullYear() && d.getMonth() === r.getMonth();
}
function ReservationDateValue(r) {
  return r?.date || r?.createdAt || r?.dateReservation || "";
}

/* ================== BUSINESS & ENGAGEMENT ================== */
function SectionBusinessHub({ token }) {
  const [reservations, setReservations] = useState([]);
  const [clients, setClients] = useState([]);
  const [plats, setPlats] = useState([]);
  const [promos, setPromos] = useState(() =>
    readLocalJSON("voilier_promos", [])
  );
  const [offers, setOffers] = useState(() =>
    readLocalJSON("voilier_offres", [])
  );
  const [avgBasket, setAvgBasket] = useState(() =>
    Number(localStorage.getItem("voilier_avg_basket") || 35)
  );
  const [promoCode, setPromoCode] = useState("");
  const [promoValue, setPromoValue] = useState(10);
  const [offerName, setOfferName] = useState("Menu du jour");
  const [offerDesc, setOfferDesc] = useState("Plat du jour + boisson");
  const [offerPrice, setOfferPrice] = useState(25);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [rs, cs, ps] = await Promise.all([
      safeJson(
        `${API_URL}/reservations`,
        { headers: { Authorization: `Bearer ${token}` } },
        []
      ),
      safeJson(
        `${API_URL}/clients`,
        { headers: { Authorization: `Bearer ${token}` } },
        []
      ),
      safeJson(`${API_URL}/plats`, {}, []),
    ]);
    setReservations(Array.isArray(rs) ? rs : rs?.reservations || []);
    setClients(Array.isArray(cs) ? cs : cs?.clients || []);
    setPlats(Array.isArray(ps) ? ps : []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const activeReservations = reservations.filter(
    (r) => !["Annulée", "Annulee", "cancelled"].includes(r.statut)
  );
  const noShows = reservations.filter((r) =>
    ["No-show", "No Show", "Absent"].includes(r.statut)
  );
  const cancellations = reservations.filter((r) =>
    ["Annulée", "Annulee", "cancelled"].includes(r.statut)
  );
  const cancellationRate = reservations.length
    ? Math.round((cancellations.length / reservations.length) * 100)
    : 0;
  const people = activeReservations.reduce(
    (a, r) => a + Number(r.nombrePersonnes || 0),
    0
  );
  const estimatedRevenue = people * Number(avgBasket || 0);
  const monthNow = reservations.filter((r) =>
    sameMonth(ReservationDateValue(r))
  ).length;
  const lastMonthRef = new Date();
  lastMonthRef.setMonth(lastMonthRef.getMonth() - 1);
  const monthPrev = reservations.filter((r) =>
    sameMonth(ReservationDateValue(r), lastMonthRef)
  ).length;
  const delta = monthPrev
    ? Math.round(((monthNow - monthPrev) / monthPrev) * 100)
    : monthNow
    ? 100
    : 0;

  const hourMap = {};
  activeReservations.forEach((r) => {
    const h = String(r.heure || "").slice(0, 2);
    if (h) hourMap[h] = (hourMap[h] || 0) + 1;
  });
  const peak = Object.entries(hourMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const dishScores = plats
    .map((p) => ({
      name: p.nom,
      score: Number(p.commandes || p.nombreCommandes || p.ventes || 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const clientSeg = clients.map((c) => {
    const id = c.id ?? c.clientId;
    const rs = reservations.filter(
      (r) => String(r.clientId ?? r.client?.id ?? "") === String(id)
    );
    return { ...c, visits: rs.length };
  });
  const vip = clientSeg.filter((c) => c.visits >= 10).length,
    regular = clientSeg.filter((c) => c.visits >= 3 && c.visits < 10).length,
    newClients = clientSeg.filter((c) => c.visits <= 1).length;

  const addPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    const next = [
      ...promos,
      { id: Date.now(), code, value: Number(promoValue), active: true },
    ];
    setPromos(next);
    writeLocalJSON("voilier_promos", next);
    setPromoCode("");
    toast("Code promo créé", "success");
  };
  const togglePromo = (id) => {
    const next = promos.map((p) =>
      p.id === id ? { ...p, active: !p.active } : p
    );
    setPromos(next);
    writeLocalJSON("voilier_promos", next);
  };
  const addOffer = () => {
    if (!offerName.trim()) return;
    const next = [
      ...offers,
      {
        id: Date.now(),
        name: offerName,
        description: offerDesc,
        price: Number(offerPrice),
        active: true,
      },
    ];
    setOffers(next);
    writeLocalJSON("voilier_offres", next);
    toast("Offre ajoutée au menu du jour", "success");
  };
  const saveBasket = () => {
    localStorage.setItem("voilier_avg_basket", String(avgBasket));
    toast("Panier moyen enregistré", "success");
  };

  return (
    <>
      <div className="main-header">
        <h1>Business & Engagement</h1>
        <p>Fidélisation, promotions, segmentation et pilotage commercial</p>
      </div>
      <div className="bi-grid">
        <div className="bi-card">
          <h3>💰 Revenu estimé</h3>
          <div className="bi-value">{formatDT(estimatedRevenue)}</div>
          <div className="bi-muted">personnes réservées × panier moyen</div>
        </div>
        <div className="bi-card">
          <h3>📉 Taux d'annulation</h3>
          <div className="bi-value">{cancellationRate}%</div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${cancellationRate}%` }}
            />
          </div>
        </div>
        <div className="bi-card">
          <h3>📅 Ce mois</h3>
          <div className="bi-value">{monthNow}</div>
          <div className="bi-muted">
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs mois précédent
          </div>
        </div>
        <div className="bi-card">
          <h3>👥 Segmentation</h3>
          <div className="bi-muted">
            VIP {vip} · Réguliers {regular} · Nouveaux {newClients}
          </div>
        </div>
      </div>
      <div className="bi-grid">
        <div className="main-card">
          <h2>🎯 Panier moyen</h2>
          <p className="bi-muted">Utilisé uniquement pour l'estimation BI.</p>
          <div className="form-group">
            <label>Montant moyen par personne (DT)</label>
            <input
              type="number"
              min="0"
              value={avgBasket}
              onChange={(e) => setAvgBasket(e.target.value)}
            />
          </div>
          <button onClick={saveBasket}>Enregistrer</button>
        </div>
        <div className="main-card">
          <h2>⏰ Heures de pointe</h2>
          {peak.length ? (
            peak.map(([h, n]) => (
              <div className="bi-row" key={h}>
                <span>{h}h</span>
                <strong>{n} réservation(s)</strong>
              </div>
            ))
          ) : (
            <p className="bi-muted">Pas assez de données horaires.</p>
          )}
        </div>
        <div className="main-card">
          <h2>🍴 Plats populaires</h2>
          {dishScores.length ? (
            dishScores.map((p, i) => (
              <div className="bi-row" key={p.name}>
                <span>
                  #{i + 1} {p.name}
                </span>
                <strong>{p.score}</strong>
              </div>
            ))
          ) : (
            <p className="bi-muted">
              L'API doit fournir commandes/ventes pour ce classement.
            </p>
          )}
        </div>
      </div>
      <div className="main-card">
        <h2>🎁 Codes promo</h2>
        <div className="filter-grid">
          <input
            placeholder="Ex: ANNIV10"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
          <input
            type="number"
            min="1"
            max="100"
            value={promoValue}
            onChange={(e) => setPromoValue(e.target.value)}
          />
          <button onClick={addPromo}>＋ Créer</button>
        </div>
        {promos.map((p) => (
          <div className="bi-row" key={p.id}>
            <span className="promo-code">{p.code}</span>
            <span>
              {p.value}% ·{" "}
              <span className="tag">{p.active ? "Actif" : "Désactivé"}</span>
            </span>
            <button onClick={() => togglePromo(p.id)}>
              {p.active ? "Désactiver" : "Activer"}
            </button>
          </div>
        ))}
      </div>
      <div className="main-card">
        <h2>☀️ Menu du jour / offres spéciales</h2>
        <div className="filter-grid">
          <input
            value={offerName}
            onChange={(e) => setOfferName(e.target.value)}
            placeholder="Nom de l'offre"
          />
          <input
            value={offerDesc}
            onChange={(e) => setOfferDesc(e.target.value)}
            placeholder="Description"
          />
          <input
            type="number"
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
            placeholder="Prix DT"
          />
          <button onClick={addOffer}>＋ Ajouter</button>
        </div>
        {offers.map((o) => (
          <div className="bi-row" key={o.id}>
            <span>
              <strong>{o.name}</strong> — {o.description}
            </span>
            <span>{formatDT(o.price)}</span>
          </div>
        ))}
      </div>
      <div className="main-card">
        <h2>🧩 Segmentation clients</h2>
        <div className="feature-list">
          <div className="feature-item">
            <strong>👑 VIP</strong>
            {vip} client(s)
            <div className="bi-muted">10+ visites</div>
          </div>
          <div className="feature-item">
            <strong>💚 Réguliers</strong>
            {regular} client(s)
            <div className="bi-muted">3 à 9 visites</div>
          </div>
          <div className="feature-item">
            <strong>🆕 Nouveaux</strong>
            {newClients} client(s)
            <div className="bi-muted">0 à 1 visite</div>
          </div>
          <div className="feature-item">
            <strong>🚨 No-show</strong>
            {noShows.length}
            <div className="bi-muted">
              Prévoir relances / liste noire côté serveur
            </div>
          </div>
        </div>
      </div>
      {loading && <p className="bi-muted">Chargement des données business…</p>}
    </>
  );
}

/* ================== STATISTIQUES ================== */
function SectionStatistiques({ stats }) {
  if (!stats) return null;

  const reservationsData = Object.entries(
    stats.reservationsParStatut || {}
  ).map(([label, value], i) => ({
    label,
    value,
    color: colorForKey(label, i),
  }));
  const tablesData = Object.entries(stats.tablesParEtat || {}).map(
    ([label, value], i) => ({ label, value, color: colorForKey(label, i) })
  );

  const kpis = [
    {
      label: "Clients",
      value: stats.totalClients,
      icon: "👤",
      tint: "#eaf2ef",
      color: "#2f6f66",
    },
    {
      label: "Réservations",
      value: stats.totalReservations,
      icon: "📅",
      tint: "#f4ecd9",
      color: "#8a6a24",
    },
    {
      label: `Avis · ${stats.noteMoyenneGlobale ?? "-"}/5`,
      value: stats.totalAvis,
      icon: "⭐",
      tint: "#f6e9df",
      color: "#a15a3f",
    },
    {
      label: "Réclamations",
      value: stats.totalReclamations,
      icon: "📩",
      tint: "#e9edf3",
      color: "#2a4058",
    },
  ];

  return (
    <>
      <div className="main-header">
        <h1>Statistiques</h1>
        <p>Vue d'ensemble de l'activité du restaurant</p>
        <div className="export-actions">
          <button
            type="button"
            onClick={() => printPDF("Statistiques — Le Voilier")}
          >
            🖨️ PDF / Imprimer
          </button>
          <button
            type="button"
            onClick={() =>
              exportExcel(
                [
                  {
                    Clients: stats.totalClients,
                    Réservations: stats.totalReservations,
                    Avis: stats.totalAvis,
                    NoteMoyenne: stats.noteMoyenneGlobale ?? "",
                    Réclamations: stats.totalReclamations,
                  },
                ],
                "statistiques-le-voilier.xlsx",
                "Statistiques"
              )
            }
          >
            📊 Excel
          </button>
        </div>
      </div>

      <div
        className="stats-dashboard"
        style={{
          background: "linear-gradient(135deg, #eef6f4 0%, #f6f2e6 100%)",
          border: "1px solid #e4dfd3",
          borderRadius: 24,
          padding: 26,
          maxWidth: 900,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 14,
            marginBottom: 22,
          }}
        >
          {kpis.map((k) => (
            <div
              key={k.label}
              style={{
                background: "var(--white)",
                borderRadius: 16,
                padding: "16px 16px 18px",
                boxShadow: "0 8px 20px -16px rgba(11, 32, 54, 0.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: k.tint,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {k.icon}
                </span>
                <span
                  style={{
                    fontSize: 11.5,
                    color: "var(--ink-soft)",
                    fontWeight: 600,
                    letterSpacing: "0.2px",
                  }}
                >
                  {k.label}
                </span>
              </div>
              <strong
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "var(--navy-950)",
                  lineHeight: 1,
                }}
              >
                {k.value}
              </strong>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "var(--white)",
              borderRadius: 18,
              padding: 22,
              boxShadow: "0 10px 26px -18px rgba(11, 32, 54, 0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "#f4ecd9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                }}
              >
                📊
              </span>
              <strong style={{ fontSize: 14.5, color: "var(--navy-950)" }}>
                Réservations par statut
              </strong>
            </div>
            {reservationsData.length === 0 ? (
              <EmptyState title="Aucune donnée" />
            ) : (
              <BarChartStat data={reservationsData} />
            )}
          </div>

          <div
            style={{
              background: "var(--white)",
              borderRadius: 18,
              padding: 22,
              boxShadow: "0 10px 26px -18px rgba(11, 32, 54, 0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "#eaf2ef",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                }}
              >
                🍽️
              </span>
              <strong style={{ fontSize: 14.5, color: "var(--navy-950)" }}>
                Tables par état
              </strong>
            </div>
            {tablesData.length === 0 ? (
              <EmptyState title="Aucune donnée" />
            ) : (
              <DonutChartStat data={tablesData} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ================== RÉCLAMATIONS (ADMIN) ================== */
function SectionReclamations({ token, reclamations, onChange }) {
  const changerStatut = async (id, statut) => {
    await apiFetch(`${API_URL}/reclamations/${id}/statut`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ statut }),
    });
    toast(`Réclamation marquée « ${statut} ».`, "success");
    onChange();
  };

  return (
    <>
      <div className="main-header">
        <h1>Réclamations</h1>
        <p>Suivi et traitement des réclamations clients</p>
      </div>
      <div className="main-card">
        {reclamations.length === 0 ? (
          <EmptyState
            title="Aucune réclamation"
            subtitle="Aucune réclamation n'a été déposée."
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
              <p>
                {r.client} · {r.date}
              </p>
              {r.statut !== "Résolue" && (
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  {r.statut === "Nouvelle" && (
                    <button
                      onClick={() => changerStatut(r.id, "En cours")}
                      style={{
                        width: "auto",
                        margin: 0,
                        fontSize: "12px",
                        padding: "7px 14px",
                      }}
                    >
                      Prendre en charge
                    </button>
                  )}
                  <button
                    onClick={() => changerStatut(r.id, "Résolue")}
                    style={{
                      width: "auto",
                      margin: 0,
                      fontSize: "12px",
                      padding: "7px 14px",
                      background: "#4f8f86",
                    }}
                  >
                    Marquer résolue
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}

/* ================== GÉRER LES TABLES (ADMIN) ================== */
function CarteTableAdmin({ table, token, onChange }) {
  const [enEdition, setEnEdition] = useState(false);
  const [numero, setNumero] = useState(table.numero);
  const [capacite, setCapacite] = useState(table.capacite);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [suppression, setSuppression] = useState(false);

  const handleChangerEtat = async (statut) => {
    setError("");
    try {
      const response = await apiFetch(`${API_URL}/tables/${table.id}/statut`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statut }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur changement état");
      toast(`Table ${table.numero} → ${statut}`, "success");
      onChange();
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    }
  };

  const handleSupprimer = async () => {
    const ok = await askConfirm({
      title: "Supprimer la table",
      message: `Voulez-vous vraiment supprimer la Table ${table.numero} ? Cette action est irréversible.`,
      confirmLabel: "Supprimer",
      tone: "danger",
    });
    if (!ok) return;

    setError("");
    setSuppression(true);
    try {
      const response = await apiFetch(`${API_URL}/tables/${table.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur suppression");
      toast(`Table ${table.numero} supprimée.`, "success");
      onChange();
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    } finally {
      setSuppression(false);
    }
  };

  const handleEnregistrer = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await apiFetch(`${API_URL}/tables/${table.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          numero: parseInt(numero),
          capacite: parseInt(capacite),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur modification");
      toast("Table modifiée avec succès.", "success");
      setEnEdition(false);
      onChange();
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (enEdition) {
    return (
      <div className="admin-table-card">
        <label className="field-label">Numéro</label>
        <input
          type="number"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
        />
        <label className="field-label">Capacité</label>
        <input
          type="number"
          value={capacite}
          onChange={(e) => setCapacite(e.target.value)}
        />
        <div className="etat-buttons">
          <button
            onClick={handleEnregistrer}
            disabled={loading}
            style={{ margin: 0, background: "#4f8f86" }}
          >
            {loading ? "..." : "Enregistrer"}
          </button>
          <button
            onClick={() => setEnEdition(false)}
            className="danger"
            style={{ margin: 0 }}
          >
            Annuler
          </button>
        </div>
        {error && (
          <p className="error" style={{ marginTop: 8 }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="admin-table-card">
      <div className="row">
        <strong>Table {table.numero}</strong>
        <span
          className={`badge-statut ${
            table.statut === "Libre" ? "confirmee" : "annulee"
          }`}
        >
          {table.statut}
        </span>
      </div>
      <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: "12px" }}>
        {table.capacite} personnes
      </p>
      <div className="etat-buttons">
        {["Libre", "Réservée", "Occupée"].map((s) => (
          <button
            key={s}
            onClick={() => handleChangerEtat(s)}
            style={{
              margin: 0,
              background:
                table.statut === s ? "var(--navy-700)" : "var(--ink-soft)",
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="etat-buttons">
        <button onClick={() => setEnEdition(true)} style={{ margin: 0 }}>
          Modifier
        </button>
        <button
          onClick={handleSupprimer}
          className="danger"
          disabled={suppression}
          style={{ margin: 0 }}
        >
          {suppression ? "..." : "Supprimer"}
        </button>
      </div>
      {error && (
        <p className="error" style={{ marginTop: 8 }}>
          {error}
        </p>
      )}
    </div>
  );
}

function SectionGererTables({ token }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [numero, setNumero] = useState("");
  const [capacite, setCapacite] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [showTableForm, setShowTableForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);

  const [bulkDepart, setBulkDepart] = useState("");
  const [bulkQuantite, setBulkQuantite] = useState("");
  const [bulkCapacite, setBulkCapacite] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const [suppressionLoading, setSuppressionLoading] = useState(false);

  const charger = () => {
    setLoading(true);
    apiFetch(`${API_URL}/tables`)
      .then((res) => res.json())
      .then((data) => setTables(Array.isArray(data) ? data : []))
      .catch(() => {
        setError("Erreur chargement tables");
        toast("Erreur chargement tables", "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
  }, []);

  const handleAjouter = async (e) => {
    e.preventDefault();
    setError("");
    setAddLoading(true);
    try {
      const response = await apiFetch(`${API_URL}/tables`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          numero: parseInt(numero),
          capacite: parseInt(capacite),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur ajout");
      toast(`Table ${data.numero} ajoutée.`, "success");
      setNumero("");
      setCapacite("");
      charger();
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    } finally {
      setAddLoading(false);
    }
  };

  const handleAjoutRapide = async (e) => {
    e.preventDefault();
    setError("");
    setBulkLoading(true);

    const depart = parseInt(bulkDepart);
    const quantite = parseInt(bulkQuantite);
    const cap = parseInt(bulkCapacite);

    let succes = 0;
    let echecs = 0;

    for (let i = 0; i < quantite; i++) {
      try {
        const response = await apiFetch(`${API_URL}/tables`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ numero: depart + i, capacite: cap }),
        });
        if (response.ok) succes++;
        else echecs++;
      } catch {
        echecs++;
      }
    }

    toast(
      `${succes} table(s) ajoutée(s)` +
        (echecs > 0 ? `, ${echecs} échec(s).` : "."),
      echecs > 0 ? "error" : "success"
    );
    setBulkDepart("");
    setBulkQuantite("");
    setBulkCapacite("");
    setBulkLoading(false);
    charger();
  };

  const handleSupprimerTout = async () => {
    const ok = await askConfirm({
      title: "Supprimer toutes les tables",
      message: `Supprimer les ${tables.length} tables existantes ? Cette action est irréversible.`,
      confirmLabel: "Tout supprimer",
      tone: "danger",
    });
    if (!ok) return;

    setError("");
    setSuppressionLoading(true);

    let succes = 0;
    let echecs = 0;

    for (const t of tables) {
      try {
        const response = await apiFetch(`${API_URL}/tables/${t.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) succes++;
        else echecs++;
      } catch {
        echecs++;
      }
    }

    toast(
      `${succes} table(s) supprimée(s)` +
        (echecs > 0
          ? `, ${echecs} non supprimée(s) car liée(s) à des réservations.`
          : "."),
      echecs > 0 ? "error" : "success"
    );
    setSuppressionLoading(false);
    charger();
  };

  return (
    <>
      <div className="main-header">
        <h1>Gérer les tables</h1>
        <p>Ajout, disponibilité et suppression des tables</p>
      </div>

      <div className="main-card" style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setShowTableForm(!showTableForm);
              setShowBulkForm(false);
              setError("");
            }}
            style={{ width: "auto", margin: 0, padding: "10px 16px" }}
          >
            {showTableForm ? "✕ Fermer" : "＋ Ajouter une table"}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowBulkForm(!showBulkForm);
              setShowTableForm(false);
              setError("");
            }}
            style={{
              width: "auto",
              margin: 0,
              padding: "10px 16px",
              background: "#4f8f86",
            }}
          >
            {showBulkForm ? "✕ Fermer" : "＋ Ajouter plusieurs tables"}
          </button>
        </div>

        {showTableForm && (
          <div
            style={{
              borderTop: "1px solid var(--line)",
              paddingTop: "16px",
              marginTop: "18px",
            }}
          >
            <h3>Ajouter une table</h3>
            <form onSubmit={handleAjouter} className="row-2">
              <div>
                <label className="field-label">Numéro</label>
                <input
                  type="number"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Ex : 15"
                  required
                />
              </div>
              <div>
                <label className="field-label">Capacité</label>
                <input
                  type="number"
                  value={capacite}
                  onChange={(e) => setCapacite(e.target.value)}
                  placeholder="Ex : 4 personnes"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={addLoading}
                style={{ gridColumn: "1 / -1" }}
              >
                {addLoading ? "Ajout en cours..." : "Ajouter la table"}
              </button>
            </form>
          </div>
        )}

        {showBulkForm && (
          <div
            style={{
              borderTop: "1px solid var(--line)",
              paddingTop: "16px",
              marginTop: "18px",
            }}
          >
            <h3>Ajouter plusieurs tables</h3>
            <p
              style={{
                color: "var(--ink-soft)",
                fontSize: "13px",
                marginTop: 0,
              }}
            >
              Crée plusieurs tables avec le même nombre de places et des numéros
              consécutifs.
            </p>
            <form onSubmit={handleAjoutRapide} className="row-2">
              <div>
                <label className="field-label">Numéro de départ</label>
                <input
                  type="number"
                  value={bulkDepart}
                  onChange={(e) => setBulkDepart(e.target.value)}
                  placeholder="Ex : 15"
                  required
                />
              </div>
              <div>
                <label className="field-label">Quantité</label>
                <input
                  type="number"
                  min="1"
                  value={bulkQuantite}
                  onChange={(e) => setBulkQuantite(e.target.value)}
                  placeholder="Ex : 5"
                  required
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="field-label">Capacité (personnes)</label>
                <input
                  type="number"
                  value={bulkCapacite}
                  onChange={(e) => setBulkCapacite(e.target.value)}
                  placeholder="Ex : 4"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={bulkLoading}
                style={{ gridColumn: "1 / -1" }}
              >
                {bulkLoading ? "Ajout en cours..." : "Ajouter ces tables"}
              </button>
            </form>
          </div>
        )}

        {error && <p className="error">{error}</p>}
      </div>

      <div className="main-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          <h3 style={{ margin: 0 }}>Tables existantes ({tables.length})</h3>
          {tables.length > 0 && (
            <button
              onClick={handleSupprimerTout}
              disabled={suppressionLoading}
              className="danger"
              style={{
                width: "auto",
                margin: 0,
                fontSize: "12px",
                padding: "7px 14px",
              }}
            >
              {suppressionLoading ? "Suppression..." : "Tout supprimer"}
            </button>
          )}
        </div>

        {loading ? (
          <AdminGridSkeleton />
        ) : tables.length === 0 ? (
          <EmptyState title="Aucune table" />
        ) : (
          <div className="admin-tables-grid">
            {tables.map((t) => (
              <CarteTableAdmin
                key={t.id}
                table={t}
                token={token}
                onChange={charger}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ================== GÉRER LE MENU (ADMIN) ================== */
function CartePlatAdmin({ plat, token, categories, onChange }) {
  const [enEdition, setEnEdition] = useState(false);
  const [afficherDetails, setAfficherDetails] = useState(false);
  const [nom, setNom] = useState(plat.nom);
  const [description, setDescription] = useState(plat.description || "");
  const [prix, setPrix] = useState(plat.prix ?? "");
  const [quantite, setQuantite] = useState(plat.quantite ?? "");
  const [categorie, setCategorie] = useState(plat.categorie || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [suppression, setSuppression] = useState(false);

  const disponible =
    plat.disponible !== false && Number(plat.quantite ?? 0) > 0;

  const handleEnregistrer = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await apiFetch(`${API_URL}/plats/${plat.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom,
          description,
          prix: parseFloat(prix),
          quantite: parseInt(quantite),
          categorie,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || data.message || "Erreur modification");
      toast("Plat modifié avec succès.", "success");
      setEnEdition(false);
      onChange();
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSupprimer = async () => {
    const ok = await askConfirm({
      title: "Supprimer le plat",
      message: `Supprimer le plat « ${plat.nom} » ? Cette action est irréversible.`,
      confirmLabel: "Supprimer",
      tone: "danger",
    });
    if (!ok) return;

    setError("");
    setSuppression(true);
    try {
      const response = await apiFetch(`${API_URL}/plats/${plat.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Erreur suppression");
      toast(`Plat « ${plat.nom} » supprimé.`, "success");
      onChange();
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    } finally {
      setSuppression(false);
    }
  };

  if (enEdition) {
    return (
      <div className="admin-table-card">
        <label className="field-label">Nom du plat</label>
        <input value={nom} onChange={(e) => setNom(e.target.value)} />
        <label className="field-label">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="row-2">
          <div>
            <label className="field-label">Prix (DT)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Quantité</label>
            <input
              type="number"
              min="0"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
            />
          </div>
        </div>
        <label className="field-label">Catégorie</label>
        <select
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <div className="etat-buttons">
          <button
            onClick={handleEnregistrer}
            disabled={loading}
            style={{ margin: 0, background: "#4f8f86" }}
          >
            {loading ? "..." : "Enregistrer"}
          </button>
          <button
            onClick={() => setEnEdition(false)}
            className="danger"
            style={{ margin: 0 }}
          >
            Annuler
          </button>
        </div>
        {error && (
          <p className="error" style={{ marginTop: 8 }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="admin-table-card">
      <div
        style={{
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
          cursor: "pointer",
        }}
        onClick={() => setAfficherDetails(!afficherDetails)}
      >
        <img
          src={urlImagePlat(plat)}
          alt={plat.nom}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = imagePlatCategorie(plat.categorie);
          }}
          style={{
            width: 112,
            height: 112,
            borderRadius: 10,
            objectFit: "cover",
            flexShrink: 0,
            border: "1px solid var(--line)",
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row">
            <strong style={{ fontSize: "15px" }}>{plat.nom}</strong>
            {plat.prix != null && (
              <span
                className="badge-statut confirmee"
                style={{ fontSize: "11px" }}
              >
                {plat.prix} DT
              </span>
            )}
          </div>
          {plat.categorie && (
            <span
              style={{
                display: "inline-block",
                marginTop: "8px",
                padding: "4px 10px",
                borderRadius: "999px",
                background: "var(--teal-soft)",
                color: "var(--teal)",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {plat.categorie}
            </span>
          )}
          <p
            style={{
              margin: "7px 0 0",
              color: "var(--brass)",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {afficherDetails ? "▲ Masquer les détails" : "▼ Voir les détails"}
          </p>
        </div>
      </div>

      {afficherDetails && (
        <div
          style={{
            borderTop: "1px solid var(--line)",
            marginTop: 12,
            paddingTop: 10,
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              color: "var(--ink-soft)",
              fontSize: "13px",
            }}
          >
            {plat.description || "Aucune description."}
          </p>
          <div className="settings-row" style={{ padding: "6px 0" }}>
            <span>Quantité en stock</span>
            <strong>{plat.quantite ?? "-"}</strong>
          </div>
          <div
            className="settings-row"
            style={{ padding: "6px 0", borderBottom: "none" }}
          >
            <span>Disponibilité</span>
            <span
              className={`badge-statut ${disponible ? "confirmee" : "annulee"}`}
            >
              {disponible ? "Disponible" : "Indisponible"}
            </span>
          </div>
        </div>
      )}

      <div className="etat-buttons">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEnEdition(true);
          }}
          style={{ margin: 0 }}
        >
          Modifier
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSupprimer();
          }}
          className="danger"
          disabled={suppression}
          style={{ margin: 0 }}
        >
          {suppression ? "..." : "Supprimer"}
        </button>
      </div>
      {error && (
        <p className="error" style={{ marginTop: 8 }}>
          {error}
        </p>
      )}
    </div>
  );
}

function SectionGererMenu({ token }) {
  const [plats, setPlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPlatForm, setShowPlatForm] = useState(false);
  const [showCategorieForm, setShowCategorieForm] = useState(false);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [categorie, setCategorie] = useState("");
  const [nouvelleCategorie, setNouvelleCategorie] = useState("");
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem("voilier_categories");
      return saved
        ? [
            ...CATEGORIES_MENU_VOILIER,
            ...JSON.parse(saved).filter(
              (c) => !CATEGORIES_MENU_VOILIER.includes(c)
            ),
          ]
        : CATEGORIES_MENU_VOILIER;
    } catch (e) {
      return CATEGORIES_MENU_VOILIER;
    }
  });
  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState("");
  const [categorieOuverte, setCategorieOuverte] = useState(null);
  const [search, setSearch] = useState("");
  const searchDebounced = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);
  const pageSize = 12;

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
    if (!categorie && categories.length > 0) setCategorie(categories[0]);
  }, []);

  const enregistrerCategories = (liste) => {
    setCategories(liste);
    localStorage.setItem("voilier_categories", JSON.stringify(liste));
  };

  const handleAjouterCategorie = (e) => {
    e.preventDefault();
    setError("");
    const nomCat = nouvelleCategorie.trim();
    if (!nomCat) return;

    if (
      categories.some((c) => c.trim().toLowerCase() === nomCat.toLowerCase())
    ) {
      setError("Cette catégorie existe déjà.");
      toast("Cette catégorie existe déjà.", "error");
      return;
    }

    const nouvelles = [...categories, nomCat];
    enregistrerCategories(nouvelles);
    setCategorie(nomCat);
    setNouvelleCategorie("");
    setShowCategorieForm(false);
    toast(`Catégorie « ${nomCat} » ajoutée avec succès.`, "success");
  };

  const handleAjouterPlat = async (e) => {
    e.preventDefault();
    setError("");
    setAddLoading(true);

    try {
      const response = await apiFetch(`${API_URL}/plats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom,
          description,
          prix: parseFloat(prix),
          categorie,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Erreur lors de l'ajout du plat"
        );
      }

      toast(`Plat « ${data.nom || nom} » ajouté avec succès.`, "success");
      setNom("");
      setDescription("");
      setPrix("");
      setShowPlatForm(false);
      charger();
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <>
      <div className="main-header">
        <h1>Gérer le menu</h1>
        <p>Ajoutez les plats et organisez votre menu par catégories</p>
      </div>

      <div className="main-card" style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setShowPlatForm(!showPlatForm);
              setShowCategorieForm(false);
              setError("");
            }}
            style={{ width: "auto", margin: 0, padding: "10px 16px" }}
          >
            {showPlatForm ? "✕ Fermer" : "＋ Ajouter un plat"}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowCategorieForm(!showCategorieForm);
              setShowPlatForm(false);
              setError("");
            }}
            style={{
              width: "auto",
              margin: 0,
              padding: "10px 16px",
              background: "#4f8f86",
            }}
          >
            {showCategorieForm ? "✕ Fermer" : "＋ Ajouter une catégorie"}
          </button>
        </div>

        {showPlatForm && (
          <div
            style={{
              borderTop: "1px solid var(--line)",
              paddingTop: "16px",
              marginTop: "18px",
            }}
          >
            <h3>Ajouter un plat</h3>
            <form onSubmit={handleAjouterPlat}>
              <label className="field-label">Nom du plat</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex : Couscous royal"
                required
              />

              <label className="field-label">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description du plat"
              />

              <label className="field-label">Catégorie</label>
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                required
              >
                <option value="">-- Choisir une catégorie --</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <label className="field-label">Prix (DT)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                placeholder="0.00"
                required
              />

              <button type="submit" disabled={addLoading}>
                {addLoading ? "Ajout en cours..." : "Ajouter le plat"}
              </button>
            </form>
          </div>
        )}

        {showCategorieForm && (
          <div
            style={{
              borderTop: "1px solid var(--line)",
              paddingTop: "16px",
              marginTop: "18px",
            }}
          >
            <h3>Ajouter une catégorie</h3>
            <p
              style={{
                color: "var(--ink-soft)",
                fontSize: "13px",
                marginTop: 0,
              }}
            >
              La catégorie sera disponible automatiquement dans le formulaire
              d'ajout d'un plat.
            </p>
            <form onSubmit={handleAjouterCategorie}>
              <label className="field-label">Nom de la catégorie</label>
              <input
                type="text"
                value={nouvelleCategorie}
                onChange={(e) => setNouvelleCategorie(e.target.value)}
                placeholder="Ex : Pizzas"
                required
              />
              <button type="submit">Ajouter la catégorie</button>
            </form>
          </div>
        )}

        {error && <p className="error">{error}</p>}
      </div>

      <div className="main-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          <h3 style={{ margin: 0 }}>Plats du menu ({plats.length})</h3>
          <button
            type="button"
            onClick={charger}
            style={{
              width: "auto",
              margin: 0,
              fontSize: "12px",
              padding: "7px 14px",
            }}
          >
            Actualiser
          </button>
        </div>

        {loading ? (
          <AdminGridSkeleton count={3} />
        ) : plats.length === 0 ? (
          <EmptyState title="Aucun plat" subtitle="Le menu est vide." />
        ) : (
          (() => {
            const terme = searchDebounced.trim().toLowerCase();
            const platsRecherche = terme
              ? plats.filter((p) =>
                  `${p.nom || ""} ${p.description || ""} ${p.categorie || ""}`
                    .toLowerCase()
                    .includes(terme)
                )
              : plats;

            const totalPages = Math.max(
              1,
              Math.ceil(platsRecherche.length / pageSize)
            );
            const start = (page - 1) * pageSize;
            const platsPage = platsRecherche.slice(start, start + pageSize);

            const groupes = {};
            platsPage.forEach((plat) => {
              const cle = plat.categorie || "Sans catégorie";
              if (!groupes[cle]) groupes[cle] = [];
              groupes[cle].push(plat);
            });
            const nomsCategories = Object.keys(groupes);

            return (
              <>
                {nomsCategories.map((cat) => {
                  const estOuverte = categorieOuverte === cat;
                  return (
                    <div
                      key={cat}
                      style={{
                        border: "1.5px solid var(--line)",
                        borderRadius: 14,
                        marginBottom: 14,
                        overflow: "hidden",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setCategorieOuverte(estOuverte ? null : cat)
                        }
                        style={{
                          width: "100%",
                          margin: 0,
                          padding: "16px 20px",
                          background: estOuverte
                            ? "var(--navy-grad)"
                            : "var(--sail-dim)",
                          color: estOuverte ? "#fff" : "var(--ink)",
                          border: "none",
                          borderRadius: 0,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "14px",
                          fontWeight: 700,
                          letterSpacing: "0.3px",
                          cursor: "pointer",
                        }}
                      >
                        <span>
                          {cat}{" "}
                          <span
                            style={{
                              fontWeight: 500,
                              opacity: 0.75,
                              fontSize: "12px",
                            }}
                          >
                            ({groupes[cat].length})
                          </span>
                        </span>
                        <span style={{ fontSize: "13px" }}>
                          {estOuverte ? "▲" : "▼"}
                        </span>
                      </button>

                      {estOuverte && (
                        <div
                          className="admin-tables-grid"
                          style={{ padding: 18 }}
                        >
                          {groupes[cat].map((plat) => (
                            <CartePlatAdmin
                              key={plat.id}
                              plat={plat}
                              token={token}
                              categories={categories}
                              onChange={charger}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                <PaginationControls
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            );
          })()
        )}
      </div>
    </>
  );
}

/* ================== COMPTES CLIENTS (ADMIN) ================== */
function SectionGererComptes({ token }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const searchDebounced = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const charger = () => {
    setLoading(true);
    apiFetch(`${API_URL}/clients`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("");
        return res.json();
      })
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .catch(() => {
        setError("Erreur chargement clients");
        toast("Erreur chargement clients", "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchDebounced]);

  const handleToggle = async (id, actifActuel) => {
    setError("");
    try {
      const response = await apiFetch(`${API_URL}/clients/${id}/statut`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ actif: !actifActuel }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Erreur changement statut");
      toast("Statut mis à jour.", "success");
      charger();
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    }
  };

  const filteredClients = clients.filter((c) =>
    `${c.nom || ""} ${c.prenom || ""} ${c.email || ""} ${c.telephone || ""}`
      .toLowerCase()
      .includes(searchDebounced.trim().toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize));
  const visibleClients = filteredClients.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <>
      <div className="main-header">
        <h1>Comptes clients</h1>
        <p>Liste des clients et gestion de leur accès</p>
      </div>
      <div className="main-card">
        {error && <p className="error">{error}</p>}
        <div className="search-toolbar">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client..."
            aria-label="Rechercher un client"
          />
          <span className="pagination-info">
            {filteredClients.length} résultat(s)
          </span>
        </div>

        {loading ? (
          <ReservationsListSkeleton />
        ) : clients.length === 0 ? (
          <EmptyState title="Aucun client" />
        ) : (
          visibleClients.map((c) => (
            <div key={c.id} className="reservation-item">
              <div className="row">
                <strong>
                  {c.prenom} {c.nom}
                </strong>
                <span
                  className={`badge-statut ${
                    c.actif ? "confirmee" : "annulee"
                  }`}
                >
                  {c.actif ? "Actif" : "Désactivé"}
                </span>
              </div>
              <p>
                {c.email} · {c.telephone || "Pas de téléphone"}
              </p>
              <button
                onClick={() => handleToggle(c.id, c.actif)}
                className={c.actif ? "danger" : ""}
                style={{
                  width: "auto",
                  margin: "10px 0 0",
                  fontSize: "12px",
                  padding: "7px 14px",
                }}
              >
                {c.actif ? "Désactiver" : "Activer"}
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

/* ================== AVIS DES PLATS (ADMIN) ================== */
function SectionAvisPlats({ token }) {
  const [avisList, setAvisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const charger = () => {
    setLoading(true);
    apiFetch(`${API_URL}/avis`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("");
        return res.json();
      })
      .then((data) => {
        const plats = Array.isArray(data) ? data.filter((a) => a.plat) : [];
        setAvisList(plats);
      })
      .catch(() => {
        setError("Erreur chargement des avis des plats");
        toast("Erreur chargement des avis des plats", "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    charger();
  }, []);

  return (
    <>
      <div className="main-header">
        <h1>Avis des plats</h1>
        <p>Notes et commentaires laissés par les clients sur les plats</p>
      </div>
      <div className="main-card">
        {error && <p className="error">{error}</p>}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "14px",
          }}
        >
          <button
            type="button"
            onClick={charger}
            style={{
              width: "auto",
              margin: 0,
              fontSize: "12px",
              padding: "7px 14px",
            }}
          >
            Actualiser
          </button>
        </div>

        {loading ? (
          <ReservationsListSkeleton />
        ) : avisList.length === 0 ? (
          <EmptyState
            title="Aucun avis"
            subtitle="Aucun avis sur les plats pour le moment."
          />
        ) : (
          avisList.map((a) => (
            <div key={a.id} className="reservation-item">
              <div className="row">
                <strong>
                  {"⭐".repeat(a.note || 0)} ({a.note ?? "-"}/5)
                </strong>
                <span className="badge-statut confirmee">Plat : {a.plat}</span>
              </div>
              {a.commentaire && <p>{a.commentaire}</p>}
              <p>
                {a.client || "Client"} · {a.date || "-"}
              </p>
            </div>
          ))
        )}
      </div>
    </>
  );
}

/* ================== PARAMÈTRES (ADMIN) ================== */
function SectionParametresAdmin({ payload, onLogout }) {
  const roles = payload?.roles || [];
  const roleAffiche = roles.includes("ROLE_ADMIN") ? "Admin" : "Client";

  return (
    <>
      <div className="main-header">
        <h1>Paramètres</h1>
        <p>Informations du compte administrateur</p>
      </div>
      <div className="main-card">
        <div className="settings-row">
          <span>Email</span>
          <strong>{payload?.username || "-"}</strong>
        </div>
        <div className="settings-row">
          <span>Rôle</span>
          <strong>{roleAffiche}</strong>
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

/* ================== ADMIN PAGE (composant principal) ================== */
export default function AdminPage({ token, onLogout }) {
  const [section, setSection] = useState("stats");
  const [stats, setStats] = useState(null);
  const [reclamations, setReclamations] = useState([]);
  const [theme, setTheme] = useTheme();
  const [showMore, setShowMore] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const payload = decodeJWT(token);

  const charger = () => {
    apiFetch(`${API_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setStats(data))
      .catch(() => {});
    apiFetch(`${API_URL}/reclamations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setReclamations(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    charger();
  }, []);

  const navItems = [
    { key: "stats", icon: "📊", label: "Statistiques" },
    { key: "business", icon: "💰", label: "Business & Engagement" },
    { key: "tables", icon: "🍽️", label: "Gérer les tables" },
    { key: "comptes", icon: "👥", label: "Comptes clients" },
    { key: "menu", icon: "🍴", label: "Gérer le menu" },
    { key: "avis", icon: "⭐", label: "Avis plats" },
    { key: "reclamations", icon: "📩", label: "Réclamations" },
    { key: "parametres", icon: "⚙️", label: "Paramètres" },
  ];

  return (
    <div className="shell admin-shell">
      <div className="sidebar">
        <button className="sidebar-logo" onClick={() => setSection("stats")}>
          <img src="logo.png" alt="El Mehdi" />
          <h2>Le Voilier</h2>
        </button>
        <button
          type="button"
          className="nav-drawer-trigger"
          onClick={() => setNavOpen((v) => !v)}
          aria-label="Menu"
        >
          <span className="icon">☰</span>
        </button>
        {navOpen && (
          <div className="mobile-backdrop" onClick={() => setNavOpen(false)} />
        )}
        <div className={"sidebar-nav" + (navOpen ? " open" : "")}>
          {navItems.map((item) => (
            <button
              key={item.key}
              className={section === item.key ? "active" : ""}
              data-tooltip={item.label}
              onClick={() => {
                setSection(item.key);
                setNavOpen(false);
              }}
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
        {section === "stats" && <SectionStatistiques stats={stats} />}
        {section === "business" && <SectionBusinessHub token={token} />}
        {section === "tables" && <SectionGererTables token={token} />}
        {section === "menu" && <SectionGererMenu token={token} />}
        {section === "comptes" && <SectionGererComptes token={token} />}
        {section === "avis" && <SectionAvisPlats token={token} />}
        {section === "reclamations" && (
          <SectionReclamations
            token={token}
            reclamations={reclamations}
            onChange={charger}
          />
        )}
        {section === "parametres" && (
          <SectionParametresAdmin payload={payload} onLogout={onLogout} />
        )}
      </div>
    </div>
  );
}
