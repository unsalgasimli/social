import { FaBolt } from "react-icons/fa";

export function HeroSection() {
    return (
        <section className="max-w-7xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-[#233123] mb-7 leading-tight">
                    <span className="text-[#2E865E]">Azərbaycanda enerji qənaəti üçün<br/></span>
                    tək platforma!
                </h1>
                <p className="text-lg text-[#233123CC] mb-7 max-w-lg">
                    Evdəki elektrik sərfiyyatını izləyin, ağıllı məsləhətlər alın, bonus toplayın və ekoloji icmaya qoşulun!
                </p>
                <a href="#features">
                    <button className="bg-[#2E865E] text-white px-8 py-3 rounded-lg font-semibold text-lg shadow hover:bg-[#216646] transition">
                        App-ı Yüklə
                    </button>
                </a>
            </div>
            <div className="flex-1 flex justify-center items-center">
                <div className="w-[340px] h-[320px] bg-[#EDF5EE] rounded-3xl flex flex-col items-center justify-center shadow-xl border border-green-100">
                    <FaBolt className="text-[#2E865E] w-20 h-20 mb-3" />
                    <span className="text-2xl font-bold text-[#233123] mb-2">Enerjini Qənaətlə İdarə Et!</span>
                    <span className="text-[#2E865E] text-lg text-center">
            Yaşıl Hesab App – Davamlı gələcəyin açarı!
          </span>
                </div>
            </div>
        </section>
    );
}
