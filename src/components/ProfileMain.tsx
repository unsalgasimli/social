import { useState } from "react";
import PostCard from "./PostCard";
import NewPostModal from "./NewPostModal";

export default function ProfileMain({ profile, posts, setPosts, loading, user }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const addPost = (post: any) => {
        setPosts((prev: any[]) => [post, ...prev]);
    };

    if (loading) return <div className="flex-1 p-6">Loading...</div>;

    return (
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Profile Header */}
            <div className="flex gap-4 items-center bg-[#2C2C2C] p-4 rounded-lg">
                <img
                    src={profile?.avatar_url || "/default-avatar.png"}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                    <h1 className="text-2xl font-bold">
                        {profile?.user?.name} {profile?.user?.surname}
                    </h1>
                    <p>{profile?.user?.gender}, {profile?.user?.age} yaş</p>
                    <p className="text-sm opacity-70">{profile?.bio}</p>
                </div>
            </div>

            {/* New Post Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-[#76ABAE] text-[#1E1E1E] py-2 rounded-lg"
            >
                Create New Post
            </button>

            <NewPostModal
                user={user}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                addPost={addPost}
            />

            {/* Posts */}
            <div className="space-y-4">
                {posts.length === 0 && <p className="text-center opacity-60">No posts yet.</p>}
                {posts.map((post: any) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </main>
    );
}
