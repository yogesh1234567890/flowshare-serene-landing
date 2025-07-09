
import { Upload, Users, ArrowDown } from "lucide-react";

const ProcessSteps = () => {
  const steps = [
    {
      icon: Upload,
      title: "Select Files",
      description: "Choose any file from your device. No size limits, any format welcome.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Share Link",
      description: "Get an instant secure link. Share it however you like - text, email, or chat.",
      color: "from-teal-500 to-teal-600"
    },
    {
      icon: ArrowDown,
      title: "Direct Transfer",
      description: "Files transfer directly between devices. Fast, private, and secure.",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 bg-white relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Share in <span className="text-blue-600">3 Simple Steps</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            No accounts, no uploads to servers, no waiting. Just pure peer-to-peer magic.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative group text-center hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${step.color} text-white mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                <step.icon size={32} />
              </div>
              
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                {index + 1}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
              
              {/* Connecting arrow for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 -right-6 text-gray-300">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;
