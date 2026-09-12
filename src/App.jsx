import React, { useState, useMemo, useEffect, useRef, createContext, useContext } from "react";
import {
  ShoppingCart, Search, Menu, X, Star, Plus, Minus, Trash2,
  Headphones, Watch, Backpack, Shirt, Glasses, Keyboard, Smartphone,
  Footprints, Lamp, Speaker, Wallet, GlassWater, ShieldCheck, Truck,
  Headset, BadgeCheck, ChevronRight, ChevronLeft, Check, Loader2,
  Mail, Phone as PhoneIcon
} from "lucide-react";

/* ---------------------------------------------------------------
   DATA
---------------------------------------------------------------- */

const CATEGORIES = ["Electronics", "Fashion", "Accessories", "Home", "Lifestyle"];

const PRODUCTS = [
  {
    id: 1, name: "Wireless Headphones", category: "Electronics", price: 59.99,
    rating: 4.5, reviews: 212, stock: 25, icon: Headphones, accent: "#1F3D2B",
    short: "Over-ear comfort with noise isolation and 30-hour battery life.",
    long: "Sink into deep, balanced sound with plush memory-foam ear cushions and a foldable frame built for daily commutes. A 30-hour battery and quick-charge port mean you're rarely without your soundtrack, and the built-in mic keeps calls clear on the go."
  },
  {
    id: 2, name: "Smart Watch", category: "Electronics", price: 89.99,
    rating: 4.7, reviews: 340, stock: 18, icon: Watch, accent: "#1F3D2B",
    short: "Track workouts, sleep, and notifications from your wrist.",
    long: "A crisp always-on display keeps your day visible at a glance, while onboard sensors track heart rate, sleep stages, and over 20 workout modes. Five-day battery life and water resistance mean it keeps pace with you, not the other way around."
  },
  {
    id: 3, name: "Minimal Backpack", category: "Accessories", price: 39.99,
    rating: 4.3, reviews: 156, stock: 30, icon: Backpack, accent: "#8A6A3A",
    short: "A slim, water-resistant daypack with a padded laptop sleeve.",
    long: "Cut from water-resistant canvas with reinforced stitching, this daypack carries a 15-inch laptop, a change of clothes, and everything in between without losing its shape. A hidden back pocket keeps essentials close when you're moving through a crowd."
  },
  {
    id: 4, name: "Premium Hoodie", category: "Fashion", price: 49.99,
    rating: 4.6, reviews: 289, stock: 40, icon: Shirt, accent: "#4A5E52",
    short: "Heavyweight brushed cotton with a relaxed, everyday fit.",
    long: "Made from heavyweight brushed cotton that softens with every wash, this hoodie is cut for a relaxed fit that layers well in any season. A double-lined hood and ribbed cuffs add structure without sacrificing comfort."
  },
  {
    id: 5, name: "Sunglasses", category: "Fashion", price: 29.99,
    rating: 4.2, reviews: 98, stock: 22, icon: Glasses, accent: "#4A5E52",
    short: "Polarized lenses in a lightweight acetate frame.",
    long: "Polarized lenses cut glare without distorting color, set into a lightweight acetate frame that holds its shape through a summer of use. Spring hinges add a little give for all-day wear."
  },
  {
    id: 6, name: "Mechanical Keyboard", category: "Electronics", price: 69.99,
    rating: 4.8, reviews: 401, stock: 15, icon: Keyboard, accent: "#1F3D2B",
    short: "Hot-swappable switches with per-key backlighting.",
    long: "Hot-swappable switch sockets let you tune the feel of every key without a soldering iron, while per-key RGB backlighting and a compact 75% layout keep your desk tidy. A detachable USB-C cable makes it easy to travel with."
  },
  {
    id: 7, name: "Phone Stand", category: "Accessories", price: 19.99,
    rating: 4.1, reviews: 74, stock: 50, icon: Smartphone, accent: "#8A6A3A",
    short: "Adjustable aluminum stand for calls, video, and charging.",
    long: "Machined from a single block of aluminum, this stand adjusts to any angle for video calls, recipes, or watching something while you cook. A weighted base keeps it steady on any desk."
  },
  {
    id: 8, name: "Sneakers", category: "Fashion", price: 79.99,
    rating: 4.6, reviews: 267, stock: 20, icon: Footprints, accent: "#4A5E52",
    short: "Everyday trainers with a cushioned, breathable sole.",
    long: "A knit upper breathes through warm afternoons while a cushioned midsole absorbs the impact of a long day on your feet. The tonal outsole grips city pavement and trail alike."
  },
  {
    id: 9, name: "Desk Lamp", category: "Home", price: 34.99,
    rating: 4.4, reviews: 132, stock: 28, icon: Lamp, accent: "#7A5236",
    short: "Dimmable LED lamp with a warm-to-cool color range.",
    long: "Three color temperatures and stepless dimming let you match the lamp to the task, from late-night reading to focused desk work. The flexible arm folds flat when it's not in use."
  },
  {
    id: 10, name: "Portable Speaker", category: "Electronics", price: 54.99,
    rating: 4.5, reviews: 188, stock: 24, icon: Speaker, accent: "#1F3D2B",
    short: "Compact speaker with rich bass and 12-hour playback.",
    long: "A dual-driver setup pushes surprisingly full bass out of a speaker that fits in one hand, and a 12-hour battery keeps the music going from breakfast to bonfire. It's rated IPX6, so a little rain won't end the party."
  },
  {
    id: 11, name: "Leather Wallet", category: "Accessories", price: 24.99,
    rating: 4.3, reviews: 143, stock: 35, icon: Wallet, accent: "#8A6A3A",
    short: "Slim full-grain leather wallet with six card slots.",
    long: "Full-grain leather is cut and stitched into a slim profile that holds six cards and folded bills without bulking up your pocket. It's designed to darken and soften with age, so it looks better the longer you carry it."
  },
  {
    id: 12, name: "Smart Water Bottle", category: "Lifestyle", price: 44.99,
    rating: 4.0, reviews: 61, stock: 19, icon: GlassWater, accent: "#2E6B6B",
    short: "Insulated bottle that tracks intake and glows as a reminder.",
    long: "Double-wall insulation keeps drinks cold for 24 hours, while a built-in sensor tracks your intake and a soft glow reminds you to drink throughout the day. The companion app is entirely optional — the bottle works well on its own."
  },
];

const money = (n) => `$${n.toFixed(2)}`;

/* ---------------------------------------------------------------
   CART CONTEXT
---------------------------------------------------------------- */

const CartContext = createContext(null);
const useCart = () => useContext(CartContext);

function CartProvider({ children, onToast }) {
  const [items, setItems] = useState([]); // {id, qty}

  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: Math.min(i.qty + qty, product.stock) } : i
        );
      }
      return [...prev, { id: product.id, qty: Math.min(qty, product.stock) }];
    });
    onToast(`Added ${product.name} to cart`);
  };

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQty = (id, qty) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
    );
  };

  const clearCart = () => setItems([]);

  const detailedItems = items
    .map((i) => {
      const product = PRODUCTS.find((p) => p.id === i.id);
      return product ? { ...product, qty: i.qty } : null;
    })
    .filter(Boolean);

  const subtotal = detailedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items: detailedItems, addToCart, removeFromCart, updateQty, clearCart, subtotal, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ---------------------------------------------------------------
   SHARED UI PIECES
---------------------------------------------------------------- */

const INK = "#1C1C1A";
const STONE = "#7A7568";
const PAPER = "#FAFAF8";
const BORDER = "#E7E2D6";
const FOREST = "#1F3D2B";
const FOREST_DARK = "#152C1F";
const GOLD = "#B98A2E";

function Stars({ rating, reviews }) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={14}
            fill={n <= full ? GOLD : "none"}
            stroke={n <= full ? GOLD : STONE}
          />
        ))}
      </div>
      <span className="text-xs" style={{ color: STONE }}>
        {rating.toFixed(1)}{reviews ? ` (${reviews})` : ""}
      </span>
    </div>
  );
}

function ProductTile({ product, size = "md" }) {
  const Icon = product.icon;
  const dim = size === "lg" ? 56 : size === "sm" ? 28 : 40;
  return (
    <div
      className="w-full h-full flex items-center justify-center rounded-lg"
      style={{ backgroundColor: `${product.accent}14` }}
    >
      <Icon size={dim} strokeWidth={1.4} color={product.accent} />
    </div>
  );
}

function PrimaryButton({ children, onClick, className = "", disabled, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ backgroundColor: FOREST, color: "#fff" }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.backgroundColor = FOREST_DARK)}
      onMouseLeave={(e) => !disabled && (e.currentTarget.style.backgroundColor = FOREST)}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-full border transition-colors ${className}`}
      style={{ borderColor: BORDER, color: INK }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F1EEE5")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      {children}
    </button>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm"
      style={{ backgroundColor: INK, color: "#fff" }}
    >
      <Check size={16} color={GOLD} />
      {message}
    </div>
  );
}

/* ---------------------------------------------------------------
   NAVBAR
---------------------------------------------------------------- */

function Navbar({ page, navigate, searchQuery, setSearchQuery, runSearch }) {
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const navItem = (label, target) => (
    <button
      onClick={() => { navigate(target); setMobileOpen(false); }}
      className="text-sm transition-colors"
      style={{ color: page === target ? FOREST : INK, fontWeight: page === target ? 600 : 500 }}
    >
      {label}
    </button>
  );

  const submitSearch = (e) => {
    e.preventDefault();
    runSearch(localQuery);
    setSearchOpen(false);
    setMobileOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur border-b"
      style={{ backgroundColor: "rgba(250,250,248,0.92)", borderColor: BORDER }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate("home")}
          className="text-xl tracking-tight"
          style={{ fontFamily: "'Fraunces', serif", color: INK, fontWeight: 600 }}
        >
          Shopest
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {navItem("Home", "home")}
          {navItem("Shop", "shop")}
          {navItem("Categories", "categories")}
          <button onClick={() => navigate("about")} className="text-sm font-medium" style={{ color: INK }}>About</button>
          <button onClick={() => navigate("contact")} className="text-sm font-medium" style={{ color: INK }}>Contact</button>
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            {searchOpen ? (
              <form onSubmit={submitSearch} className="flex items-center">
                <input
                  autoFocus
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  onBlur={() => !localQuery && setSearchOpen(false)}
                  placeholder="Search products…"
                  className="w-48 px-3 py-1.5 text-sm rounded-full border outline-none"
                  style={{ borderColor: BORDER }}
                />
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} aria-label="Search">
                <Search size={19} color={INK} />
              </button>
            )}
          </div>
          <button onClick={() => navigate("cart")} className="relative" aria-label="Cart">
            <ShoppingCart size={20} color={INK} />
            {count > 0 && (
              <span
                className="absolute -top-2 -right-2 text-[10px] w-4 h-4 flex items-center justify-center rounded-full text-white"
                style={{ backgroundColor: FOREST }}
              >
                {count}
              </span>
            )}
          </button>
          <button className="md:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
            {mobileOpen ? <X size={22} color={INK} /> : <Menu size={22} color={INK} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t px-5 py-4 flex flex-col gap-4" style={{ borderColor: BORDER, backgroundColor: PAPER }}>
          <form onSubmit={submitSearch} className="flex items-center gap-2">
            <Search size={16} color={STONE} />
            <input
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search products…"
              className="flex-1 px-3 py-2 text-sm rounded-full border outline-none"
              style={{ borderColor: BORDER }}
            />
          </form>
          {navItem("Home", "home")}
          {navItem("Shop", "shop")}
          {navItem("Categories", "categories")}
          <button onClick={() => { navigate("about"); setMobileOpen(false); }} className="text-sm font-medium text-left">About</button>
          <button onClick={() => { navigate("contact"); setMobileOpen(false); }} className="text-sm font-medium text-left">Contact</button>
        </div>
      )}
    </header>
  );
}

/* ---------------------------------------------------------------
   HOME PAGE
---------------------------------------------------------------- */

function Hero({ navigate }) {
  const featured = [PRODUCTS[1], PRODUCTS[0], PRODUCTS[7], PRODUCTS[9]];
  return (
    <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 pb-16 sm:pt-20 sm:pb-24 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h1
          className="text-4xl sm:text-5xl leading-tight mb-5"
          style={{ fontFamily: "'Fraunces', serif", color: INK, fontWeight: 600 }}
        >
          Discover. Choose. Shopest.
        </h1>
        <p className="text-base sm:text-lg mb-8 max-w-md" style={{ color: STONE }}>
          A carefully selected catalog of everyday objects, chosen for how they hold up —
          not just how they photograph. Browse, compare, and check out in minutes.
        </p>
        <div className="flex items-center gap-4">
          <PrimaryButton onClick={() => navigate("shop")}>
            Shop now <ChevronRight size={16} />
          </PrimaryButton>
          <button onClick={() => navigate("about")} className="text-sm font-medium underline underline-offset-4" style={{ color: INK }}>
            Our story
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 h-80 sm:h-96">
        <div className="row-span-2 rounded-2xl overflow-hidden border" style={{ borderColor: BORDER }}>
          <ProductTile product={featured[0]} size="lg" />
        </div>
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: BORDER }}>
          <ProductTile product={featured[1]} />
        </div>
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: BORDER }}>
          <ProductTile product={featured[2]} />
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, navigate }) {
  const { addToCart } = useCart();
  return (
    <div
      className="group rounded-xl border overflow-hidden flex flex-col transition-shadow hover:shadow-md"
      style={{ borderColor: BORDER, backgroundColor: "#fff" }}
    >
      <button onClick={() => navigate("product", { id: product.id })} className="aspect-square p-5 text-left">
        <ProductTile product={product} size="lg" />
      </button>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <button onClick={() => navigate("product", { id: product.id })} className="text-left">
          <h3 className="text-sm font-semibold" style={{ color: INK }}>{product.name}</h3>
        </button>
        <p className="text-xs leading-relaxed" style={{ color: STONE }}>{product.short}</p>
        <Stars rating={product.rating} reviews={product.reviews} />
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: INK }}>{money(product.price)}</span>
          <button
            onClick={() => addToCart(product, 1)}
            className="text-xs font-medium px-3 py-2 rounded-full"
            style={{ backgroundColor: "#F1EEE5", color: INK }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = FOREST; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F1EEE5"; e.currentTarget.style.color = INK; }}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

function FeaturedProducts({ navigate }) {
  const featured = PRODUCTS.slice(0, 8);
  return (
    <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
      <div className="flex items-end justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl" style={{ fontFamily: "'Fraunces', serif", color: INK, fontWeight: 600 }}>
          Featured
        </h2>
        <button onClick={() => navigate("shop")} className="text-sm font-medium flex items-center gap-1" style={{ color: FOREST }}>
          View all <ChevronRight size={15} />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {featured.map((p) => (
          <ProductCard key={p.id} product={p} navigate={navigate} />
        ))}
      </div>
    </section>
  );
}

function CategoriesSection({ navigate, setFilters }) {
  const icons = { Electronics: Headphones, Fashion: Shirt, Accessories: Wallet, Home: Lamp, Lifestyle: GlassWater };
  return (
    <section id="categories" className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
      <h2 className="text-2xl sm:text-3xl mb-8" style={{ fontFamily: "'Fraunces', serif", color: INK, fontWeight: 600 }}>
        Shop by category
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = icons[cat];
          return (
            <button
              key={cat}
              onClick={() => { setFilters((f) => ({ ...f, category: cat })); navigate("shop"); }}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border transition-colors"
              style={{ borderColor: BORDER }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F1EEE5")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Icon size={26} color={FOREST} strokeWidth={1.5} />
              <span className="text-sm font-medium" style={{ color: INK }}>{cat}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function WhyShopest() {
  const points = [
    { icon: BadgeCheck, title: "Quality products", desc: "Every item is chosen for how it performs after the first month, not just the first day." },
    { icon: ShieldCheck, title: "Secure checkout", desc: "Your details stay protected from cart to confirmation." },
    { icon: Truck, title: "Fast delivery", desc: "Most orders ship within 24 hours and arrive within the week." },
    { icon: Headset, title: "Customer support", desc: "A real person answers within a day, not a queue." },
  ];
  return (
    <section className="py-14" style={{ backgroundColor: "#F1EEE5" }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <h2 className="text-2xl sm:text-3xl mb-10" style={{ fontFamily: "'Fraunces', serif", color: INK, fontWeight: 600 }}>
          Why Shopest
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {points.map((p) => (
            <div key={p.title}>
              <p.icon size={24} color={FOREST} strokeWidth={1.5} />
              <h3 className="text-sm font-semibold mt-4 mb-2" style={{ color: INK }}>{p.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: STONE }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomePage({ navigate, setFilters }) {
  return (
    <>
      <Hero navigate={navigate} />
      <FeaturedProducts navigate={navigate} />
      <CategoriesSection navigate={navigate} setFilters={setFilters} />
      <WhyShopest />
    </>
  );
}

/* ---------------------------------------------------------------
   SHOP PAGE
---------------------------------------------------------------- */

function ShopPage({ navigate, filters, setFilters }) {
  const { search, category, sort, maxPrice } = filters;

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) => p.price <= maxPrice);
    if (category !== "All") list = list.filter((p) => p.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.short.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "price-asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price-desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "name": list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
      case "popularity": list = [...list].sort((a, b) => b.rating - a.rating); break;
      default: break;
    }
    return list;
  }, [search, category, sort, maxPrice]);

  return (
    <section className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
      <h1 className="text-3xl mb-2" style={{ fontFamily: "'Fraunces', serif", color: INK, fontWeight: 600 }}>Shop</h1>
      <p className="text-sm mb-8" style={{ color: STONE }}>{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-56 flex-shrink-0">
          <div className="mb-6">
            <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: STONE }}>Search</label>
            <input
              value={search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder="Find a product…"
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
              style={{ borderColor: BORDER }}
            />
          </div>
          <div className="mb-6">
            <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: STONE }}>Category</label>
            <div className="flex flex-wrap gap-2">
              {["All", ...CATEGORIES].map((c) => (
                <button
                  key={c}
                  onClick={() => setFilters((f) => ({ ...f, category: c }))}
                  className="text-xs px-3 py-1.5 rounded-full border"
                  style={{
                    borderColor: category === c ? FOREST : BORDER,
                    backgroundColor: category === c ? FOREST : "transparent",
                    color: category === c ? "#fff" : INK,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: STONE }}>
              Max price: {money(maxPrice)}
            </label>
            <input
              type="range"
              min="15"
              max="95"
              step="5"
              value={maxPrice}
              onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: STONE }}>Sort by</label>
            <select
              value={sort}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
              style={{ borderColor: BORDER }}
            >
              <option value="popularity">Popularity</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name: A–Z</option>
            </select>
          </div>
        </aside>

        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm mb-4" style={{ color: STONE }}>No products match those filters.</p>
              <GhostButton onClick={() => setFilters({ search: "", category: "All", sort: "popularity", maxPrice: 95 })}>
                Clear filters
              </GhostButton>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   PRODUCT DETAIL PAGE
---------------------------------------------------------------- */

function ProductDetailPage({ productId, navigate }) {
  const product = PRODUCTS.find((p) => p.id === productId);
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  useEffect(() => { setQty(1); }, [productId]);

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 text-center">
        <p className="text-sm mb-4" style={{ color: STONE }}>That product couldn't be found.</p>
        <PrimaryButton onClick={() => navigate("shop")}>Back to shop</PrimaryButton>
      </div>
    );
  }

  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <section className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
      <button onClick={() => navigate("shop")} className="text-xs font-medium flex items-center gap-1 mb-8" style={{ color: STONE }}>
        <ChevronLeft size={14} /> Back to shop
      </button>
      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-square rounded-2xl border p-10" style={{ borderColor: BORDER }}>
          <ProductTile product={product} size="lg" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: STONE }}>{product.category}</p>
          <h1 className="text-3xl mb-3" style={{ fontFamily: "'Fraunces', serif", color: INK, fontWeight: 600 }}>{product.name}</h1>
          <div className="mb-4"><Stars rating={product.rating} reviews={product.reviews} /></div>
          <p className="text-2xl font-semibold mb-5" style={{ color: INK }}>{money(product.price)}</p>
          <p className="text-sm leading-relaxed mb-6" style={{ color: STONE }}>{product.long}</p>
          <p className="text-xs mb-6" style={{ color: product.stock > 5 ? STONE : "#B23A2E" }}>
            {product.stock > 5 ? `In stock — ${product.stock} available` : `Only ${product.stock} left`}
          </p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded-full" style={{ borderColor: BORDER }}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3" aria-label="Decrease quantity">
                <Minus size={14} color={INK} />
              </button>
              <span className="w-8 text-center text-sm font-medium">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="p-3" aria-label="Increase quantity">
                <Plus size={14} color={INK} />
              </button>
            </div>
            <PrimaryButton onClick={() => addToCart(product, qty)} className="flex-1">
              <ShoppingCart size={16} /> Add to cart
            </PrimaryButton>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl mb-6" style={{ fontFamily: "'Fraunces', serif", color: INK, fontWeight: 600 }}>You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} navigate={navigate} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------
   CART PAGE
---------------------------------------------------------------- */

function CartItemRow({ item }) {
  const { updateQty, removeFromCart } = useCart();
  return (
    <div className="flex items-center gap-4 py-5 border-b" style={{ borderColor: BORDER }}>
      <div className="w-20 h-20 rounded-lg flex-shrink-0 border p-3" style={{ borderColor: BORDER }}>
        <ProductTile product={item} size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold truncate" style={{ color: INK }}>{item.name}</h3>
        <p className="text-xs mt-1" style={{ color: STONE }}>{money(item.price)} each</p>
        <button onClick={() => removeFromCart(item.id)} className="text-xs flex items-center gap-1 mt-2" style={{ color: "#B23A2E" }}>
          <Trash2 size={12} /> Remove
        </button>
      </div>
      <div className="flex items-center border rounded-full" style={{ borderColor: BORDER }}>
        <button onClick={() => updateQty(item.id, item.qty - 1)} className="p-2" aria-label="Decrease quantity">
          <Minus size={12} color={INK} />
        </button>
        <span className="w-6 text-center text-xs font-medium">{item.qty}</span>
        <button onClick={() => updateQty(item.id, Math.min(item.stock, item.qty + 1))} className="p-2" aria-label="Increase quantity">
          <Plus size={12} color={INK} />
        </button>
      </div>
      <p className="text-sm font-semibold w-16 text-right" style={{ color: INK }}>{money(item.price * item.qty)}</p>
    </div>
  );
}

function CartPage({ navigate }) {
  const { items, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <section className="max-w-3xl mx-auto px-5 sm:px-8 py-24 text-center">
        <ShoppingCart size={40} color={STONE} strokeWidth={1.2} className="mx-auto mb-5" />
        <h1 className="text-xl mb-2" style={{ fontFamily: "'Fraunces', serif", color: INK, fontWeight: 600 }}>Your cart is empty</h1>
        <p className="text-sm mb-8" style={{ color: STONE }}>Nothing here yet — go find something worth carrying.</p>
        <PrimaryButton onClick={() => navigate("shop")}>Continue shopping</PrimaryButton>
      </section>
    );
  }

  const shipping = subtotal > 50 ? 0 : 4.99;

  return (
    <section className="max-w-4xl mx-auto px-5 sm:px-8 py-12">
      <h1 className="text-3xl mb-8" style={{ fontFamily: "'Fraunces', serif", color: INK, fontWeight: 600 }}>Your cart</h1>
      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>
        <div>
          <div className="rounded-xl border p-6" style={{ borderColor: BORDER }}>
            <div className="flex justify-between text-sm mb-3">
              <span style={{ color: STONE }}>Subtotal</span>
              <span style={{ color: INK }}>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span style={{ color: STONE }}>Shipping</span>
              <span style={{ color: INK }}>{shipping === 0 ? "Free" : money(shipping)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-3 border-t mb-6" style={{ borderColor: BORDER, color: INK }}>
              <span>Total</span>
              <span>{money(subtotal + shipping)}</span>
            </div>
            <PrimaryButton onClick={() => navigate("checkout")} className="w-full">
              Proceed to checkout
            </PrimaryButton>
          </div>
          <button onClick={() => navigate("shop")} className="text-xs font-medium mt-4 block mx-auto" style={{ color: STONE }}>
            Continue shopping
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   CHECKOUT PAGE
---------------------------------------------------------------- */

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-xs font-semibold block mb-1.5" style={{ color: INK }}>{label}</label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: "#B23A2E" }}>{error}</p>}
    </div>
  );
}

const inputStyle = { borderColor: BORDER };
const inputClass = "w-full px-3 py-2.5 text-sm rounded-lg border outline-none";

function CheckoutPage({ navigate, onPlaceOrder }) {
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", country: "", city: "", address: "",
    cardName: "", cardNumber: "", expiry: "", cvv: "",
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (items.length === 0 && !processing) navigate("shop");
    // eslint-disable-next-line
  }, []);

  const shipping = subtotal > 50 ? 0 : 4.99;
  const total = subtotal + shipping;

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email.";
    if (form.phone.replace(/\D/g, "").length < 7) e.phone = "Enter a valid phone number.";
    if (!form.country.trim()) e.country = "Enter your country.";
    if (!form.city.trim()) e.city = "Enter your city.";
    if (!form.address.trim()) e.address = "Enter your address.";
    if (!form.cardName.trim()) e.cardName = "Enter the name on the card.";
    if (form.cardNumber.replace(/\D/g, "").length !== 16) e.cardNumber = "Enter a 16-digit card number.";
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) e.expiry = "Use MM/YY format.";
    if (!/^\d{3,4}$/.test(form.cvv)) e.cvv = "Enter a valid CVV.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setProcessing(true);
    setTimeout(() => {
      const order = {
        number: `SH-${Math.floor(100000 + Math.random() * 900000)}`,
        items,
        subtotal,
        shipping,
        total,
        customer: form,
      };
      onPlaceOrder(order);
      clearCart();
      setProcessing(false);
      navigate("confirmation");
    }, 900);
  };

  const formatCard = (val) => val.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  return (
    <section className="max-w-5xl mx-auto px-5 sm:px-8 py-12">
      <h1 className="text-3xl mb-8" style={{ fontFamily: "'Fraunces', serif", color: INK, fontWeight: 600 }}>Checkout</h1>
      <form onSubmit={submit} className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 flex flex-col gap-8">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: STONE }}>Shipping details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name" error={errors.fullName}>
                <input className={inputClass} style={inputStyle} value={form.fullName} onChange={set("fullName")} placeholder="Jane Doe" />
              </Field>
              <Field label="Email" error={errors.email}>
                <input className={inputClass} style={inputStyle} value={form.email} onChange={set("email")} placeholder="jane@email.com" />
              </Field>
              <Field label="Phone number" error={errors.phone}>
                <input className={inputClass} style={inputStyle} value={form.phone} onChange={set("phone")} placeholder="+1 555 000 1234" />
              </Field>
              <Field label="Country" error={errors.country}>
                <input className={inputClass} style={inputStyle} value={form.country} onChange={set("country")} placeholder="Morocco" />
              </Field>
              <Field label="City" error={errors.city}>
                <input className={inputClass} style={inputStyle} value={form.city} onChange={set("city")} placeholder="Fes" />
              </Field>
              <Field label="Address" error={errors.address}>
                <input className={inputClass} style={inputStyle} value={form.address} onChange={set("address")} placeholder="Street, apartment, etc." />
              </Field>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: STONE }}>Payment</h2>
            <p className="text-xs mb-4" style={{ color: STONE }}>
              This is a demo checkout — no real payment is processed and no card details are stored.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Cardholder name" error={errors.cardName}>
                  <input className={inputClass} style={inputStyle} value={form.cardName} onChange={set("cardName")} placeholder="Name on card" />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Card number" error={errors.cardNumber}>
                  <input
                    className={inputClass} style={inputStyle}
                    value={form.cardNumber}
                    onChange={(e) => setForm((f) => ({ ...f, cardNumber: formatCard(e.target.value) }))}
                    placeholder="0000 0000 0000 0000"
                  />
                </Field>
              </div>
              <Field label="Expiration date" error={errors.expiry}>
                <input
                  className={inputClass} style={inputStyle}
                  value={form.expiry}
                  onChange={(e) => setForm((f) => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                  placeholder="MM/YY"
                />
              </Field>
              <Field label="CVV" error={errors.cvv}>
                <input
                  className={inputClass} style={inputStyle}
                  value={form.cvv}
                  onChange={(e) => setForm((f) => ({ ...f, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                  placeholder="123"
                />
              </Field>
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-xl border p-6 mb-4" style={{ borderColor: BORDER }}>
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: STONE }}>Order summary</h2>
            <div className="flex flex-col gap-3 mb-4 max-h-56 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span style={{ color: INK }}>{item.name} × {item.qty}</span>
                  <span style={{ color: STONE }}>{money(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm mb-2 pt-3 border-t" style={{ borderColor: BORDER }}>
              <span style={{ color: STONE }}>Subtotal</span>
              <span style={{ color: INK }}>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span style={{ color: STONE }}>Shipping</span>
              <span style={{ color: INK }}>{shipping === 0 ? "Free" : money(shipping)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-3 border-t" style={{ borderColor: BORDER, color: INK }}>
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
          </div>
          <PrimaryButton type="submit" disabled={processing} className="w-full">
            {processing ? <><Loader2 size={16} className="animate-spin" /> Processing…</> : "Place order"}
          </PrimaryButton>
        </div>
      </form>
    </section>
  );
}

/* ---------------------------------------------------------------
   CONFIRMATION PAGE
---------------------------------------------------------------- */

function ConfirmationPage({ order, navigate }) {
  if (!order) {
    return (
      <div className="max-w-lg mx-auto px-5 py-24 text-center">
        <p className="text-sm mb-4" style={{ color: STONE }}>No recent order found.</p>
        <PrimaryButton onClick={() => navigate("home")}>Back to home</PrimaryButton>
      </div>
    );
  }
  return (
    <section className="max-w-2xl mx-auto px-5 sm:px-8 py-20 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ backgroundColor: "#E7F0E9" }}
      >
        <Check size={28} color={FOREST} />
      </div>
      <h1 className="text-3xl mb-2" style={{ fontFamily: "'Fraunces', serif", color: INK, fontWeight: 600 }}>Order confirmed!</h1>
      <p className="text-sm mb-8" style={{ color: STONE }}>Thank you for shopping with Shopest.</p>

      <div className="rounded-xl border p-6 text-left mb-8" style={{ borderColor: BORDER }}>
        <div className="flex justify-between text-sm mb-4 pb-4 border-b" style={{ borderColor: BORDER }}>
          <span style={{ color: STONE }}>Order number</span>
          <span className="font-semibold" style={{ color: INK }}>{order.number}</span>
        </div>
        <div className="flex flex-col gap-2 mb-4 pb-4 border-b" style={{ borderColor: BORDER }}>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-xs">
              <span style={{ color: INK }}>{item.name} × {item.qty}</span>
              <span style={{ color: STONE }}>{money(item.price * item.qty)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-base font-semibold mb-4" style={{ color: INK }}>
          <span>Total paid</span>
          <span>{money(order.total)}</span>
        </div>
        <p className="text-xs mb-1" style={{ color: STONE }}>
          Shipping to {order.customer.fullName}, {order.customer.address}, {order.customer.city}, {order.customer.country}
        </p>
        <p className="text-xs" style={{ color: STONE }}>Estimated delivery: 3–5 business days</p>
      </div>

      <div className="flex items-center justify-center gap-4">
        <GhostButton onClick={() => navigate("shop")}>Continue shopping</GhostButton>
        <PrimaryButton onClick={() => navigate("home")}>Back to home</PrimaryButton>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   FOOTER
---------------------------------------------------------------- */

function Footer({ navigate, setFilters }) {
  return (
    <footer style={{ backgroundColor: FOREST_DARK, color: "#EDEAE0" }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <div id="about" className="grid md:grid-cols-2 gap-12 pb-14 mb-14 border-b" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
          <div>
            <h2 className="text-xl mb-3" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>Meet the founder</h2>
            <p className="text-sm leading-relaxed" style={{ color: "#C9C6BA" }}>
              Shopest was created with the goal of making online shopping simple, modern, and accessible.
              Our mission is to provide customers with carefully selected products and a smooth shopping
              experience, from the first browse to the delivery at your door.
            </p>
          </div>
          <div id="contact">
            <h2 className="text-xl mb-3" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>Get in touch</h2>
            <ul className="text-sm flex flex-col gap-2.5" style={{ color: "#C9C6BA" }}>
              <li>Founder — [Founder name]</li>
              <li className="flex items-center gap-2"><Mail size={14} /> [founder@shopest.com]</li>
              <li className="flex items-center gap-2"><PhoneIcon size={14} /> [+000 00 000 000]</li>
            </ul>
            <div className="flex items-center gap-4 mt-4">
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-4 gap-10">
          <div>
            <p className="text-lg mb-2" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>Shopest</p>
            <p className="text-xs leading-relaxed" style={{ color: "#A9A69A" }}>
              A modern store for objects worth keeping.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#A9A69A" }}>Quick links</p>
            <ul className="text-sm flex flex-col gap-2">
              <li><button onClick={() => navigate("home")}>Home</button></li>
              <li><button onClick={() => navigate("shop")}>Shop</button></li>
              <li><button onClick={() => navigate("cart")}>Cart</button></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#A9A69A" }}>Categories</p>
            <ul className="text-sm flex flex-col gap-2">
              {CATEGORIES.map((c) => (
                <li key={c}>
                  <button onClick={() => { setFilters((f) => ({ ...f, category: c })); navigate("shop"); }}>{c}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#A9A69A" }}>Legal</p>
            <ul className="text-sm flex flex-col gap-2">
              <li><button>Privacy policy</button></li>
              <li><button>Terms & conditions</button></li>
            </ul>
          </div>
        </div>

        <p className="text-xs mt-14 pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.12)", color: "#8B8878" }}>
          © 2026 Shopest. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------------
   ROOT APP
---------------------------------------------------------------- */

export default function App() {
  const [page, setPage] = useState("home");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [toast, setToast] = useState("");
  const [order, setOrder] = useState(null);
  const [filters, setFilters] = useState({ search: "", category: "All", sort: "popularity", maxPrice: 95 });
  const toastTimer = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Inter:wght@400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2500);
  };

  const navigate = (target, params = {}) => {
    if (target === "product") setSelectedProductId(params.id);
    if (target === "categories") {
      setPage("home");
      setTimeout(() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" }), 50);
      return;
    }
    if (target === "about") {
      setPage((p) => p); // stay, footer is persistent
      setTimeout(() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }), 50);
      return;
    }
    if (target === "contact") {
      setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 50);
      return;
    }
    setPage(target);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const runSearch = (query) => {
    setFilters((f) => ({ ...f, search: query }));
    setPage("shop");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <CartProvider onToast={showToast}>
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: PAPER, color: INK, fontFamily: "'Inter', sans-serif" }}
      >
        <Navbar
          page={page}
          navigate={navigate}
          searchQuery={filters.search}
          setSearchQuery={(q) => setFilters((f) => ({ ...f, search: q }))}
          runSearch={runSearch}
        />

        <main className="flex-1">
          {page === "home" && <HomePage navigate={navigate} setFilters={setFilters} />}
          {page === "shop" && <ShopPage navigate={navigate} filters={filters} setFilters={setFilters} />}
          {page === "product" && <ProductDetailPage productId={selectedProductId} navigate={navigate} />}
          {page === "cart" && <CartPage navigate={navigate} />}
          {page === "checkout" && <CheckoutPage navigate={navigate} onPlaceOrder={setOrder} />}
          {page === "confirmation" && <ConfirmationPage order={order} navigate={navigate} />}
        </main>

        <Footer navigate={navigate} setFilters={setFilters} />
        <Toast message={toast} />
      </div>
    </CartProvider>
  );
}