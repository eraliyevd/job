import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/jobs/HeroSection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
      </main>
      <Footer />
    </>
  );
}
