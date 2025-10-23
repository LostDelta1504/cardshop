import React, { useMemo, useState } from "react";

/**
 * Lost Delta's Doraemon Pouch — v0.2
 * - Fix: only show breadcrumbs beyond Home
 * - New: prices + Add to Cart + Cart panel + subtotal
 */

// ---------------- Mock Data ----------------
const MOCK_DATA = {
  games: [
    {
      id: "mtg",
      name: "Magic: The Gathering",
      description: "Singles",
      sets: [
        {
          id: "mh3",
          name: "Modern Horizons 3",
          release: "2024-06-14",
          cards: [
            { id: "mh3-001", name: "Ulamog's Dreadsire", rarity: "Mythic", code: "001/303", price: 19.9 },
            { id: "mh3-112", name: "Lightning Bolt (Showcase)", rarity: "Uncommon", code: "112/303", price: 2.5 },
            { id: "mh3-201", name: "Wurmcoil Engine (Retro)", rarity: "Mythic", code: "201/303", price: 24.0 },
          ],
        },
        {
          id: "lhm",
          name: "Lost Caverns Minis (Demo Set)",
          release: "2023-11-17",
          cards: [
            { id: "lhm-014", name: "Cavern Guide", rarity: "Common", code: "014/100", price: 0.5 },
            { id: "lhm-077", name: "Crystal Drake", rarity: "Rare", code: "077/100", price: 3.2 },
          ],
        },
      ],
    },
    {
      id: "vanguard",
      name: "Cardfight!! Vanguard",
      description: "D Standard, V Premium, Premium.",
      sets: [
        {
          id: "dz-bt01",
          name: "DZ-BT01: Dimensional Break",
          release: "2025-03-08",
          cards: [
            { id: "dz-001", name: "Chronojet Dragon Reborn", rarity: "FR", code: "001", price: 28.0 },
            { id: "dz-045", name: "Eclipse Witch, Mocha", rarity: "RRR", code: "045", price: 6.5 },
            { id: "dz-120", name: "Steam Knight, Puzur-Ili", rarity: "R", code: "120", price: 1.2 },
          ],
        },
        {
          id: "d-bt12",
          name: "D-BT12: Evenfall of the Dark Night",
          release: "2024-09-27",
          cards: [
            { id: "db12-003", name: "Youthberk Skyfall Arms", rarity: "SSR", code: "003", price: 35.0 },
            { id: "db12-044", name: "Blitz Order – Shield", rarity: "C", code: "044", price: 0.3 },
          ],
        },
      ],
    },
  ],
};

// ---------------- UI Helpers ----------------
function Section({ title, children, right }) {
  return (
    <section className="max-w-6xl mx-auto px-4">
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Card({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl shadow hover:shadow-lg transition-shadow border bg-white p-4 focus:outline-none"
    >
      {children}
    </button>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 border">
      {children}
    </span>
  );
}

function Breadcrumbs({ trail, onCrumb }) {
  return (
    <nav className="max-w-6xl mx-auto px-4 my-4 text-sm text-gray-600">
      {trail.map((t, i) => (
        <span key={i}>
          <button
            className={`hover:underline ${i === trail.length - 1 ? "font-semibold text-gray-900" : ""}`}
            onClick={() => onCrumb?.(i)}
          >
            {t.label}
          </button>
          {i < trail.length - 1 && <span className="mx-2">/</span>}
        </span>
      ))}
    </nav>
  );
}

// ---------------- Root App ----------------
export default function App() {
  const [view, setView] = useState("games"); // "games" | "sets" | "cards"
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedSet, setSelectedSet] = useState(null);
  const [query, setQuery] = useState("");

  // cart: { [cardId]: { card, qty } }
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);

  const games = MOCK_DATA.games;
  const sets = selectedGame?.sets ?? [];
  const filteredCards = useMemo(() => {
    const cards = selectedSet?.cards ?? [];
    if (!query) return cards;
    const q = query.toLowerCase();
    return cards.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [selectedSet, query]);

  const trail = [
    { label: "Home", view: "games" },
    selectedGame ? { label: selectedGame.name, view: "sets" } : null,
    selectedSet ? { label: selectedSet.name, view: "cards" } : null,
  ].filter(Boolean);

  function goHome() {
    setView("games");
    setSelectedGame(null);
    setSelectedSet(null);
    setQuery("");
  }

  function onCrumb(index) {
    const dest = trail[index];
    if (!dest) return;
    if (dest.view === "games") goHome();
    if (dest.view === "sets") {
      setView("sets");
      setSelectedSet(null);
      setQuery("");
    }
  }

  // ----- Cart helpers -----
  const cartCount = Object.values(cart).reduce((n, item) => n + item.qty, 0);
  const cartSubtotal = Object.values(cart).reduce((sum, { card, qty }) => sum + card.price * qty, 0);

  function addToCart(card) {
    setCart((prev) => {
      const current = prev[card.id]?.qty ?? 0;
      return { ...prev, [card.id]: { card, qty: current + 1 } };
    });
  }
  function decFromCart(cardId) {
    setCart((prev) => {
      const item = prev[cardId];
      if (!item) return prev;
      const nextQty = item.qty - 1;
      const next = { ...prev };
      if (nextQty <= 0) delete next[cardId];
      else next[cardId] = { ...item, qty: nextQty };
      return next;
    });
  }
  function removeFromCart(cardId) {
    setCart((prev) => {
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
  }
  function clearCart() {
    setCart({});
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Lost Delta's <span className="text-indigo-600">Doraemon Pouch</span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={goHome}
              className="text-sm rounded-full border px-3 py-1 hover:bg-gray-50"
              title="Back to Home"
            >
              Home
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="text-sm rounded-full border px-3 py-1 hover:bg-gray-50"
              title="Open cart"
            >
              Cart ({cartCount})
            </button>
          </div>
        </div>
      </header>

      {/* Only show crumbs when beyond Home */}
      {trail.length > 1 && <Breadcrumbs trail={trail} onCrumb={onCrumb} />}

      {/* Views */}
      {view === "games" && (
        <Section title="Choose a TCG Game :">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((g) => (
              <Card
                key={g.id}
                onClick={() => {
                  setSelectedGame(g);
                  setView("sets");
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-semibold">{g.name}</div>
                    <p className="text-gray-600 text-sm mt-1">{g.description}</p>
                  </div>
                  <Pill>{g.sets.length} sets</Pill>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {view === "sets" && (
        <Section
          title={`Sets — ${selectedGame?.name || ""}`}
          right={
            <button
              onClick={() => setView("games")}
              className="text-sm rounded-lg border px-3 py-1 hover:bg-gray-50"
            >
              ← Back to Games
            </button>
          }
        >
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {sets.map((s) => (
              <Card
                key={s.id}
                onClick={() => {
                  setSelectedSet(s);
                  setView("cards");
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-semibold">{s.name}</div>
                    <p className="text-gray-600 text-sm mt-1">Release: {s.release}</p>
                  </div>
                  <Pill>{s.cards.length} cards</Pill>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {view === "cards" && (
        <Section
          title={`Cards — ${selectedSet?.name || ""}`}
          right={
            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or code…"
                className="border rounded-lg px-3 py-1 text-sm"
              />
              <button
                onClick={() => setView("sets")}
                className="text-sm rounded-lg border px-3 py-1 hover:bg-gray-50"
              >
                ← Back to Sets
              </button>
            </div>
          }
        >
          {filteredCards.length === 0 ? (
            <p className="text-gray-600">No cards match your search.</p>
          ) : (
            <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCards.map((c) => (
                <li key={c.id} className="rounded-2xl border bg-white p-4 shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {c.code} • {c.rarity}
                      </div>
                    </div>
                    <Pill>{c.rarity}</Pill>
                  </div>

                  {/* Placeholder image block */}
                  <div className="mt-3 aspect-[3/4] w-full rounded-xl bg-gray-100 border grid place-items-center text-gray-400 text-xs">
                    Image
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm font-semibold">${c.price?.toFixed(2) ?? "—"}</div>
                    <button
                      onClick={() => addToCart(c)}
                      className="text-sm rounded-lg border px-3 py-1 hover:bg-gray-50"
                    >
                      Add to Cart
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      <footer className="mt-16 border-t">
        <div className="max-w-6xl mx-auto px-4 py-8 text-xs text-gray-500">
          © {new Date().getFullYear()} Lost Delta's Doraemon Pouch — demo build v0.2
        </div>
      </footer>

      {/* Cart panel */}
      {cartOpen && (
        <div className="fixed inset-0 z-20">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setCartOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white border-l shadow-xl flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Cart</h3>
              <button
                onClick={() => setCartOpen(false)}
                className="text-sm rounded-lg border px-3 py-1 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {cartCount === 0 ? (
                <p className="text-gray-600 text-sm">Your cart is empty.</p>
              ) : (
                <ul className="space-y-3">
                  {Object.values(cart).map(({ card, qty }) => (
                    <li key={card.id} className="border rounded-xl p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-sm">{card.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {card.code} • {card.rarity}
                          </div>
                          <div className="text-sm mt-2">${card.price.toFixed(2)} each</div>
                        </div>
                        <div className="text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => decFromCart(card.id)}
                              className="text-sm rounded-lg border px-2 py-1 hover:bg-gray-50"
                            >
                              −
                            </button>
                            <span className="min-w-[2ch] text-sm text-center">{qty}</span>
                            <button
                              onClick={() => addToCart(card)}
                              className="text-sm rounded-lg border px-2 py-1 hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                          <div className="mt-2 text-xs text-gray-600">
                            Line total: ${(card.price * qty).toFixed(2)}
                          </div>
                          <button
                            onClick={() => removeFromCart(card.id)}
                            className="mt-2 text-xs rounded-lg border px-2 py-1 hover:bg-gray-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600">Subtotal</div>
                <div className="font-semibold">${cartSubtotal.toFixed(2)}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="text-sm rounded-lg border px-3 py-2 hover:bg-gray-50"
                >
                  Clear
                </button>
                <button
                  disabled
                  className="text-sm rounded-lg border px-3 py-2 hover:bg-gray-50 opacity-60 cursor-not-allowed"
                  title="Checkout coming soon"
                >
                  Checkout (soon)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
