
import Hero from "@/components/Hero";
import ProcessSteps from "@/components/ProcessSteps";
import Features from "@/components/Features";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <div className="pt-16">
        <Hero />
        <ProcessSteps />
        <Features />
        <FAQ />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
