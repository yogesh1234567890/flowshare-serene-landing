
import Hero from "@/components/Hero";
import ProcessSteps from "@/components/ProcessSteps";
import Features from "@/components/Features";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Hero />
      <ProcessSteps />
      <Features />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
