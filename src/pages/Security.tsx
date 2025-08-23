import { ShieldCheck, Lock, EyeOff } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Security = () => {
  useSEO({
    title: "Security & Privacy | PeerShare - End-to-End Encrypted File Sharing",
    description: "Learn about PeerShare's security features: end-to-end encryption, no server storage, zero tracking. Military-grade AES-256 encryption for complete privacy.",
    keywords: "file sharing security, end-to-end encryption, privacy protection, secure file transfer, AES-256 encryption, peer to peer security",
    canonicalUrl: "https://peershare.tech/security"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <main>
        <section className="relative py-20 px-4 text-center overflow-hidden bg-gray-50" aria-labelledby="security-heading">
          {/* Background blobs */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-100/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-16 right-1/3 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-5xl mx-auto">
            <h1 id="security-heading" className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Privacy</span> & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-400">Security</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              PeerShare is designed with your data privacy in mind. No storage, no tracking—just encrypted peer-to-peer communication you can trust.
            </p>

            {/* Security highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <article className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
                <div className="flex justify-center mb-4">
                  <ShieldCheck className="w-10 h-10 text-blue-600" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-semibold mb-2">End-to-End Encryption</h2>
                <p className="text-gray-600">
                  Files are encrypted directly in your browser using military-grade AES-256 encryption before transfer.
                </p>
              </article>

              <article className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
                <div className="flex justify-center mb-4">
                  <EyeOff className="w-10 h-10 text-teal-500" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No Servers, No Storage</h2>
                <p className="text-gray-600">
                  We don't store files or metadata. Transfers happen peer-to-peer—directly between devices.
                </p>
              </article>

              <article className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
                <div className="flex justify-center mb-4">
                  <Lock className="w-10 h-10 text-purple-600" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Zero Tracking</h2>
                <p className="text-gray-600">
                  We never log IP addresses, session details, or analytics. Your privacy stays yours—completely.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Security;