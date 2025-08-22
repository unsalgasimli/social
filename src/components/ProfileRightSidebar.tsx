export default function ProfileRightSidebar({ profile }: any) {
    return (
        <aside className="w-64 bg-[#2A2A2A] p-4 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-[#76ABAE]">Communities</h2>
            {profile?.communities?.length === 0 && <p className="opacity-70">No communities yet</p>}
            {profile?.communities?.map((c: any) => (
                <div key={c.id} className="bg-[#333] p-2 rounded hover:bg-[#444]">
                    {c.name} {c.is_private ? "(Private)" : ""}
                </div>
            ))}
        </aside>
    );
}
