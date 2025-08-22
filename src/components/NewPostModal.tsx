import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function NewPostModal({ user, isOpen, onClose, addPost }: any) {
    const [description, setDescription] = useState("");
    const [media, setMedia] = useState<File | null>(null);
    const [commentsEnabled, setCommentsEnabled] = useState(true);
    const [links, setLinks] = useState<string[]>([]);
    const [taggedUsers, setTaggedUsers] = useState<any[]>([]);
    const [taggedCommunities, setTaggedCommunities] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [allCommunities, setAllCommunities] = useState<any[]>([]);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        if (!isOpen || !user) return;
        fetchUsers();
        fetchCommunities();
    }, [isOpen, user]);

    const fetchUsers = async () => {
        if (!user) return; // extra safety
        const { data, error } = await supabase
            .from("users")
            .select("id, name, surname")
            .neq("id", user.id);
        if (!error) setAllUsers(data || []);
    };


    const fetchCommunities = async () => {
        const { data, error } = await supabase
            .from("communities")
            .select("id, name");
        if (!error) setAllCommunities(data || []);
    };

    if (!isOpen) return null;

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setMedia(e.target.files[0]);
        }
    };

    const handleAddPost = async () => {
        if (!description && !media) return;
        setPosting(true);

        try {
            let media_url = null;

            if (media) {
                const fileExt = media.name.split(".").pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const { data, error } = await supabase.storage
                    .from("posts-media")
                    .upload(fileName, media);
                if (error) throw error;

                media_url = supabase.storage
                    .from("posts-media")
                    .getPublicUrl(data.path).publicUrl;
            }

            const { data: newPost, error } = await supabase
                .from("posts")
                .insert([{
                    user_id: user.id,
                    content: description,
                    media_url,
                    votes: 0,
                    category: "general",
                    // optional fields
                    comments_enabled: commentsEnabled,
                    tagged_users: taggedUsers.map(u => u.id),
                    tagged_communities: taggedCommunities.map(c => c.id),
                    links
                }])
                .select()
                .single();

            if (error) throw error;

            addPost(newPost);
            onClose();
            setDescription("");
            setMedia(null);
            setTaggedUsers([]);
            setTaggedCommunities([]);
            setLinks([]);
        } catch (err) {
            console.error(err);
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-[#1E1E1E] p-6 rounded-lg w-96 max-w-full space-y-4">
                <h2 className="text-xl font-bold">New Post</h2>

                <textarea
                    placeholder="Write something..."
                    className="w-full p-2 rounded-md bg-[#2C2C2C] text-white resize-none"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <input type="file" accept="image/*,video/*" onChange={handleMediaChange} />

                <div className="flex gap-2 items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={commentsEnabled}
                            onChange={() => setCommentsEnabled(!commentsEnabled)}
                        />
                        Enable Comments
                    </label>
                </div>

                {/* Tag Users */}
                <div>
                    <label className="text-sm opacity-70">Tag People:</label>
                    <select
                        multiple
                        value={taggedUsers.map(u => u.id)}
                        onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                            setTaggedUsers(allUsers.filter(u => selected.includes(u.id)));
                        }}
                        className="w-full p-2 rounded-md bg-[#2C2C2C] text-white"
                    >
                        {allUsers.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.name} {u.surname}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tag Communities */}
                <div>
                    <label className="text-sm opacity-70">Tag Communities:</label>
                    <select
                        multiple
                        value={taggedCommunities.map(c => c.id)}
                        onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                            setTaggedCommunities(allCommunities.filter(c => selected.includes(c.id)));
                        }}
                        className="w-full p-2 rounded-md bg-[#2C2C2C] text-white"
                    >
                        {allCommunities.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Links */}
                <div>
                    <label className="text-sm opacity-70">Add Links:</label>
                    <input
                        type="text"
                        placeholder="Paste link and press Enter"
                        className="w-full p-2 rounded-md bg-[#2C2C2C] text-white"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && e.currentTarget.value) {
                                setLinks([...links, e.currentTarget.value]);
                                e.currentTarget.value = "";
                            }
                        }}
                    />
                    <div className="flex flex-wrap gap-2 mt-1">
                        {links.map((link, i) => (
                            <span key={i} className="bg-[#76ABAE] px-2 py-1 rounded-full text-sm">
                                {link}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddPost}
                        disabled={posting}
                        className="px-4 py-2 rounded-md bg-[#76ABAE] disabled:opacity-50"
                    >
                        {posting ? "Posting..." : "Post"}
                    </button>
                </div>
            </div>
        </div>
    );
}
