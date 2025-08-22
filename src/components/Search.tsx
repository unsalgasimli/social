// src/pages/Search.tsx (Updated)
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

interface UserResult {
    id: string;
    name: string;
    surname: string;
    profile: {
        avatar_url?: string;
        bio?: string;
    };
}

export default function Search() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const [results, setResults] = useState<UserResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query) return;
        const fetchResults = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("users")
                .select(`
          id, 
          name, 
          surname, 
          profile:profiles(avatar_url, bio)
        `)
                .or(`name.ilike.%${query}%,surname.ilike.%${query}%`); // Search by name or surname

            if (!error) setResults(data || []);
            setLoading(false);
        };

        fetchResults();
    }, [query]);

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Search Results for "{query}"</h2>
            {loading && <p className="text-center">Loading...</p>}
            {!loading && results.length === 0 && <p className="text-center opacity-60">No users found.</p>}
            <div className="grid gap-4">
                {results.map((user) => (
                    <Link
                        to={`/profile/${user.id}`}
                        key={user.id}
                        className="bg-[#2C2C2C] p-4 rounded-lg flex items-center gap-4 hover:bg-[#333] transition"
                    >
                        <img
                            src={user.profile?.avatar_url || "/default-avatar.png"}
                            alt={`${user.name} ${user.surname}`}
                            className="w-16 h-16 rounded-full object-cover border border-[#76ABAE66]"
                        />
                        <div>
                            <h3 className="text-lg font-semibold">
                                {user.name} {user.surname}
                            </h3>
                            <p className="text-sm opacity-70 line-clamp-2">
                                {user.profile?.bio || "No bio available."}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}