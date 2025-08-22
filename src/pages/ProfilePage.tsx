import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ProfileSidebar from "../components/ProfileSidebar";
import ProfileMain from "../components/ProfileMain";
import ProfileRightSidebar from "../components/ProfileRightSidebar";
import { supabase } from "../lib/supabaseClient";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetchProfile();
        fetchPosts();
    }, [user]);

    async function fetchProfile() {
        setLoading(true);

        const { data, error } = await supabase
            .from("profiles")
            .select(`
            *,
            user:users(
                name,
                surname,
                email,
                phone,
                age,
                gender
            )
        `)
            .eq("user_id", user.id)
            .maybeSingle(); // safer than .single() if profile doesn't exist

        if (error) {
            console.error(error);
        } else if (!data) {
            // Optionally auto-create profile if missing
            const { data: newProfile, error: createError } = await supabase
                .from("profiles")
                .insert({ user_id: user.id })
                .select(`
                *,
                user:users(
                    name,
                    surname,
                    email,
                    phone,
                    age,
                    gender
                )
            `)
                .maybeSingle();

            if (createError) console.error(createError);
            else setProfile(newProfile);
        } else {
            setProfile(data);
        }

        setLoading(false);
    }


    async function fetchPosts() {
        const { data, error } = await supabase
            .from("posts")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
        if (error) console.error(error);
        else setPosts(data || []);
    }

    if (!user) return <div>Please login to view your profile.</div>;

    return (
        <div className="min-h-screen flex bg-[#1E1E1E] text-[#EEE]">
            {/* Left Sidebar */}
            <ProfileSidebar profile={profile} />

            {/* Main Center */}
            <ProfileMain profile={profile} posts={posts} loading={loading} />

            {/* Right Sidebar */}
            <ProfileRightSidebar profile={profile} />
        </div>
    );
}
