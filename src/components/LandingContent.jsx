'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useRef, useState } from 'react';

/* ── Animated counter hook ────────────────────────────── */
function useCounter(end, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = end / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(start));
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
}

/* ── Fade-in on scroll hook ───────────────────────────── */
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('fade-in-visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ── Section wrapper with fade-in ─────────────────────── */
function Section({ children, className = '', id }) {
  const ref = useFadeIn();
  return (
    <section id={id} ref={ref} className={`fade-in-section scroll-mt-20 ${className}`}>
      {children}
    </section>
  );
}

export default function LandingContent() {
  const { isLoggedIn } = useAuth();

  const stat1 = useCounter(5000, 2000);
  const stat2 = useCounter(95, 1800);
  const stat3 = useCounter(10, 1600);
  const stat4 = useCounter(24, 1400);

  return (
    <div className="landing-page">
      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0b3d2e] via-[#135E4B] to-[#1a7a5a] text-white">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#4CB572]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#A1D8B5]/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/[0.03] blur-3xl pointer-events-none" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-36 pb-16 sm:pb-24 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left copy */}
            <div className="space-y-8 max-w-xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-sm font-medium">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4CB572] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4CB572]"></span>
                </span>
                Platform Deteksi AI &mdash; Aktif 24 Jam &amp; Gratis
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
                Lindungi <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4CB572] to-[#A1D8B5]">Tanaman Padi</span> dengan Kecerdasan Buatan
              </h1>

              <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-lg">
                Unggah foto tanaman padi Anda, dapatkan diagnosis instan untuk hingga 3 penyakit utama beserta rekomendasi perawatan — aktif 24 jam, dalam bahasa Indonesia.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                {!isLoggedIn && (
                  <>
                    <Link href="/scan" className="hero-btn-primary">
                      Mulai Scan <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                    <Link href="/login" className="hero-btn-outline">
                      <i className="fa-solid fa-right-to-bracket"></i> Masuk
                    </Link>
                  </>
                )}
                {isLoggedIn && (
                  <Link href="/dashboard" className="hero-btn-primary">
                    <i className="fa-solid fa-gauge-high"></i> Dashboard
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-6 pt-2 text-sm text-white/50">
                <span className="flex items-center gap-2"><i className="fa-solid fa-check text-[#4CB572]"></i> Tanpa biaya</span>
                <span className="flex items-center gap-2"><i className="fa-solid fa-check text-[#4CB572]"></i> Hasil instan</span>
                <span className="flex items-center gap-2"><i className="fa-solid fa-check text-[#4CB572]"></i> Bahasa Indonesia</span>
              </div>
            </div>

            {/* Right — Visual Feature */}
            <div className="hidden lg:flex justify-center">
              <div className="relative w-full max-w-sm">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-br from-[#4CB572]/40 to-[#A1D8B5]/20 rounded-3xl blur-2xl opacity-60" />
                
                {/* Main card */}
                <div className="relative bg-gradient-to-br from-white/[0.12] to-white/[0.08] backdrop-blur-2xl border border-white/30 rounded-3xl overflow-hidden">
                  {/* Top accent */}
                  <div className="h-1.5 bg-gradient-to-r from-[#4CB572] via-[#A1D8B5] to-[#4CB572]" />
                  
                  <div className="p-8 space-y-8">
                    {/* Icon section */}
                    <div className="flex justify-center">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#4CB572]/40 to-[#A1D8B5]/30 border border-[#4CB572]/60 flex items-center justify-center animate-pulse">
                        <i className="fa-solid fa-camera text-4xl text-[#4CB572]"></i>
                      </div>
                    </div>

                    {/* Text section */}
                    <div className="text-center space-y-3">
                      <h3 className="text-xl font-bold text-white">Scan Gratis & Instan</h3>
                      <p className="text-sm text-white/60 leading-relaxed">
                        Ambil foto tanaman padi Anda dan dapatkan hasil deteksi dalam hitungan detik.
                      </p>
                    </div>

                    {/* Features list */}
                    <div className="space-y-3 pt-4 border-t border-white/20">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-[#4CB572]/30 flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-check text-xs text-[#4CB572]"></i>
                        </div>
                        <span className="text-sm text-white/80">Deteksi otomatis penyakit</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-[#4CB572]/30 flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-check text-xs text-[#4CB572]"></i>
                        </div>
                        <span className="text-sm text-white/80">Rekomendasi penanganan langsung</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-[#4CB572]/30 flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-check text-xs text-[#4CB572]"></i>
                        </div>
                        <span className="text-sm text-white/80">Tanpa perlu login atau daftar</span>
                      </div>
                    </div>

                    <Link href="/scan"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#4CB572] to-[#3a9b5d] text-white font-semibold text-sm hover:shadow-xl hover:shadow-[#4CB572]/40 active:scale-95 transition-all duration-200">
                      <i className="fa-solid fa-arrow-right"></i> 
                      <span>Mulai Scan</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,64 C360,0 720,80 1440,32 L1440,80 L0,80Z" fill="var(--mint)" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════ STATS BAR ═══════════════════════
      <section className="relative z-10 -mt-1 bg-[var(--mint)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-white/60 p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { ref: stat1.ref, val: stat1.count, suffix: '+', label: 'Scan Dilakukan', icon: 'fa-camera', color: 'text-[var(--leaf)]' },
              { ref: stat2.ref, val: 3, suffix: '+', label: 'Penyakit Utama', icon: 'fa-virus', color: 'text-emerald-500' },
              { ref: stat4.ref, val: stat4.count, suffix: '/7', label: 'Layanan Aktif', icon: 'fa-clock', color: 'text-blue-500' },
            ].map((s, i) => (
              <div key={i} ref={s.ref} className="text-center space-y-2">
                <div className={`text-2xl ${s.color}`}><i className={`fa-solid ${s.icon}`}></i></div>
                <p className="text-3xl sm:text-4xl font-extrabold text-[var(--forest)]">{s.val.toLocaleString()}{s.suffix}</p>
                <p className="text-sm text-[var(--muted)] font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ═══════════════════════ HOW IT WORKS ════════════════════ */}
      <Section className="py-20 sm:py-28 bg-[var(--mint)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
            <span className="section-badge">
              <i className="fa-solid fa-route"></i> Cara Kerja
            </span>
            <h2 className="section-title mt-4">Tiga Langkah Mudah</h2>
            <p className="section-desc mt-4">
              Proses analisis tanaman padi Anda hanya membutuhkan beberapa detik — cukup foto, unggah, dan dapatkan hasilnya.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5" style={{background:'linear-gradient(to right, transparent, rgba(76,181,114,0.3), transparent)'}} />

            {[
              { step: '01', icon: 'fa-camera-retro', title: 'Ambil Foto', desc: 'Arahkan kamera ke daun atau batang padi yang menunjukkan gejala. Pastikan pencahayaan cukup.', color: 'from-emerald-400 to-emerald-600' },
              { step: '02', icon: 'fa-microchip', title: 'Analisis AI', desc: 'Model deep learning kami akan memproses gambar dan mengidentifikasi penyakit dalam hitungan detik.', color: 'from-blue-400 to-blue-600' },
              { step: '03', icon: 'fa-file-medical', title: 'Hasil & Saran', desc: 'Dapatkan laporan diagnosis lengkap beserta rekomendasi penanganan yang sesuai.', color: 'from-amber-400 to-amber-600' },
            ].map((item) => (
              <div key={item.step} className="relative text-center group">
                <div className="relative mx-auto w-28 h-28 sm:w-32 sm:h-32 mb-6">
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${item.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500 rotate-6`} />
                  <div className="relative h-full w-full rounded-3xl bg-white shadow-lg border border-white/60 flex items-center justify-center">
                    <i className={`fa-solid ${item.icon} text-3xl sm:text-4xl text-[var(--forest)]`}></i>
                  </div>
                  <span className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--forest)] to-[#135E4B] text-white text-sm font-bold flex items-center justify-center shadow-lg">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[var(--forest)] mb-3">{item.title}</h3>
                <p className="text-[var(--muted)] leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════ FEATURES / LAYANAN ══════════════ */}
      <Section className="py-20 sm:py-28 bg-gradient-to-b from-[var(--mint)] to-white/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
            <span className="section-badge">
              <i className="fa-solid fa-cubes"></i> Fitur Unggulan
            </span>
            <h2 className="section-title mt-4">Semua yang Anda Butuhkan</h2>
            <p className="section-desc mt-4">
              Dirancang untuk membantu petani dan peneliti memantau kesehatan tanaman padi secara efisien.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              { icon: 'fa-brain', title: 'Deteksi Multi-Penyakit', desc: 'Identifikasi hingga 3 penyakit utama padi secara bersamaan menggunakan model AI terlatih.', gradient: 'from-purple-500/10 to-purple-500/5' },
              { icon: 'fa-bolt-lightning', title: 'Hasil Real-time', desc: 'Proses analisis cepat — dapatkan diagnosis dalam hitungan detik, bukan jam.', gradient: 'from-amber-500/10 to-amber-500/5' },
              { icon: 'fa-shield-halved', title: 'Rekomendasi Praktis', desc: 'Saran penanganan berdasarkan data ilmiah, disajikan dalam bahasa Indonesia yang mudah dipahami.', gradient: 'from-emerald-500/10 to-emerald-500/5' },
              { icon: 'fa-clock-rotate-left', title: 'Riwayat Lengkap', desc: 'Simpan dan pantau semua hasil scan. Bandingkan perkembangan tanaman dari waktu ke waktu.', gradient: 'from-blue-500/10 to-blue-500/5' },
              { icon: 'fa-camera', title: 'Scan via Kamera', desc: 'Gunakan kamera langsung dari perangkat Anda untuk scan tanaman secara real-time.', gradient: 'from-rose-500/10 to-rose-500/5' },
              { icon: 'fa-clock', title: 'Aktif 24 Jam', desc: 'Akses layanan deteksi kapan saja, siang maupun malam, tanpa batasan jam operasional.', gradient: 'from-cyan-500/10 to-cyan-500/5' },
            ].map((f) => (
              <div key={f.title} className={`group relative bg-white rounded-2xl sm:rounded-3xl p-7 sm:p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1`}>
                <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-[var(--forest)] mb-5 group-hover:scale-110 transition-transform duration-500" style={{background:'rgba(161,216,181,0.4)',border:'1px solid rgba(76,181,114,0.1)',borderRadius:'1rem'}}>
                    <i className={`fa-solid ${f.icon}`}></i>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--forest)] mb-3">{f.title}</h3>
                  <p className="text-[var(--muted)] leading-relaxed text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════ TENTANG KAMI ════════════════════ */}
      <Section id="tentang" className="py-20 sm:py-28 bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left — visual */}
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl blur-2xl" style={{background:'linear-gradient(to bottom right, rgba(76,181,114,0.1), rgba(161,216,181,0.2))'}} />
              <div className="relative bg-gradient-to-br from-[#0b3d2e] to-[#135E4B] rounded-3xl p-8 sm:p-12 text-white overflow-hidden">
                {/* Pattern */}
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }} />
                <div className="relative space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl">
                    <i className="fa-solid fa-leaf text-[#4CB572]"></i>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold leading-tight">
                    Teknologi AI untuk <br />Pertanian Indonesia
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    Dikembangkan sebagai bagian dari penelitian Tugas Akhir di bidang Rekayasa Perangkat Lunak,
                    SekarPadi menggabungkan deep learning dan computer vision untuk memberikan solusi
                    nyata bagi petani Indonesia.
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <p className="text-3xl font-bold text-[#A1D8B5]">YOLO11n</p>
                      <p className="text-xs text-white/50 mt-1">Object Detection</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — content */}
            <div className="space-y-8">
              <div>
                <span className="section-badge">
                  <i className="fa-solid fa-building"></i> Tentang Kami
                </span>
                <h2 className="section-title mt-4">Melindungi Padi Indonesia dengan Teknologi Modern</h2>
                <p className="section-desc mt-4">
                  SekarPadi adalah platform deteksi penyakit tanaman padi berbasis kecerdasan buatan.
                  Kami bertujuan membantu petani Indonesia mengenali masalah tanaman lebih dini dan mengambil tindakan tepat.
                </p>
              </div>

              <div className="space-y-5">
                {[
                  { icon: 'fa-bullseye', title: 'Akurasi Tinggi', desc: 'Model AI dilatih dengan ribuan citra penyakit padi dari berbagai sumber terpercaya.' },
                  { icon: 'fa-bolt', title: 'Cepat & Efisien', desc: 'Cukup unggah atau foto langsung, hasil analisis muncul dalam hitungan detik.' },
                  { icon: 'fa-language', title: 'Bahasa Indonesia', desc: 'Seluruh rekomendasi dan saran perawatan disampaikan dalam bahasa yang mudah dipahami.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 items-start group">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg text-[var(--forest)] flex-shrink-0 transition-colors" style={{background:'rgba(161,216,181,0.5)',border:'1px solid rgba(76,181,114,0.1)',borderRadius:'1rem'}}>
                      <i className={`fa-solid ${item.icon}`}></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--forest)] mb-1">{item.title}</h4>
                      <p className="text-sm text-[var(--muted)] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════ FAQ ═════════════════════════════ */}
      <Section id="faq" className="py-20 sm:py-28 bg-[var(--mint)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-14">
            <span className="section-badge">
              <i className="fa-solid fa-circle-question"></i> FAQ
            </span>
            <h2 className="section-title mt-4">Pertanyaan yang Sering Diajukan</h2>
            <p className="section-desc mt-4">Temukan jawaban atas pertanyaan umum tentang SekarPadi.</p>
          </div>

          <div className="space-y-4">
            {[
              { q: 'Apakah SekarPadi gratis?', a: 'Ya, SekarPadi sepenuhnya gratis untuk digunakan. Cukup daftar akun dan Anda bisa langsung mulai scan tanaman padi Anda.' },
              { q: 'Format foto apa yang didukung?', a: 'SekarPadi mendukung format JPG dan PNG dengan ukuran maksimal 10MB. Untuk hasil terbaik, gunakan resolusi minimal 640x640 piksel.' },
              { q: 'Bagaimana cara mendapatkan hasil terbaik?', a: 'Ambil foto saat cahaya cukup (siang hari), fokuskan kamera ke daun yang menunjukkan gejala, dan jaga jarak sekitar 15-20 cm dari tanaman.' },
              { q: 'Apakah hasil deteksi disimpan?', a: 'Ya, semua hasil scan tersimpan di riwayat akun Anda. Anda bisa melihat detail atau menghapusnya kapan saja.' },
              { q: 'Penyakit apa saja yang bisa dideteksi?', a: 'Model AI kami dapat mendeteksi 3 penyakit umum padi seperti Blast, Brown Spot, dan Bacterial Blight' },
            ].map((item, idx) => (
              <details key={idx} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <summary className="flex items-center justify-between p-5 sm:p-6 cursor-pointer">
                  <span className="font-semibold text-[var(--forest)] text-sm sm:text-base pr-4">{item.q}</span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors" style={{background:'rgba(161,216,181,0.5)'}}>
                    <i className="fa-solid fa-chevron-down text-xs text-[var(--forest)] transition-transform duration-300 group-open:rotate-180"></i>
                  </div>
                </summary>
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm text-[var(--muted)] leading-relaxed border-t border-gray-50 pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════ KEBIJAKAN PRIVASI ════════════════════ */}
      <Section id="privacy" className="py-20 sm:py-28 bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-14">
            <span className="section-badge">
              <i className="fa-solid fa-shield"></i> Kebijakan Privasi
            </span>
            <h2 className="section-title mt-4">Perlindungan Data Anda</h2>
            <p className="section-desc mt-4">Kami berkomitmen melindungi privasi dan data Anda. Pelajari bagaimana kami mengelola informasi Anda.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--mint)] flex items-center justify-center text-[var(--forest)] font-bold">
                  <i className="fa-solid fa-lock"></i>
                </div>
                <h3 className="font-semibold text-[var(--forest)]">Data Terenkripsi</h3>
              </div>
              <p className="text-sm text-gray-600">Semua data Anda disimpan dengan enkripsi tingkat tinggi dan hanya dapat diakses oleh Anda.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--mint)] flex items-center justify-center text-[var(--forest)] font-bold">
                  <i className="fa-solid fa-user-shield"></i>
                </div>
                <h3 className="font-semibold text-[var(--forest)]">Hak Anda</h3>
              </div>
              <p className="text-sm text-gray-600">Anda memiliki hak untuk mengakses, mengoreksi, atau menghapus data pribadi Anda kapan saja.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--mint)] flex items-center justify-center text-[var(--forest)] font-bold">
                  <i className="fa-solid fa-image"></i>
                </div>
                <h3 className="font-semibold text-[var(--forest)]">Data Gambar</h3>
              </div>
              <p className="text-sm text-gray-600">Gambar yang Anda unggah hanya disimpan untuk keperluan analisis. Tidak dibagikan ke pihak ketiga.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--mint)] flex items-center justify-center text-[var(--forest)] font-bold">
                  <i className="fa-solid fa-trash"></i>
                </div>
                <h3 className="font-semibold text-[var(--forest)]">Hapus Gambar</h3>
              </div>
              <p className="text-sm text-gray-600">Anda dapat menghapus data gambar terkait kapan saja.</p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/privacy" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--forest)] text-white font-semibold hover:bg-[#0F4C3E] transition">
              <i className="fa-solid fa-file-contract"></i> Baca Kebijakan Privasi Lengkap
            </Link>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════ CTA ═════════════════════════════ */}
      <Section className="py-20 sm:py-28 bg-gradient-to-b from-[var(--mint)] to-white/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-[#0b3d2e] via-[#135E4B] to-[#1a7a5a] rounded-3xl sm:rounded-[2rem] p-8 sm:p-12 lg:p-16 text-center text-white overflow-hidden">
            {/* Decorative */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#4CB572]/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-[#A1D8B5]/15 blur-3xl" />
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }} />

            <div className="relative max-w-2xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl mx-auto">
                <i className="fa-solid fa-seedling text-[#4CB572]"></i>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Siap Melindungi Tanaman Padi Anda?
              </h2>
              <p className="text-white/60 text-lg max-w-lg mx-auto">
                Bergabunglah dengan pengguna yang telah menggunakan SekarPadi untuk menjaga kesehatan tanaman padi mereka.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                {!isLoggedIn ? (
                  <>
                    <Link href="/register" className="hero-btn-primary !bg-white !text-[var(--forest)] hover:!bg-gray-100">
                      Daftar Gratis <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                    <Link href="/login" className="hero-btn-outline !border-white/30 hover:!bg-white/10">
                      <i className="fa-solid fa-right-to-bracket"></i> Masuk
                    </Link>
                  </>
                ) : (
                  <Link href="/dashboard" className="hero-btn-primary !bg-white !text-[var(--forest)] hover:!bg-gray-100">
                    <i className="fa-solid fa-gauge-high"></i> Buka Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════ FOOTER ══════════════════════════ */}
      <footer className="bg-[#0b3d2e] text-white pt-16 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-white/10">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4CB572]/20 flex items-center justify-center">
                  <i className="fa-solid fa-leaf text-[#4CB572] text-lg"></i>
                </div>
                <span className="text-xl font-bold">SekarPadi</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                Platform deteksi penyakit tanaman padi berbasis AI untuk petani Indonesia.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white/80 mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <ul className="space-y-3">
                <li><Link href="/scan" className="text-white/50 hover:text-white text-sm transition-colors">Scan Tanaman</Link></li>
                <li><Link href="/dashboard" className="text-white/50 hover:text-white text-sm transition-colors">Dashboard</Link></li>
                <li><Link href="/history" className="text-white/50 hover:text-white text-sm transition-colors">Riwayat</Link></li>
                <li><Link href="/camera" className="text-white/50 hover:text-white text-sm transition-colors">Kamera</Link></li>
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 className="font-semibold text-white/80 mb-4 text-sm uppercase tracking-wider">Informasi</h4>
              <ul className="space-y-3">
                <li><Link href="/#tentang" className="text-white/50 hover:text-white text-sm transition-colors">Tentang Kami</Link></li>
                <li><Link href="/#faq" className="text-white/50 hover:text-white text-sm transition-colors">FAQ</Link></li>
                <li><Link href="/privacy" className="text-white/50 hover:text-white text-sm transition-colors">Kebijakan Privasi</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white/80 mb-4 text-sm uppercase tracking-wider">Kontak</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-white/50 text-sm">
                  <i className="fa-solid fa-envelope text-xs"></i> sekarpadi@email.com
                </li>
                <li className="flex items-center gap-2 text-white/50 text-sm">
                  <i className="fa-solid fa-location-dot text-xs"></i> Indonesia
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
            <p>&copy; {new Date().getFullYear()} SekarPadi. All rights reserved.</p>
            <p>Tugas Akhir — Zefanya Diego Forlandicco</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
