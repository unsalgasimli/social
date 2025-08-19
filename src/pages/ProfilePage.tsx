import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { FiSave, FiArrowLeft } from "react-icons/fi";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>({
        first_name: "",
        last_name: "",
        email: "",
        country: "Azərbaycan",
        city: "",
        university: "",
        faculty: "",
        school: "",
        work: "",
        field: "",
        interests: [] as string[],
        social_links: { linkedin: "", instagram: "", facebook: "" },
    });

    const azerbaijanCities = ["Bakı", "Gəncə", "Sumqayıt", "Mingəçevir", "Şəki", "Qəbələ", "Lənkəran"];
    const azerbaijanUniversities = [
        "Bakı Dövlət Universiteti",
        "Azərbaycan Texniki Universiteti",
        "ADA Universiteti",
        "Azərbaycan Dillər Universiteti",
        "Naxçıvan Dövlət Universiteti",
        "Gəncə Dövlət Universiteti",
    ];
    const allInterests = ["Texnologiya", "Səyahət", "Musiqi", "İdman", "Film", "Kitab", "Rəssamlıq", "Fotografiya", "Kulinariya"];

    useEffect(() => {
        if (!user) return;
        fetchProfile();
    }, [user]);

    async function fetchProfile() {
        setLoading(true);

        // Users məlumatlarını al
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

        if (userError) {
            console.error("Users fetch error:", userError.message);
        }

        // Profiles məlumatlarını al
        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (profileError && profileError.code !== "PGRST116") { // "no rows" error ignored
            console.error("Profiles fetch error:", profileError.message);
        }

        setProfile({
            first_name: userData?.name || "",
            last_name: userData?.surname || "",
            email: userData?.email || "",
            country: profileData?.country || "Azərbaycan",
            city: profileData?.city || "",
            university: profileData?.university || "",
            faculty: profileData?.faculty || "",
            school: profileData?.school || "",
            work: profileData?.work || "",
            field: profileData?.field || "",
            interests: profileData?.interests || [],
            social_links: profileData?.social_links || { linkedin: "", instagram: "", facebook: "" },
        });

        setLoading(false);
    }

    async function saveProfile() {
        if (!user) return;
        setLoading(true);

        try {
            // Users update (basic info)
            const { error: userError } = await supabase
                .from("users")
                .update({
                    name: profile.first_name,
                    surname: profile.last_name,
                    email: profile.email,
                })
                .eq("id", user.id);

            if (userError) console.error("Users update error:", userError.message);

            // Profiles upsert (extended info) with onConflict
            const { error: profileError } = await supabase
                .from("profiles")
                .upsert(
                    [
                        {
                            user_id: user.id,
                            country: profile.country,
                            city: profile.city,
                            university: profile.university,
                            faculty: profile.faculty,
                            school: profile.school,
                            work: profile.work,
                            field: profile.field,
                            interests: profile.interests,
                            social_links: profile.social_links,
                        },
                    ],
                    { onConflict: ["user_id"] } // <--- burada user_id konfliktini həll edir
                );

            if (profileError) console.error("Profiles upsert error:", profileError.message);

            alert("Profil uğurla yadda saxlanıldı!");
        } finally {
            setLoading(false);
        }
    }


    function toggleInterest(interest: string) {
        setProfile((prev: any) => {
            const interests = prev.interests.includes(interest)
                ? prev.interests.filter((i: string) => i !== interest)
                : [...prev.interests, interest];
            return { ...prev, interests };
        });
    }

    if (!user) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#222831] text-[#EEEEEE]">
                <div className="bg-[#31363F] p-6 rounded-xl shadow-lg w-96 text-center">
                    <h2 className="text-2xl font-bold mb-2 text-[#76ABAE]">Xoş gəldiniz</h2>
                    <p className="text-sm opacity-80 mb-4">Profil məlumatlarını görmək üçün daxil olun.</p>
                    <a href="/login" className="inline-block bg-[#76ABAE] text-[#222831] px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition">Login</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#222831] text-[#EEEEEE] flex flex-col">
            <nav className="flex justify-between items-center px-6 py-4 bg-[#31363F] shadow-md">
                <button onClick={() => window.history.back()} className="flex items-center gap-2 text-[#EEEEEE] hover:text-[#76ABAE] transition"><FiArrowLeft /> Back</button>
                <h1 className="text-xl font-bold text-[#76ABAE]">Profilim</h1>
                <button onClick={logout} className="flex items-center gap-2 text-[#EEEEEE] hover:text-[#76ABAE] transition">Logout</button>
            </nav>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {loading ? <p className="text-center text-[#76ABAE]">Yüklənir...</p> : (
                    <div className="max-w-xl mx-auto space-y-4">
                        {/* Basic Info */}
                        <div className="bg-[#31363F] rounded-xl p-4 shadow-md space-y-3">
                            <h2 className="text-lg font-semibold text-[#76ABAE]">Əsas məlumatlar</h2>
                            <input type="text" placeholder="Ad" value={profile.first_name} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[#222831] text-[#EEEEEE] focus:outline-none" />
                            <input type="text" placeholder="Soyad" value={profile.last_name} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[#222831] text-[#EEEEEE] focus:outline-none" />
                            <input type="email" placeholder="Email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[#222831] text-[#EEEEEE] focus:outline-none" />
                        </div>

                        {/* Extended Info */}
                        <div className="bg-[#31363F] rounded-xl p-4 shadow-md space-y-3">
                            <h2 className="text-lg font-semibold text-[#76ABAE]">Əlavə məlumatlar</h2>
                            <input type="text" placeholder="Ölkə" value={profile.country} disabled className="w-full px-4 py-2 rounded-lg bg-[#222831] text-[#AAAAAA] cursor-not-allowed focus:outline-none" />
                            <select value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[#222831] text-[#EEEEEE] focus:outline-none">
                                <option value="">Şəhər seçin</option>
                                {azerbaijanCities.map((city) => <option key={city} value={city}>{city}</option>)}
                            </select>
                            <select value={profile.university} onChange={(e) => setProfile({ ...profile, university: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[#222831] text-[#EEEEEE] focus:outline-none">
                                <option value="">Universitet seçin</option>
                                {azerbaijanUniversities.map((uni) => <option key={uni} value={uni}>{uni}</option>)}
                            </select>
                            <input type="text" placeholder="Fakültə" value={profile.faculty} onChange={(e) => setProfile({ ...profile, faculty: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[#222831] text-[#EEEEEE] focus:outline-none" />
                            <input type="text" placeholder="Məktəb" value={profile.school} onChange={(e) => setProfile({ ...profile, school: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[#222831] text-[#EEEEEE] focus:outline-none" />
                            <input type="text" placeholder="İş yeri" value={profile.work} onChange={(e) => setProfile({ ...profile, work: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[#222831] text-[#EEEEEE] focus:outline-none" />
                            <input type="text" placeholder="Sahə / ixtisas" value={profile.field} onChange={(e) => setProfile({ ...profile, field: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-[#222831] text-[#EEEEEE] focus:outline-none" />
                        </div>

                        {/* Interests */}
                        <div className="bg-[#31363F] rounded-xl p-4 shadow-md space-y-3">
                            <h2 className="text-lg font-semibold text-[#76ABAE]">Maraq dairələri</h2>
                            <div className="flex flex-wrap gap-2">
                                {allInterests.map((interest) => (
                                    <label key={interest} className={`px-3 py-1 rounded-lg cursor-pointer border transition ${profile.interests.includes(interest) ? "bg-[#76ABAE] text-[#222831]" : "border-gray-600 text-[#EEEEEE]"}`}>
                                        <input type="checkbox" className="hidden" checked={profile.interests.includes(interest)} onChange={() => toggleInterest(interest)} />
                                        {interest}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="bg-[#31363F] rounded-xl p-4 shadow-md space-y-3">
                            <h2 className="text-lg font-semibold text-[#76ABAE]">Sosial media linkləri</h2>
                            <input type="text" placeholder="LinkedIn" value={profile.social_links.linkedin} onChange={(e) => setProfile({ ...profile, social_links: { ...profile.social_links, linkedin: e.target.value } })} className="w-full px-4 py-2 rounded-lg bg-[#222831] text-[#EEEEEE] focus:outline-none" />
                            <input type="text" placeholder="Instagram" value={profile.social_links.instagram} onChange={(e) => setProfile({ ...profile, social_links: { ...profile.social_links, instagram: e.target.value } })} className="w-full px-4 py-2 rounded-lg bg-[#222831] text-[#EEEEEE] focus:outline-none" />
                            <input type="text" placeholder="Facebook" value={profile.social_links.facebook} onChange={(e) => setProfile({ ...profile, social_links: { ...profile.social_links, facebook: e.target.value } })} className="w-full px-4 py-2 rounded-lg bg-[#222831] text-[#EEEEEE] focus:outline-none" />
                        </div>

                        {/* Save Button */}
                        <button onClick={saveProfile} className="w-full bg-[#76ABAE] text-[#222831] px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
                            <FiSave /> Yadda saxla
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
