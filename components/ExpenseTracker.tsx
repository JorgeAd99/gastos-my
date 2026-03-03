"use client";

import { useState, useMemo, useEffect } from "react";

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
  "Comida", "Transporte", "Entretenimiento", "Salud",
  "Hogar", "Ropa", "Educación", "Otro",
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

const STORAGE_KEY = "expense-tracker-gastos";

function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Expense[]) : [];
  } catch {
    return [];
  }
}

type ModalMode = "add" | "stats" | null;

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);
  const [modal, setModal] = useState<ModalMode>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
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
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([cat, amount]) => ({
        cat: cat as Category,
        amount: amount as number,
        pct: total > 0 ? ((amount as number) / total) * 100 : 0,
      }));
  }, [expenses, total]);

  const handleAdd = () => {
    if (!form.description.trim()) { setFormError("Ingresá una descripción"); return; }
    const parsed = parseFloat(form.amount.replace(",", "."));
    if (!form.amount || isNaN(parsed) || parsed <= 0) { setFormError("Ingresá un monto válido"); return; }
    setExpenses(prev => [{
      id: Date.now().toString(),
      description: form.description.trim(),
      amount: parsed,
      category: form.category,
      date: form.date,
    }, ...prev]);
    setForm({ description: "", amount: "", category: "Comida", date: new Date().toISOString().split("T")[0] });
    setFormError("");
    setModal(null);
  };

  const sorted = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const s = {
    page: { backgroundColor: "#F7F6F2", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" } as React.CSSProperties,
    container: { maxWidth: 430, margin: "0 auto", minHeight: "100vh", backgroundColor: "#F7F6F2", display: "flex", flexDirection: "column" as const },
    headerWrap: { padding: "52px 24px 0", textAlign: "center" as const },
    eyebrow: { fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "#9BA3AF", marginBottom: 8 },
    monthLabel: { fontSize: 14, color: "#6B7280", marginBottom: 20 },
    totalCard: { backgroundColor: "#1A1A1A", borderRadius: 28, padding: "36px 28px", margin: "0 4px", position: "relative" as const, overflow: "hidden" },
    totalEyebrow: { fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.4)", marginBottom: 10 },
    totalAmount: { fontSize: 44, fontWeight: 300, color: "#fff", lineHeight: 1, letterSpacing: "-2px" },
    totalCount: { marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.35)" },
    actions: { display: "flex", gap: 10, padding: "20px 28px 0" },
    btnPrimary: { flex: 1, border: "none", borderRadius: 16, padding: "16px 12px", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer", backgroundColor: "#1A1A1A", color: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 } as React.CSSProperties,
    btnSecondary: { flex: 1, border: "1.5px solid #EBEBEB", borderRadius: 16, padding: "16px 12px", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer", backgroundColor: "#fff", color: "#1A1A1A", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 } as React.CSSProperties,
    listSection: { flex: 1, padding: "28px 28px 48px" },
    listHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 },
    overlay: { position: "fixed" as const, inset: 0, backgroundColor: "rgba(0,0,0,0.35)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" },
    sheet: { backgroundColor: "#fff", borderRadius: "28px 28px 0 0", width: "100%", maxWidth: 430, padding: "28px 24px 48px" },
    handle: { width: 36, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2, margin: "0 auto 24px" },
    sheetTitle: { fontSize: 22, fontWeight: 300, marginBottom: 22, color: "#1A1A1A", letterSpacing: "-0.5px" },
    fieldLabel: { display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#6B7280", marginBottom: 6 },
    input: { width: "100%", padding: "14px 16px", border: "1.5px solid #E5E7EB", borderRadius: 14, fontFamily: "inherit", fontSize: 15, color: "#1A1A1A", backgroundColor: "#FAFAFA", outline: "none", boxSizing: "border-box" as const },
    catGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 },
    btnFull: { width: "100%", padding: 16, backgroundColor: "#1A1A1A", color: "#fff", border: "none", borderRadius: 16, fontFamily: "inherit", fontSize: 15, fontWeight: 500, cursor: "pointer", marginTop: 4 },
  };

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* HEADER */}
        <div style={s.headerWrap}>
          <p style={s.eyebrow}>Mis Gastos</p>
          <p style={s.monthLabel}>
            {new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
          </p>
          <div style={s.totalCard}>
            {/* Círculos decorativos */}
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "30%", right: 40, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
            <p style={s.totalEyebrow}>Total gastado</p>
            <p style={s.totalAmount}>{formatARS(total)}</p>
            <p style={s.totalCount}>
              {expenses.length} {expenses.length === 1 ? "gasto registrado" : "gastos registrados"}
            </p>
          </div>
        </div>

        {/* BUTTONS */}
        <div style={s.actions}>
          <button style={s.btnPrimary} onClick={() => { setFormError(""); setModal("add"); }}>
            + Nuevo gasto
          </button>
          <button style={s.btnSecondary} onClick={() => setModal("stats")}>
            📊 Resumen
          </button>
        </div>

        {/* LIST */}
        <div style={s.listSection}>
          <div style={s.listHeader}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#1A1A1A" }}>HISTORIAL</span>
            <span style={{ fontSize: 11, color: "#9BA3AF" }}>{sorted.length} items</span>
          </div>

          {sorted.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9BA3AF" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
              <p style={{ fontSize: 14 }}>No hay gastos todavía. ¡Agregá el primero!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sorted.map(expense => (
                <div key={expense.id} style={{ backgroundColor: "#fff", borderRadius: 18, padding: 16, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #F0F0F0" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, backgroundColor: CATEGORY_COLORS[expense.category] + "18" }}>
                    {CATEGORY_ICONS[expense.category]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#1A1A1A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {expense.description}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20, backgroundColor: CATEGORY_COLORS[expense.category] + "18", color: CATEGORY_COLORS[expense.category] }}>
                        {expense.category}
                      </span>
                      <span style={{ fontSize: 11, color: "#9BA3AF" }}>{formatDate(expense.date)}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {formatARS(expense.amount)}
                  </span>
                  <button onClick={() => setDeleteId(expense.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#D1D5DB", fontSize: 14, padding: "0 0 0 6px", flexShrink: 0 }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL ADD */}
      {modal === "add" && (
        <div style={s.overlay} onClick={() => setModal(null)}>
          <div style={s.sheet} onClick={e => e.stopPropagation()}>
            <div style={s.handle} />
            <p style={s.sheetTitle}>Nuevo gasto</p>

            <div style={{ marginBottom: 16 }}>
              <label style={s.fieldLabel}>Descripción</label>
              <input autoFocus style={s.input} type="text" placeholder="Ej: Almuerzo, SUBE, etc." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={s.fieldLabel}>Monto (ARS $)</label>
              <input style={s.input} type="number" inputMode="decimal" placeholder="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={s.fieldLabel}>Fecha</label>
              <input style={s.input} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={s.fieldLabel}>Categoría</label>
              <div style={s.catGrid}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setForm(f => ({ ...f, category: cat }))} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "10px 4px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit", border: form.category === cat ? `2px solid ${CATEGORY_COLORS[cat]}` : "1.5px solid #E5E7EB", backgroundColor: form.category === cat ? CATEGORY_COLORS[cat] + "15" : "#FAFAFA" }}>
                    <span style={{ fontSize: 20 }}>{CATEGORY_ICONS[cat]}</span>
                    <span style={{ fontSize: 10, fontWeight: 500, color: form.category === cat ? CATEGORY_COLORS[cat] : "#6B7280" }}>{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {formError && <p style={{ fontSize: 12, color: "#EF4444", marginBottom: 12 }}>{formError}</p>}
            <button style={s.btnFull} onClick={handleAdd}>Guardar gasto</button>
          </div>
        </div>
      )}

      {/* MODAL STATS */}
      {modal === "stats" && (
        <div style={s.overlay} onClick={() => setModal(null)}>
          <div style={s.sheet} onClick={e => e.stopPropagation()}>
            <div style={s.handle} />
            <p style={s.sheetTitle}>Resumen por categoría</p>
            {byCategory.length === 0 ? (
              <p style={{ color: "#9BA3AF", fontSize: 14 }}>No hay datos aún.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {byCategory.map(({ cat, amount, pct }) => (
                  <div key={cat}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: CATEGORY_COLORS[cat], flexShrink: 0, display: "inline-block" }} />
                        {CATEGORY_ICONS[cat]} {cat}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: "#9BA3AF" }}>{pct.toFixed(0)}%</span>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{formatARS(amount)}</span>
                      </span>
                    </div>
                    <div style={{ height: 6, backgroundColor: "#F0F0F0", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, backgroundColor: CATEGORY_COLORS[cat], borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: "1.5px solid #F0F0F0", paddingTop: 14, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", letterSpacing: "0.06em" }}>TOTAL</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A" }}>{formatARS(total)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIRM DELETE */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setDeleteId(null)}>
          <div style={{ backgroundColor: "#fff", borderRadius: 24, padding: "28px 24px", width: "100%", maxWidth: 320, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 400, marginBottom: 8 }}>Eliminar gasto</h3>
            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 22 }}>¿Estás seguro? Esta acción no se puede deshacer.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: 13, borderRadius: 14, border: "1.5px solid #E5E7EB", backgroundColor: "#fff", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#6B7280" }}>
                Cancelar
              </button>
              <button onClick={() => { setExpenses(prev => prev.filter(e => e.id !== deleteId)); setDeleteId(null); }} style={{ flex: 1, padding: 13, borderRadius: 14, border: "none", backgroundColor: "#EF4444", fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#fff" }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}