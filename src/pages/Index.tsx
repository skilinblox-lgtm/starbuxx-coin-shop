import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import GameSelector from "@/components/GameSelector";
import Advantages from "@/components/Advantages";
import TrustSection from "@/components/TrustSection";
import ReviewSection from "@/components/ReviewSection";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const Index = () => {
  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navbar />
        <HeroBanner />
        <GameSelector />
        <Advantages />
        <TrustSection />
        <ReviewSection />
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
