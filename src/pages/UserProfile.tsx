// src/pages/UserProfile.tsx (New or Updated Profile Page for Viewing Any User)
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileSidebar from "../components/ProfileSidebar";
import ProfileMain from "../components/ProfileMain";
import ProfileRightSidebar from "../components/ProfileRightSidebar";
import { supabase } from "../lib/supabaseClient";

export default function UserProfile() {
    const { user } = useAuth(); // Logged-in user
    const { id } = useParams<{ id: string }>(); // URL param for viewed user
    const viewUserId = id || user?.id; // If no id, show own profile
    const isOwnProfile = viewUserId === user?.id;

    const [profile, setProfile] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        if (!viewUserId) return;
        fetchProfile();
        fetchPosts();
        if (!isOwnProfile && user) {
            checkFollowing();
        }
    }, [viewUserId, user]);

    async function fetchProfile() {
        setLoading(true);
        const { data, error } = await supabase
            .from("profiles")
            .select(`
        *,
        user:users(name, surname, email, phone, age, gender)
      `)
            .eq("user_id", viewUserId)
            .maybeSingle();

        if (error) {
            console.error(error);
        } else if (data) {
            setProfile(data);
        }
        setLoading(false);
    }

    async function fetchPosts() {
        const { data, error } = await supabase
            .from("posts")
            .select("*")
            .eq("user_id", viewUserId)
            .order("created_at", { ascending: false });
        if (error) console.error(error);
        else setPosts(data || []);
    }

    async function checkFollowing() {
        const { count } = await supabase
            .from("follows")
            .select("count", { count: "exact" })
            .eq("follower_id", user.id)
            .eq("followed_id", viewUserId);
        setIsFollowing(count > 0);
    }

    async function handleFollow() {
        if (isFollowing) {
            // Unfollow
            await supabase
                .from("follows")
                .delete()
                .eq("follower_id", user.id)
                .eq("followed_id", viewUserId);
            setIsFollowing(false);
        } else {
            // Follow
            await supabase
                .from("follows")
                .insert({ follower_id: user.id, followed_id: viewUserId });
            setIsFollowing(true);
        }
    }

    if (loading) return <div className="flex-1 p-6">Loading...</div>;
    if (!profile) return <div className="flex-1 p-6">Profile not found.</div>;

    return (
        <div className="min-h-screen flex bg-[#1E1E1E] text-[#EEE]">
            {/* Left Sidebar */}
            <ProfileSidebar profile={profile} />

            {/* Main Center */}
            <ProfileMain profile={profile} posts={posts} setPosts={setPosts} loading={loading} user={user} />

            {/* Right Sidebar with Follow Button if not own */}
            <aside className="w-64 bg-[#2A2A2A] p-4 flex flex-col gap-4">
                {!isOwnProfile && user && (
                    <button
                        onClick={handleFollow}
                        className="w-full bg-[#76ABAE] text-[#1E1E1E] py-2 rounded-lg"
                    >
                        {isFollowing ? "Unfollow" : "Follow"}
                    </button>
                )}
                <ProfileRightSidebar profile={profile} />
            </aside>
        </div>
    );
}