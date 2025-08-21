import { FiMusic, FiFilm, FiBook } from "react-icons/fi";

export default function ProfileSidebar({ profile }: any) {
    const categories = [
        { name: "Music", icon: <FiMusic /> },
        { name: "Film", icon: <FiFilm /> },
        { name: "Books", icon: <FiBook /> },
    ];

    return (
        <aside className="w-64 bg-[#2A2A2A] p-4 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-[#76ABAE]">Categories</h2>
            {categories.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2 cursor-pointer hover:bg-[#333] p-2 rounded">
                    {cat.icon}
                    <span>{cat.name}</span>
                </div>
            ))}

            {/* Optional external links */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-[#76ABAE]">Links</h3>
                {profile?.spotify_link && (
                    <a href={profile.spotify_link} target="_blank" className="block hover:underline">Spotify</a>
                )}
                {profile?.letterboxd_link && (
                    <a href={profile.letterboxd_link} target="_blank" className="block hover:underline">Letterboxd</a>
                )}
            </div>
        </aside>
    );
}
