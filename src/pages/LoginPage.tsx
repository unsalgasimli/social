import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext";

function InputField({
                        label,
                        icon: Icon,
                        type,
                        name,
                        value,
                        onChange,
                        placeholder,
                        required = true,
                    }: {
    label: string;
    icon: any;
    type: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
}) {
    return (
        <div className="mb-5">
            <label className="block mb-2 text-sm font-semibold text-[#EEEEEE]">{label}</label>
            <div className="flex items-center bg-[#222831] border border-gray-700 rounded-lg overflow-hidden">
                <span className="px-3 text-gray-400"><Icon /></span>
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className="w-full px-3 py-3 bg-transparent outline-none text-[#EEEEEE]"
                />
            </div>
        </div>
    );
}

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post("/api/auth/login", form);
            const { user, token } = res.data;

            // AuthContext vasitəsilə login
            login(
                {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                token
            );

            navigate("/"); // login sonrası yönləndirmə
        } catch (err: any) {
            setError(err.response?.data?.error || "Daxil olma uğursuz oldu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#222831] text-[#EEEEEE] px-4">
            <h1 className="text-4xl md:text-5xl font-black text-[#76ABAE] mb-2 drop-shadow-lg text-center">
                Daxil Ol
            </h1>
            <form
                onSubmit={handleSubmit}
                className="bg-[#31363F]/90 border border-[#76ABAE44] rounded-2xl shadow-xl p-8 w-full max-w-md backdrop-blur-sm"
            >
                <InputField
                    label="Email"
                    icon={FaEnvelope}
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Emailinizi daxil edin"
                />
                <InputField
                    label="Şifrə"
                    icon={FaLock}
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Şifrənizi daxil edin"
                />
                {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-[#76ABAE] to-[#5e8f92] text-[#222831] font-bold text-lg shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60"
                >
                    {loading ? "Gözləyin..." : "Daxil Ol →"}
                </button>
            </form>
        </div>
    );
}
