import { ShieldCheck, Lock, EyeOff } from "lucide-react";

const Security = () => {
  return (
    <section className="relative py-20 px-4 text-center overflow-hidden bg-gray-50">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-16 right-1/3 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Privacy</span> & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-400">Security</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          PeerShare is designed with your data privacy in mind. No storage, no tracking—just encrypted peer-to-peer communication you can trust.
        </p>

        {/* Security highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
            <div className="flex justify-center mb-4">
              <ShieldCheck className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">End-to-End Encryption</h3>
            <p className="text-gray-600">
              Files are encrypted directly in your browser using military-grade AES-256 encryption before transfer.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
            <div className="flex justify-center mb-4">
              <EyeOff className="w-10 h-10 text-teal-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Servers, No Storage</h3>
            <p className="text-gray-600">
              We don’t store files or metadata. Transfers happen peer-to-peer—directly between devices.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
            <div className="flex justify-center mb-4">
              <Lock className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Zero Tracking</h3>
            <p className="text-gray-600">
              We never log IP addresses, session details, or analytics. Your privacy stays yours—completely.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;
