import { FaInstagram, FaFacebook, FaEnvelope, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";

export function Footer() {
    return (
        <footer className="relative w-full bg-[#222831] border-t border-[#31363F]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-10 py-8 px-6 md:px-14">

                {/* Brand Section */}
                <div className="flex flex-col items-center md:items-start gap-3">
                    <div className="flex items-center gap-2">
                        <img
                            src="/logoext.png"
                            alt="Yaşıl Hesab Logo"
                            className="w-10 h-14 drop-shadow-lg"
                        />
                        <span className="text-2xl font-extrabold text-[#EEEEEE] tracking-wide">
              Yaşıl Hesab
            </span>
                    </div>
                    <p className="text-[#EEEEEEbb] text-sm max-w-xs text-center md:text-left">
                        Ekoloji gələcək üçün birlikdə – paylaş, öyrən, ilham al.
                    </p>
                    <span className="text-[#EEEEEE66] text-xs">
            &copy; {new Date().getFullYear()} YasilHesab. Bütün hüquqlar qorunur.
          </span>
                </div>

                {/* Navigation */}
                <nav className="flex flex-wrap justify-center md:justify-start gap-6 text-[#EEEEEE] text-sm font-medium">
                    <Link to="/" className="hover:text-[#76ABAE] transition">Ana səhifə</Link>
                    <Link to="/features" className="hover:text-[#76ABAE] transition">Xüsusiyyətlər</Link>
                    <Link to="/community" className="hover:text-[#76ABAE] transition">İcma</Link>
                    <Link to="/blog" className="hover:text-[#76ABAE] transition">Blog</Link>
                    <Link to="/contact" className="hover:text-[#76ABAE] transition">Əlaqə</Link>
                    <Link to="/help" className="hover:text-[#76ABAE] transition">Dəstək & FAQ</Link>
                </nav>

                {/* Socials & Contact */}
                <div className="flex flex-col items-center md:items-end gap-3">
                    <div className="flex gap-5">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <FaFacebook className="w-6 h-6 text-[#EEEEEE] hover:text-[#76ABAE] transition" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                            <FaTwitter className="w-6 h-6 text-[#EEEEEE] hover:text-[#76ABAE] transition" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <FaInstagram className="w-6 h-6 text-[#EEEEEE] hover:text-[#76ABAE] transition" />
                        </a>
                        <a href="mailto:info@yasilhesab.az" aria-label="Email">
                            <FaEnvelope className="w-6 h-6 text-[#EEEEEE] hover:text-[#76ABAE] transition" />
                        </a>
                    </div>
                    <span className="text-[#EEEEEEbb] text-sm">
            Əlaqə:{" "}
                        <a
                            href="mailto:info@yasilhesab.az"
                            className="underline hover:text-[#76ABAE] transition"
                        >
              info@yasilhesab.az
            </a>
          </span>
                </div>
            </div>
        </footer>
    );
}
