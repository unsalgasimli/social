// src/components/Navbar.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    FiLogOut,
    FiSettings,
    FiUser,
    FiMenu,
    FiX,
    FiPlus,
    FiSearch,
} from "react-icons/fi";
import { supabase } from "../lib/supabaseClient";

// Types
type UserLike = {
    id: string;
    email?: string;
    name?: string;
    surname?: string;
    fullName?: string;
    avatar_url?: string;
};

type CommunityLike = {
    id: string;
    name: string;
};

type SearchResult =
    | ({ type: "user" } & UserLike)
    | ({ type: "community" } & CommunityLike)
    | { type: "tag"; name: string };

type NavLinkItem = { label: string; to: string };

// Palette
const palette = {
    bg: "#222831",
    surface: "#31363F",
    accent: "#76ABAE",
    text: "#EEEEEE",
};

// Navigation Links
const navLinks: NavLinkItem[] = [
    { label: "Ana səhifə", to: "/" },
    { label: "Kəşf et", to: "/explore" },
    { label: "İcmalar", to: "/communities" },
    { label: "Haqqımızda", to: "/about" },
];

// Utilities
function classNames(...xs: Array<string | false | null | undefined>) {
    return xs.filter(Boolean).join(" ");
}

function getInitials(nameLike?: string) {
    if (!nameLike) return "U";
    const parts = nameLike.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return (first + last || first || "U").toUpperCase();
}

// Navbar Component
export default function Navbar() {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // Display Name
    const displayName = useMemo(
        () => user?.name || user?.fullName || user?.email || "İstifadəçi",
        [user]
    );

    // Close menu when clicking outside
    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (
                !dropdownRef.current?.contains(e.target as Node) &&
                !searchRef.current?.contains(e.target as Node)
            ) {
                setMenuOpen(false);
                setSearchResults([]);
            }
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    // Close mobile menu when navigating
    useEffect(() => {
        setMobileOpen(false);
        setMenuOpen(false);
    }, [location.pathname]);

    // Fetch search results from Supabase
    const fetchSearchResults = async (q: string) => {
        if (!q.trim()) {
            setSearchResults([]);
            return;
        }
        setLoadingSearch(true);

        try {
            // Users
            const { data: users, error: userError } = await supabase
                .from<{ id: string; name: string; surname: string; avatar_url?: string }>("users")
                .select("id, name, surname, avatar_url")
                .or(`name.ilike.%${q}%,surname.ilike.%${q}%`) // search both name and surname
                .limit(5);

            if (userError) {
                console.error("Users search error:", userError.message);
            }

// Communities
            const { data: communities, error: communityError } = await supabase
                .from<{ id: string; name: string }>("communities")
                .select("id, name")
                .ilike("name", `%${q}%`)
                .limit(5);

            if (communityError) {
                console.error("Communities search error:", communityError.message);
            }


            const { data: posts } = await supabase
                .from("posts")
                .select("tags")
                .contains("tags", [q.toLowerCase()]);

            const results: SearchResult[] = [];

            users?.forEach((u) => results.push({ type: "user", ...u }));
            communities?.forEach((c) => results.push({ type: "community", ...c }));
            posts?.forEach((p) =>
                p.tags?.forEach((tag: string) => {
                    if (tag.toLowerCase().includes(q.toLowerCase()))
                        results.push({ type: "tag", name: tag });
                })
            );

            setSearchResults(results);
        } finally {
            setLoadingSearch(false);
        }
    };

    // Debounce search input
    const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => fetchSearchResults(val), 300);
    };

    // Handle form submit
    const onSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    // Navigate when clicking result
    const onResultClick = (item: SearchResult) => {
        if (item.type === "user") navigate(`/profile/${item.id}`);
        else if (item.type === "community") navigate(`/community/${item.id}`);
        else if (item.type === "tag") navigate(`/search?tag=${item.name}`);
        setQuery("");
        setSearchResults([]);
    };

    // Active link styling
    const activeLink = ({ isActive }: { isActive: boolean }) =>
        classNames(
            "px-3 py-2 rounded-lg transition-colors text-sm md:text-[15px] font-medium",
            isActive
                ? "bg-[#222831] text-[#EEEEEE] border border-[#76ABAE66]"
                : "text-[#EEEEEE]/85 hover:text-[#EEEEEE] hover:bg-[#222831]"
        );

    return (
        <header
            className="sticky top-0 z-50 w-full border-b"
            style={{ backgroundColor: palette.surface, borderColor: "#293038" }}
        >
            <nav className="mx-auto max-w-[1300px] px-4 md:px-6">
                <div className="h-16 flex items-center justify-between gap-3">
                    {/* Left */}
                    <div className="flex items-center gap-3">
                        {/* Mobile menu toggle */}
                        <button
                            aria-label={mobileOpen ? "Menyunu bağla" : "Menyunu aç"}
                            className="md:hidden p-2 rounded-lg hover:opacity-90"
                            style={{ backgroundColor: "transparent", color: palette.text }}
                            onClick={() => setMobileOpen((v) => !v)}
                        >
                            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                        </button>

                        {/* Logo */}
                        <Link
                            to="/"
                            className="flex items-center gap-2 group"
                            aria-label="ana səhifə"
                        >
                            <div
                                className="w-9 h-9 rounded-xl grid place-items-center shadow"
                                style={{ background: palette.bg, color: palette.accent }}
                            >
                                <span className="text-lg font-black">R</span>
                            </div>
                            <span
                                className="text-xl font-extrabold tracking-tight group-hover:opacity-95"
                                style={{ color: palette.accent }}
                            >
                BirOlaq
              </span>
                        </Link>
                    </div>

                    {/* Center Search */}
                    <div className="relative flex-1 max-w-xl" ref={searchRef}>
                        <form onSubmit={onSearchSubmit}>
                            <input
                                value={query}
                                onChange={onQueryChange}
                                placeholder="Axtar…"
                                className="w-full rounded-lg outline-none px-4 py-2 text-sm pl-10"
                                style={{
                                    backgroundColor: palette.bg,
                                    color: palette.text,
                                    border: "1px solid rgba(118,171,174,0.35)",
                                }}
                            />
                            <FiSearch
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#76ABAE]"
                            />
                        </form>

                        {/* Dropdown Results */}
                        {searchResults.length > 0 && (
                            <ul className="absolute z-50 top-full mt-1 w-full bg-[#31363F] rounded-md shadow-lg max-h-64 overflow-y-auto">
                                {searchResults.map((item, idx) => (
                                    <li
                                        key={idx}
                                        className="px-4 py-2 hover:bg-[#222831] cursor-pointer flex items-center gap-2"
                                        onClick={() => onResultClick(item)}
                                    >
                                        {item.type === "user" && (
                                            <>
                                                <img
                                                    src={item.avatar_url || "/default-avatar.png"}
                                                    alt={item.name}
                                                    className="w-6 h-6 rounded-full object-cover"
                                                />
                                                <span>
                          {item.name} {item.surname}
                        </span>
                                            </>
                                        )}
                                        {item.type === "community" && (
                                            <span>📘 {item.name}</span>
                                        )}
                                        {item.type === "tag" && <span>🏷️ #{item.name}</span>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3">
                        {user && (
                            <Link
                                to="/submit"
                                className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition"
                                style={{ backgroundColor: palette.accent, color: palette.bg }}
                            >
                                <FiPlus />
                                Göndər
                            </Link>
                        )}

                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setMenuOpen((v) => !v)}
                                    className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:opacity-95 transition"
                                    style={{ backgroundColor: palette.bg, color: palette.text }}
                                    aria-haspopup="menu"
                                    aria-expanded={menuOpen}
                                >
                                    {user.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={displayName}
                                            className="w-8 h-8 rounded-lg object-cover border"
                                            style={{ borderColor: "#2a313a" }}
                                        />
                                    ) : (
                                        <div
                                            className="w-8 h-8 rounded-lg grid place-items-center font-bold"
                                            style={{
                                                backgroundColor: palette.surface,
                                                color: palette.accent,
                                                border: "1px solid #2a313a",
                                            }}
                                        >
                                            {getInitials(displayName)}
                                        </div>
                                    )}
                                    <span className="hidden sm:block text-sm font-semibold">
                    {displayName}
                  </span>
                                </button>

                                {menuOpen && (
                                    <div
                                        role="menu"
                                        className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg overflow-hidden"
                                        style={{ backgroundColor: palette.bg, border: "1px solid #2a313a" }}
                                    >
                                        <Link
                                            to="/profile"
                                            role="menuitem"
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-[#31363F] transition text-sm"
                                            style={{ color: palette.text }}
                                        >
                                            <FiUser />
                                            Profil
                                        </Link>
                                        <Link
                                            to="/profileInfo"
                                            role="menuitem"
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-[#31363F] transition text-sm"
                                            style={{ color: palette.text }}
                                        >
                                            <FiSettings />
                                            Tənzimləmələr
                                        </Link>
                                        <button
                                            role="menuitem"
                                            onClick={logout}
                                            className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-[#31363F] transition text-sm"
                                            style={{ color: palette.text }}
                                        >
                                            <FiLogOut />
                                            Çıxış
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 rounded-lg font-semibold transition"
                                    style={{ backgroundColor: palette.accent, color: palette.bg }}
                                >
                                    Daxil ol
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 rounded-lg font-semibold border transition"
                                    style={{
                                        color: palette.accent,
                                        borderColor: "rgba(118,171,174,0.5)",
                                    }}
                                >
                                    Qeydiyyat
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-1 pb-3">
                    {navLinks.map((l) => (
                        <NavLink key={l.to} to={l.to} className={activeLink}>
                            {l.label}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Mobile sheet */}
            {mobileOpen && (
                <div
                    className="md:hidden border-t"
                    style={{ borderColor: "#293038", backgroundColor: palette.surface }}
                >
                    <div className="px-4 pb-4 pt-3 space-y-3">
                        <form onSubmit={onSearchSubmit} className="w-full">
                            <input
                                value={query}
                                onChange={onQueryChange}
                                placeholder="Axtar…"
                                className="w-full rounded-lg outline-none px-4 py-2 text-sm"
                                style={{
                                    backgroundColor: palette.bg,
                                    color: palette.text,
                                    border: "1px solid rgba(118,171,174,0.35)",
                                }}
                            />
                        </form>

                        <div className="grid gap-2">
                            {navLinks.map((l) => (
                                <NavLink
                                    key={l.to}
                                    to={l.to}
                                    className={({ isActive }) =>
                                        classNames(
                                            "px-3 py-2 rounded-lg text-sm font-medium",
                                            isActive
                                                ? "bg-[#222831] text-[#EEEEEE] border border-[#76ABAE66]"
                                                : "text-[#EEEEEE]/85 hover:text-[#EEEEEE] hover:bg-[#222831]"
                                        )
                                    }
                                >
                                    {l.label}
                                </NavLink>
                            ))}
                        </div>

                        <div className="pt-2 border-t" style={{ borderColor: "#293038" }}>
                            {user ? (
                                <div className="flex items-center justify-between pt-3">
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-3"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {user?.avatar_url ? (
                                            <img
                                                src={user.avatar_url}
                                                alt={displayName}
                                                className="w-9 h-9 rounded-lg object-cover border"
                                                style={{ borderColor: "#2a313a" }}
                                            />
                                        ) : (
                                            <div
                                                className="w-9 h-9 rounded-lg grid place-items-center font-bold"
                                                style={{
                                                    backgroundColor: palette.bg,
                                                    color: palette.accent,
                                                    border: "1px solid #2a313a",
                                                }}
                                            >
                                                {getInitials(displayName)}
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                      <span className="text-[#EEEEEE] text-sm font-semibold">
                        {displayName}
                      </span>
                                            <span className="text-[#EEEEEE]/60 text-xs">
                        Profili görüntülə
                      </span>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="px-3 py-2 rounded-lg font-semibold transition"
                                        style={{ backgroundColor: palette.accent, color: palette.bg }}
                                    >
                                        Çıxış
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 pt-3">
                                    <Link
                                        to="/login"
                                        className="flex-1 text-center px-3 py-2 rounded-lg font-semibold transition"
                                        style={{ backgroundColor: palette.accent, color: palette.bg }}
                                    >
                                        Daxil ol
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="flex-1 text-center px-3 py-2 rounded-lg font-semibold border transition"
                                        style={{
                                            color: palette.accent,
                                            borderColor: "rgba(118,171,174,0.5)",
                                        }}
                                    >
                                        Qeydiyyat
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
