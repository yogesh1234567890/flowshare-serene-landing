
import Hero from "@/components/Hero";
import ProcessSteps from "@/components/ProcessSteps";
import Features from "@/components/Features";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useSEO } from "@/hooks/useSEO";
import { createWebsiteStructuredData, createSoftwareApplicationStructuredData, createHowToStructuredData, createFAQStructuredData } from "@/utils/structuredData";

const Index = () => {
  useSEO({
    title: "PeerShare – Secure Peer-to-Peer File Sharing | No Upload, Direct Transfer",
    description: "Share files instantly with end-to-end encryption. Direct peer-to-peer transfers with no size limits, no uploads to servers, and complete privacy. Works on all devices.",
    keywords: "peer to peer file sharing, secure file transfer, p2p sharing, end-to-end encryption, direct file transfer, privacy file sharing, no upload file sharing, WebRTC file transfer",
    canonicalUrl: "https://peershare.tech",
    structuredData: {
      "@context": "https://schema.org",
      "@graph": [
        createWebsiteStructuredData(),
        createSoftwareApplicationStructuredData(),
        createHowToStructuredData(),
        createFAQStructuredData()
      ]
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <ProcessSteps />
        <Features />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
