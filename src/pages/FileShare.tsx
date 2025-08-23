
import FileShare from "@/components/FileShare";
import Navbar from "@/components/Navbar";
import { useSEO } from "@/hooks/useSEO";

const FileSharePage = () => {
  useSEO({
    title: "Share Files Securely | PeerShare - Direct P2P File Transfer",
    description: "Upload and share files instantly using secure peer-to-peer technology. No file size limits, end-to-end encryption, and direct transfers between devices.",
    keywords: "upload files, share files, p2p file sharing, secure file upload, direct file transfer, peer to peer sharing",
    canonicalUrl: "https://peershare.tech/share"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <main>
        <FileShare />
      </main>
    </div>
  );
};

export default FileSharePage;
