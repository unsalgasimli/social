// src/components/Navbar.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiLogOut, FiSettings, FiUser, FiMenu, FiX, FiPlus } from "react-icons/fi";

type UserLike = {
    id: string;
    email?: string;
    name?: string;
    fullName?: string;
    avatar_url?: string;
    profileUrl?: string;
};

const palette = {
    bg: "#222831",
    surface: "#31363F",
    accent: "#76ABAE",
    text: "#EEEEEE",
};

const navLinks: Array<{ label: string; to: string }> = [
    { label: "Ana səhifə", to: "/" },
    { label: "Kəşf et", to: "/explore" },
    { label: "İcmalar", to: "/communities" },
    { label: "Haqqımızda", to: "/about" },
];

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

export function Navbar() {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [query, setQuery] = useState("");

    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const displayName = useMemo(
        () => user?.name || user?.fullName || user?.email || "İstifadəçi",
        [user]
    );

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (!dropdownRef.current) return;
            if (!dropdownRef.current.contains(e.target as Node)) setMenuOpen(false);
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
        setMenuOpen(false);
    }, [location.pathname]);

    function onSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        navigate(`/search?q=${encodeURIComponent(q)}`);
    }

    const activeLink = ({ isActive }: { isActive: boolean }) =>
        classNames(
            "px-3 py-2 rounded-lg transition-colors text-sm md:text-[15px] font-medium",
            isActive
                ? "bg-[#222831] text-[#EEEEEE] border border-[#76ABAE66]"
                : "text-[#EEEEEE]/85 hover:text-[#EEEEEE] hover:bg-[#222831]"
        );

    return (
        <header className="sticky top-0 z-50 w-full border-b" style={{ backgroundColor: palette.surface, borderColor: "#293038" }}>
            <nav className="mx-auto max-w-[1300px] px-4 md:px-6">
                <div className="h-16 flex items-center justify-between gap-3">
                    {/* Left */}
                    <div className="flex items-center gap-3">
                        <button
                            aria-label={mobileOpen ? "Menyunu bağla" : "Menyunu aç"}
                            className="md:hidden p-2 rounded-lg hover:opacity-90"
                            style={{ backgroundColor: "transparent", color: palette.text }}
                            onClick={() => setMobileOpen((v) => !v)}
                        >
                            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                        </button>

                        <Link to="/" className="flex items-center gap-2 group" aria-label="MyReddit ana səhifə">
                            <div className="w-9 h-9 rounded-xl grid place-items-center shadow" style={{ background: palette.bg, color: palette.accent }}>
                                <span className="text-lg font-black">R</span>
                            </div>
                            <span className="text-xl font-extrabold tracking-tight group-hover:opacity-95" style={{ color: palette.accent }}>
                                MyReddit
                            </span>
                        </Link>
                    </div>

                    {/* Center */}
                    <form onSubmit={onSearchSubmit} className="hidden md:flex flex-1 max-w-xl">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Axtar…"
                            className="w-full rounded-lg outline-none px-4 py-2 text-sm"
                            style={{
                                backgroundColor: palette.bg,
                                color: palette.text,
                                border: "1px solid rgba(118,171,174,0.35)",
                            }}
                        />
                    </form>

                    {/* Right */}
                    <div className="flex items-center gap-3">
                        {user && (
                            <Link to="/submit" className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition" style={{ backgroundColor: palette.accent, color: palette.bg }}>
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
                                        <img src={user.avatar_url} alt={displayName} className="w-8 h-8 rounded-lg object-cover border" style={{ borderColor: "#2a313a" }} />
                                    ) : (
                                        <div className="w-8 h-8 rounded-lg grid place-items-center font-bold" style={{ backgroundColor: palette.surface, color: palette.accent, border: "1px solid #2a313a" }}>
                                            {getInitials(displayName)}
                                        </div>
                                    )}
                                    <span className="hidden sm:block text-sm font-semibold">{displayName}</span>
                                </button>

                                {menuOpen && (
                                    <div role="menu" className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: palette.bg, border: "1px solid #2a313a" }}>
                                        <Link to="/profile" role="menuitem" className="flex items-center gap-3 px-4 py-3 hover:bg-[#31363F] transition text-sm" style={{ color: palette.text }}>
                                            <FiUser />
                                            Profil
                                        </Link>
                                        <Link to="/settings" role="menuitem" className="flex items-center gap-3 px-4 py-3 hover:bg-[#31363F] transition text-sm" style={{ color: palette.text }}>
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
                                <Link to="/login" className="px-4 py-2 rounded-lg font-semibold transition" style={{ backgroundColor: palette.accent, color: palette.bg }}>
                                    Daxil ol
                                </Link>
                                <Link to="/register" className="px-4 py-2 rounded-lg font-semibold border transition" style={{ color: palette.accent, borderColor: "rgba(118,171,174,0.5)" }}>
                                    Qeydiyyat
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-1 pb-3">{navLinks.map((l) => <NavLink key={l.to} to={l.to} className={activeLink}>{l.label}</NavLink>)}</div>
            </nav>

            {/* Mobile sheet */}
            {mobileOpen && (
                <div className="md:hidden border-t" style={{ borderColor: "#293038", backgroundColor: palette.surface }}>
                    <div className="px-4 pb-4 pt-3 space-y-3">
                        <form onSubmit={onSearchSubmit} className="w-full">
                            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Axtar…" className="w-full rounded-lg outline-none px-4 py-2 text-sm" style={{ backgroundColor: palette.bg, color: palette.text, border: "1px solid rgba(118,171,174,0.35)" }} />
                        </form>

                        <div className="grid gap-2">
                            {navLinks.map((l) => (
                                <NavLink key={l.to} to={l.to} className={({ isActive }) => classNames("px-3 py-2 rounded-lg text-sm font-medium", isActive ? "bg-[#222831] text-[#EEEEEE] border border-[#76ABAE66]" : "text-[#EEEEEE]/85 hover:text-[#EEEEEE] hover:bg-[#222831]")}>
                                    {l.label}
                                </NavLink>
                            ))}
                        </div>

                        <div className="pt-2 border-t" style={{ borderColor: "#293038" }}>
                            {user ? (
                                <div className="flex items-center justify-between pt-3">
                                    <Link to="/profile" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                                        {user?.avatar_url ? (
                                            <img src={user.avatar_url} alt={displayName} className="w-9 h-9 rounded-lg object-cover border" style={{ borderColor: "#2a313a" }} />
                                        ) : (
                                            <div className="w-9 h-9 rounded-lg grid place-items-center font-bold" style={{ backgroundColor: palette.bg, color: palette.accent, border: "1px solid #2a313a" }}>
                                                {getInitials(displayName)}
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="text-[#EEEEEE] text-sm font-semibold">{displayName}</span>
                                            <span className="text-[#EEEEEE]/60 text-xs">Profili görüntülə</span>
                                        </div>
                                    </Link>
                                    <button onClick={logout} className="px-3 py-2 rounded-lg font-semibold transition" style={{ backgroundColor: palette.accent, color: palette.bg }}>
                                        Çıxış
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 pt-3">
                                    <Link to="/login" className="flex-1 text-center px-3 py-2 rounded-lg font-semibold transition" style={{ backgroundColor: palette.accent, color: palette.bg }}>
                                        Daxil ol
                                    </Link>
                                    <Link to="/register" className="flex-1 text-center px-3 py-2 rounded-lg font-semibold border transition" style={{ color: palette.accent, borderColor: "rgba(118,171,174,0.5)" }}>
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

export default Navbar;
