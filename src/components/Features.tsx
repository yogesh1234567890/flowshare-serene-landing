
import { Shield, Zap, Globe, Heart } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: "Military-Grade Encryption",
      description: "Data is protected with AES-256-GCM. We operate on a Zero Trust architecture—your keys never leave your browser.",
      gradient: "from-green-400 to-emerald-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Direct connection means maximum speed. No server bottlenecks, just pure performance.",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      icon: Globe,
      title: "Works Everywhere",
      description: "Cross-platform magic. Windows, Mac, Linux, mobile - share between any devices.",
      gradient: "from-blue-400 to-purple-500"
    },
    {
      icon: Heart,
      title: "Zero Trace Policy",
      description: "We don't store your files. We don't track your data. Once the tab closes, the data vanishes.",
      gradient: "from-pink-400 to-red-500"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden" aria-labelledby="features-heading">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-teal-400 rounded-full"></div>
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-indigo-400 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-3 h-3 bg-purple-400 rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 id="features-heading" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">Peer-to-Peer</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of file sharing. Built for speed, designed for privacy, crafted for simplicity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <article
              key={index}
              className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:transform hover:-translate-y-2"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`} aria-hidden="true">
                <feature.icon size={28} />
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h2>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
