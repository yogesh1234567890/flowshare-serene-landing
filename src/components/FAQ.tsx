
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How secure is peer-to-peer file sharing?",
      answer: "Very secure! Files are encrypted end-to-end and transfer directly between devices. No third-party servers store your data, making it much safer than traditional cloud uploads."
    },
    {
      question: "Is there a file size limit?",
      answer: "No artificial limits! Since files transfer directly between devices, you're only limited by your internet connection and storage space. Share files of any size."
    },
    {
      question: "Do I need to create an account?",
      answer: "Absolutely not! Our service works completely in your browser without any registration. Just visit, select files, and start sharing immediately."
    },
    {
      question: "What happens if my internet disconnects during transfer?",
      answer: "The transfer will pause and automatically resume when your connection is restored. Our robust protocol ensures no data is lost during interruptions."
    },
    {
      question: "Can I share files with someone on a different operating system?",
      answer: "Yes! Our service works across all platforms - Windows, Mac, Linux, iOS, and Android. As long as both devices have internet access, sharing works seamlessly."
    },
    {
      question: "How long are the sharing links active?",
      answer: "Links remain active for 24 hours by default, but you can customize this. Once expired, the link becomes invalid for security. You can always generate a new one!"
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked <span className="text-blue-600">Questions</span>
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about secure peer-to-peer file sharing.
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-gray-100"
            >
              <button
                className="w-full px-8 py-6 text-left flex items-center justify-between focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <ChevronDown 
                  className={`text-blue-600 transition-transform duration-300 flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  size={24}
                />
              </button>
              
              <div className={`px-8 overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'pb-6 max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
