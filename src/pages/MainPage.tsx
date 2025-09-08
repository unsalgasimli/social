import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";
import { FiLogOut, FiThumbsUp, FiThumbsDown, FiPlus } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

type Post = {
    id: number;
    content: string;
    created_at: string;
    votes: number;
    user_id: string;
};

export default function MainPage() {
    const { user, logout } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState("");

    useEffect(() => {
        fetchPosts();
    }, []);

    async function fetchPosts() {
        setLoading(true);
        const { data, error } = await supabase
            .from<Post>("posts")
            .select("id, content, created_at, votes, user_id")
            .order("created_at", { ascending: false });

        if (!error && data) setPosts(data);
        setLoading(false);
    }

    async function addPost() {
        if (!newPost.trim() || !user) return;

        const newEntry: Omit<Post, "id"> = {
            content: newPost,
            user_id: user.id,
            votes: 0,
            created_at: new Date().toISOString(),
        };

        // Optimistic UI update
        setPosts((prev) => [newEntry as Post, ...prev]);
        setNewPost("");

        const { error } = await supabase.from("posts").insert([newEntry]);

        if (error) {
            console.error("Post əlavə edilə bilmədi:", error.message);
            fetchPosts();
        }
    }

    async function vote(postId: number, change: number) {
        const post = posts.find((p) => p.id === postId);
        if (!post) return;

        const newVotes = (post.votes || 0) + change;

        setPosts((prev) =>
            prev.map((p) => (p.id === postId ? { ...p, votes: newVotes } : p))
        );

        const { error } = await supabase.from("posts").update({ votes: newVotes }).eq("id", postId);

        if (error) {
            console.error("Vote update error:", error.message);
            fetchPosts();
        }
    }

    if (!user) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#222831] text-[#EEEEEE]">
                <div className="bg-[#31363F] p-6 rounded-xl shadow-lg w-96 text-center">
                    <h2 className="text-2xl font-bold mb-2 text-[#76ABAE]">Xoş gəldiniz</h2>
                    <p className="text-sm opacity-80 mb-4">Postları görmək üçün daxil olun.</p>
                    <a
                        href="/login"
                        className="inline-block bg-[#76ABAE] text-[#222831] px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                    >
                        Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#222831] text-[#EEEEEE] flex flex-col">
            <nav className="flex justify-between items-center px-6 py-4 bg-[#31363F] shadow-md">
                <h1 className="text-xl font-bold text-[#76ABAE]">MyRedditClone</h1>
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 text-[#EEEEEE] hover:text-[#76ABAE] transition"
                >
                    <FiLogOut /> Logout
                </button>
            </nav>

            <div className="p-6 bg-[#31363F] flex gap-2 items-center">
                <input
                    type="text"
                    placeholder="Paylaşmaq istədiyinizi yazın..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg bg-[#222831] text-[#EEEEEE] focus:outline-none"
                />
                <button
                    onClick={addPost}
                    className="bg-[#76ABAE] text-[#222831] px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2"
                >
                    <FiPlus /> Post
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loading ? (
                    <p className="text-center text-[#76ABAE]">Yüklənir...</p>
                ) : posts.length === 0 ? (
                    <p className="text-center text-gray-400">Hələ post yoxdur.</p>
                ) : (
                    posts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-[#31363F] rounded-xl p-4 shadow-md flex justify-between items-center hover:shadow-lg transition"
                        >
                            <div>
                                <p className="text-base">{post.content}</p>
                                <span className="text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleString()}
                </span>
                            </div>
                            <div className="flex gap-3 items-center">
                                <button onClick={() => vote(post.id, 1)} className="hover:text-green-400 transition">
                                    <FiThumbsUp />
                                </button>
                                <span className="font-semibold">{post.votes ?? 0}</span>
                                <button onClick={() => vote(post.id, -1)} className="hover:text-red-400 transition">
                                    <FiThumbsDown />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
