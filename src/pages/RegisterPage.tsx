        import { useNavigate } from "react-router-dom";
        import { useState } from "react";
        import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaVenusMars, FaLock } from "react-icons/fa";
        import api from "../lib/api.js";

        function InputField({ label, icon: Icon, type, name, value, onChange, placeholder, required = true }) {
            return (
                <div className="mb-5">
                    <label className="block mb-2 text-sm font-semibold text-[#EEEEEE]">{label}</label>
                    <div className="flex items-center bg-[#222831] border border-gray-700 rounded-lg overflow-hidden focus-within:border-[#76ABAE] transition">
                        <span className="px-3 text-gray-400"><Icon /></span>
                        <input
                            type={type}
                            name={name}
                            value={value}
                            onChange={onChange}
                            placeholder={placeholder}
                            required={required}
                            className="w-full px-3 py-3 bg-transparent outline-none text-[#EEEEEE] placeholder-gray-500"
                        />
                    </div>
                </div>
            );
        }

        export default function RegisterPage() {
            const navigate = useNavigate();
            const [form, setForm] = useState({ name: "", surname: "", email: "", phone: "", age: "", gender: "", password: "" });
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState("");
            const [success, setSuccess] = useState("");

            const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

            const handleSubmit = async (e) => {
                e.preventDefault();
                setLoading(true);
                setError(""); setSuccess("");

                try {
                    const res = await api.post("/api/auth/register", form);
                    setSuccess(res.data.message);
                    setTimeout(() => navigate("/login"), 1500);
                } catch (err) {
                    setError(err.response?.data?.error || "Qeydiyyat uğursuz oldu");
                } finally {
                    setLoading(false);
                }
            };

            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-[#222831] text-[#EEEEEE] px-4">
                    <h1 className="text-4xl md:text-5xl font-black text-[#76ABAE] mb-2 drop-shadow-lg">Qeydiyyatdan Keç</h1>
                    <form onSubmit={handleSubmit} className="bg-[#31363F]/90 border border-[#76ABAE44] rounded-2xl shadow-xl p-8 w-full max-w-md backdrop-blur-sm">
                        <InputField label="Ad" icon={FaUser} type="text" name="name" value={form.name} onChange={handleChange} placeholder="Adınızı daxil edin" />
                        <InputField label="Soyad" icon={FaUser} type="text" name="surname" value={form.surname} onChange={handleChange} placeholder="Soyadınızı daxil edin" />
                        <InputField label="Email" icon={FaEnvelope} type="email" name="email" value={form.email} onChange={handleChange} placeholder="Emailinizi daxil edin" />
                        <InputField label="Telefon" icon={FaPhone} type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Telefon nömrənizi daxil edin" />
                        <InputField label="Yaş" icon={FaCalendarAlt} type="number" name="age" value={form.age} onChange={handleChange} placeholder="Yaşınızı daxil edin" />
                        <div className="mb-5">
                            <label className="block mb-2 text-sm font-semibold text-[#EEEEEE]">Cinsiyyət</label>
                            <select name="gender" value={form.gender} onChange={handleChange} className="w-full px-3 py-3 bg-[#222831] text-[#EEEEEE] rounded-lg" required>
                                <option value="">Seçin</option>
                                <option value="Kişi">Kişi</option>
                                <option value="Qadın">Qadın</option>
                                <option value="Digər">Digər</option>
                            </select>
                        </div>
                        <InputField label="Şifrə" icon={FaLock} type="password" name="password" value={form.password} onChange={handleChange} placeholder="Şifrənizi daxil edin" />
                        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
                        {success && <p className="text-green-400 text-sm mb-3">{success}</p>}
                        <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-gradient-to-r from-[#76ABAE] to-[#5e8f92] text-[#222831] font-bold text-lg shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60">
                            {loading ? "Gözləyin..." : "Qeydiyyatdan keç →"}
                        </button>
                    </form>
                </div>
            );
        }
