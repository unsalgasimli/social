export default function PostCard({ post }: any) {
    return (
        <div className="bg-[#2C2C2C] p-4 rounded-lg shadow-md">
            <div className="flex justify-between mb-2">
                <span className="text-[#76ABAE] font-semibold">{post.category}</span>
                <span className="text-sm opacity-60">{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            <p>{post.content}</p>
            {post.image_url && <img src={post.image_url} alt="" className="mt-2 rounded-lg" />}
        </div>
    );
}
