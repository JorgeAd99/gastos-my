"use client";

import { useState, useMemo } from "react";

type Category =
  | "Comida"
  | "Transporte"
  | "Entretenimiento"
  | "Salud"
  | "Hogar"
  | "Ropa"
  | "Educación"
  | "Otro";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: Category;
  date: string;
}

const CATEGORIES: Category[] = [
  "Comida",
  "Transporte",
  "Entretenimiento",
  "Salud",
  "Hogar",
  "Ropa",
  "Educación",
  "Otro",
];

const CATEGORY_COLORS: Record<Category, string> = {
  Comida: "#E07B54",
  Transporte: "#5B8DEF",
  Entretenimiento: "#A66CDB",
  Salud: "#4DBFA0",
  Hogar: "#E8B84B",
  Ropa: "#E96B8A",
  Educación: "#5BBFDE",
  Otro: "#9BA3AF",
};

const CATEGORY_ICONS: Record<Category, string> = {
  Comida: "🍽",
  Transporte: "🚌",
  Entretenimiento: "🎬",
  Salud: "💊",
  Hogar: "🏠",
  Ropa: "👕",
  Educación: "📚",
  Otro: "📦",
};

function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const INITIAL_EXPENSES: Expense[] = [
  { id: "1", description: "Almuerzo en el trabajo", amount: 3500, category: "Comida", date: "2026-03-01" },
  { id: "2", description: "SUBE", amount: 1200, category: "Transporte", date: "2026-03-02" },
  { id: "3", description: "Netflix", amount: 4999, category: "Entretenimiento", date: "2026-03-02" },
  { id: "4", description: "Farmacia", amount: 8750, category: "Salud", date: "2026-03-03" },
];

type ModalMode = "add" | "stats" | null;

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [modal, setModal] = useState<ModalMode>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "Comida" as Category,
    date: new Date().toISOString().split("T")[0],
  });
  const [formError, setFormError] = useState("");

  const total = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  const byCategory = useMemo(() => {
    const map: Partial<Record<Category, number>> = {};
    for (const e of expenses) {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    }
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, amount]) => ({ cat: cat as Category, amount, pct: total > 0 ? (amount / total) * 100 : 0 }));
  }, [expenses, total]);

  const handleAddExpense = () => {
    if (!form.description.trim()) { setFormError("Ingresá una descripción"); return; }
    const parsed = parseFloat(form.amount.replace(",", "."));
    if (!form.amount || isNaN(parsed) || parsed <= 0) { setFormError("Ingresá un monto válido"); return; }

    const newExpense: Expense = {
      id: Date.now().toString(),
      description: form.description.trim(),
      amount: parsed,
      category: form.category,
      date: form.date,
    };
    setExpenses(prev => [newExpense, ...prev]);
    setForm({ description: "", amount: "", category: "Comida", date: new Date().toISOString().split("T")[0] });
    setFormError("");
    setModal(null);
  };

  const handleDelete = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    setDeleteId(null);
  };

  const sorted = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #F7F6F2;
          color: #1A1A1A;
          min-height: 100vh;
        }

        .app {
          max-width: 430px;
          margin: 0 auto;
          min-height: 100vh;
          background: #F7F6F2;
          display: flex;
          flex-direction: column;
        }

        /* ── HEADER ── */
        .header {
          padding: 56px 24px 0;
          text-align: center;
        }
        .header-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #9BA3AF;
          margin-bottom: 8px;
        }
        .header-month {
          font-family: 'DM Serif Display', serif;
          font-size: 15px;
          color: #6B7280;
          margin-bottom: 20px;
        }
        .total-card {
          background: #1A1A1A;
          border-radius: 28px;
          padding: 36px 28px;
          margin: 0 4px;
          position: relative;
          overflow: hidden;
        }
        .total-card::before {
          content: '';
          position: absolute;
          top: -40px; right: -40px;
          width: 160px; height: 160px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
        }
        .total-card::after {
          content: '';
          position: absolute;
          bottom: -20px; left: -20px;
          width: 100px; height: 100px;
          border-radius: 50%;
          background: rgba(255,255,255,0.03);
        }
        .total-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 10px;
        }
        .total-amount {
          font-family: 'DM Serif Display', serif;
          font-size: 46px;
          color: #fff;
          line-height: 1;
          letter-spacing: -1px;
        }
        .total-count {
          margin-top: 14px;
          font-size: 12px;
          color: rgba(255,255,255,0.35);
        }

        /* ── BUTTONS ── */
        .actions {
          display: flex;
          gap: 10px;
          padding: 20px 28px 0;
        }
        .btn {
          flex: 1;
          border: none;
          border-radius: 16px;
          padding: 16px 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.12s, box-shadow 0.12s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .btn:active { transform: scale(0.97); }
        .btn-primary {
          background: #1A1A1A;
          color: #fff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }
        .btn-primary:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.22); }
        .btn-secondary {
          background: #fff;
          color: #1A1A1A;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          border: 1px solid #EBEBEB;
        }
        .btn-secondary:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.1); }

        /* ── LIST ── */
        .list-section {
          flex: 1;
          padding: 28px 28px 40px;
        }
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 16px;
        }
        .list-title {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: #1A1A1A;
        }
        .list-subtitle {
          font-size: 11px;
          color: #9BA3AF;
        }

        .expense-list { display: flex; flex-direction: column; gap: 10px; }

        .expense-item {
          background: #fff;
          border-radius: 18px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
          border: 1px solid #F0F0F0;
          transition: transform 0.1s;
          position: relative;
        }
        .expense-item:active { transform: scale(0.99); }

        .expense-icon {
          width: 44px; height: 44px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .expense-info { flex: 1; min-width: 0; }
        .expense-desc {
          font-size: 14px;
          font-weight: 500;
          color: #1A1A1A;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .expense-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 3px;
        }
        .expense-cat {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 20px;
        }
        .expense-date {
          font-size: 11px;
          color: #9BA3AF;
        }
        .expense-amount {
          font-size: 15px;
          font-weight: 600;
          color: #1A1A1A;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .delete-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #D1D5DB;
          font-size: 16px;
          padding: 0 0 0 8px;
          flex-shrink: 0;
          transition: color 0.15s;
        }
        .delete-btn:hover { color: #EF4444; }

        .empty-state {
          text-align: center;
          padding: 48px 0;
          color: #9BA3AF;
          font-size: 14px;
        }
        .empty-icon { font-size: 40px; margin-bottom: 12px; }

        /* ── MODAL OVERLAY ── */
        .overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .sheet {
          background: #fff;
          border-radius: 28px 28px 0 0;
          width: 100%;
          max-width: 430px;
          padding: 28px 24px 48px;
          animation: slideUp 0.28s cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

        .sheet-handle {
          width: 36px; height: 4px;
          background: #E5E7EB;
          border-radius: 2px;
          margin: 0 auto 24px;
        }
        .sheet-title {
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          margin-bottom: 22px;
          color: #1A1A1A;
        }

        /* ── FORM ── */
        .field { margin-bottom: 16px; }
        .field label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6B7280;
          margin-bottom: 6px;
        }
        .field input, .field select {
          width: 100%;
          padding: 14px 16px;
          border: 1.5px solid #E5E7EB;
          border-radius: 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: #1A1A1A;
          background: #FAFAFA;
          outline: none;
          transition: border-color 0.15s;
          appearance: none;
        }
        .field input:focus, .field select:focus { border-color: #1A1A1A; background: #fff; }

        .cat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        .cat-btn {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 4px;
          padding: 10px 4px;
          border-radius: 14px;
          border: 1.5px solid #E5E7EB;
          background: #FAFAFA;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .cat-btn span:first-child { font-size: 20px; }
        .cat-btn span:last-child { font-size: 10px; font-weight: 500; color: #6B7280; }
        .cat-btn.selected { border-width: 2px; }
        .cat-btn:not(.selected):hover { background: #F3F4F6; }

        .form-error {
          font-size: 12px;
          color: #EF4444;
          margin-bottom: 12px;
        }
        .btn-full {
          width: 100%;
          padding: 16px;
          background: #1A1A1A;
          color: #fff;
          border: none;
          border-radius: 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 8px;
          transition: opacity 0.15s;
        }
        .btn-full:hover { opacity: 0.88; }

        /* ── STATS ── */
        .stats-list { display: flex; flex-direction: column; gap: 14px; }
        .stat-row { display: flex; flex-direction: column; gap: 6px; }
        .stat-info {
          display: flex; justify-content: space-between; align-items: center;
        }
        .stat-cat {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; font-weight: 500;
        }
        .stat-dot {
          width: 10px; height: 10px; border-radius: 50%;
          flex-shrink: 0;
        }
        .stat-amount { font-size: 14px; font-weight: 600; color: #1A1A1A; }
        .stat-bar-bg {
          height: 6px;
          background: #F0F0F0;
          border-radius: 3px;
          overflow: hidden;
        }
        .stat-bar {
          height: 100%;
          border-radius: 3px;
          transition: width 0.6s cubic-bezier(0.34, 1.1, 0.64, 1);
        }
        .stat-pct { font-size: 11px; color: #9BA3AF; }

        /* ── CONFIRM DELETE ── */
        .confirm-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 200;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: fadeIn 0.15s ease;
        }
        .confirm-box {
          background: #fff;
          border-radius: 24px;
          padding: 28px 24px;
          width: 100%;
          max-width: 320px;
          text-align: center;
          animation: popIn 0.2s cubic-bezier(0.34, 1.3, 0.64, 1);
        }
        @keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .confirm-box h3 { font-family: 'DM Serif Display', serif; font-size: 20px; margin-bottom: 8px; }
        .confirm-box p { font-size: 13px; color: #6B7280; margin-bottom: 22px; }
        .confirm-actions { display: flex; gap: 10px; }
        .btn-cancel {
          flex: 1; padding: 13px; border-radius: 14px; border: 1.5px solid #E5E7EB;
          background: #fff; font-family: 'DM Sans', sans-serif; font-size: 14px;
          font-weight: 500; cursor: pointer; color: #6B7280;
        }
        .btn-delete {
          flex: 1; padding: 13px; border-radius: 14px; border: none;
          background: #EF4444; font-family: 'DM Sans', sans-serif; font-size: 14px;
          font-weight: 500; cursor: pointer; color: #fff;
        }
      `}</style>

      <div className="app">
        {/* ── HEADER / TOTAL ── */}
        <div className="header">
          <p className="header-label">Mis Gastos</p>
          <p className="header-month">
            {new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
          </p>
          <div className="total-card">
            <p className="total-label">Total gastado</p>
            <p className="total-amount">{formatARS(total)}</p>
            <p className="total-count">{expenses.length} {expenses.length === 1 ? "gasto registrado" : "gastos registrados"}</p>
          </div>
        </div>

        {/* ── ACTIONS ── */}
        <div className="actions">
          <button className="btn btn-primary" onClick={() => { setFormError(""); setModal("add"); }}>
            <span>+</span> Nuevo gasto
          </button>
          <button className="btn btn-secondary" onClick={() => setModal("stats")}>
            <span>📊</span> Resumen
          </button>
        </div>

        {/* ── EXPENSE LIST ── */}
        <div className="list-section">
          <div className="list-header">
            <span className="list-title">HISTORIAL</span>
            <span className="list-subtitle">{sorted.length} items</span>
          </div>

          {sorted.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🧾</div>
              <p>No hay gastos todavía.</p>
              <p>¡Agregá el primero!</p>
            </div>
          ) : (
            <div className="expense-list">
              {sorted.map(expense => (
                <div className="expense-item" key={expense.id}>
                  <div
                    className="expense-icon"
                    style={{ background: CATEGORY_COLORS[expense.category] + "18" }}
                  >
                    {CATEGORY_ICONS[expense.category]}
                  </div>
                  <div className="expense-info">
                    <div className="expense-desc">{expense.description}</div>
                    <div className="expense-meta">
                      <span
                        className="expense-cat"
                        style={{
                          background: CATEGORY_COLORS[expense.category] + "18",
                          color: CATEGORY_COLORS[expense.category],
                        }}
                      >
                        {expense.category}
                      </span>
                      <span className="expense-date">{formatDate(expense.date)}</span>
                    </div>
                  </div>
                  <span className="expense-amount">{formatARS(expense.amount)}</span>
                  <button className="delete-btn" onClick={() => setDeleteId(expense.id)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL: ADD EXPENSE ── */}
      {modal === "add" && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <p className="sheet-title">Nuevo gasto</p>

            <div className="field">
              <label>Descripción</label>
              <input
                type="text"
                placeholder="Ej: Almuerzo, SUBE, etc."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                autoFocus
              />
            </div>

            <div className="field">
              <label>Monto (ARS)</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              />
            </div>

            <div className="field">
              <label>Fecha</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>

            <div className="field">
              <label>Categoría</label>
              <div className="cat-grid">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className={`cat-btn${form.category === cat ? " selected" : ""}`}
                    style={form.category === cat ? {
                      borderColor: CATEGORY_COLORS[cat],
                      background: CATEGORY_COLORS[cat] + "15",
                    } : {}}
                    onClick={() => setForm(f => ({ ...f, category: cat }))}
                  >
                    <span>{CATEGORY_ICONS[cat]}</span>
                    <span style={form.category === cat ? { color: CATEGORY_COLORS[cat] } : {}}>{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {formError && <p className="form-error">{formError}</p>}

            <button className="btn-full" onClick={handleAddExpense}>
              Guardar gasto
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: STATS ── */}
      {modal === "stats" && (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <p className="sheet-title">Resumen por categoría</p>

            {byCategory.length === 0 ? (
              <p style={{ color: "#9BA3AF", fontSize: 14 }}>No hay datos aún.</p>
            ) : (
              <div className="stats-list">
                {byCategory.map(({ cat, amount, pct }) => (
                  <div className="stat-row" key={cat}>
                    <div className="stat-info">
                      <span className="stat-cat">
                        <span className="stat-dot" style={{ background: CATEGORY_COLORS[cat] }} />
                        {CATEGORY_ICONS[cat]} {cat}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="stat-pct">{pct.toFixed(0)}%</span>
                        <span className="stat-amount">{formatARS(amount)}</span>
                      </span>
                    </div>
                    <div className="stat-bar-bg">
                      <div
                        className="stat-bar"
                        style={{ width: `${pct}%`, background: CATEGORY_COLORS[cat] }}
                      />
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: "1.5px solid #F0F0F0", paddingTop: 14, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#6B7280" }}>TOTAL</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A" }}>{formatARS(total)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CONFIRM DELETE ── */}
      {deleteId && (
        <div className="confirm-overlay" onClick={() => setDeleteId(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <h3>Eliminar gasto</h3>
            <p>¿Estás seguro? Esta acción no se puede deshacer.</p>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className="btn-delete" onClick={() => handleDelete(deleteId)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}