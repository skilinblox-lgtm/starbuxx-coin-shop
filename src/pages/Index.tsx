import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import GameSelector from "@/components/GameSelector";
import Advantages from "@/components/Advantages";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroBanner />
      <GameSelector />
      <Advantages />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
