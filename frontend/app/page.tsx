import LandingHero from "./components/LandingHero";
import Features from "./components/Features";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-[#070707] dark:via-[#0b0b0b] dark:to-[#050505] text-slate-900 dark:text-slate-100">
      <main className="mx-auto max-w-7xl px-6 py-16 md:py-24 lg:py-32">
        <LandingHero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
