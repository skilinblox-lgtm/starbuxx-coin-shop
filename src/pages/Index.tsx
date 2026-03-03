import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import GameSelector from "@/components/GameSelector";
import Advantages from "@/components/Advantages";
import ReviewSection from "@/components/ReviewSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroBanner />
      <GameSelector />
      <Advantages />
      <ReviewSection />
      <Footer />
    </div>
  );
};

export default Index;
