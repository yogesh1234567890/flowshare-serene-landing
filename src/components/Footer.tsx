
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
              PeerShare
            </h3>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
              The future of file sharing is here. Direct, secure, and lightning-fast peer-to-peer transfers that put your privacy first.
            </p>
            <div className="flex items-center text-gray-400">
              <span>Made with</span>
              <Heart className="mx-2 text-red-400" size={16} fill="currentColor" />
              <span>for privacy</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-blue-400">Product</h4>
            <ul className="space-y-2 text-gray-400">
               <li><a href="#how-it-works" className="hover:text-white transition-colors" onClick={(e) => {
                 e.preventDefault();
                 const element = document.getElementById('how-it-works');
                 if (element) {
                   element.scrollIntoView({ behavior: 'smooth' });
                 }
               }}>How it Works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="/security" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-teal-400">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 PeerShare. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 text-sm text-gray-400">
            <span>🌍 Connecting the world, one file at a time</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
