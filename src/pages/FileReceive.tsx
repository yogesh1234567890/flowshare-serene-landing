
import FileReceive from "@/components/FileReceive";
import Navbar from "@/components/Navbar";
import { useSEO } from "@/hooks/useSEO";

const FileReceivePage = () => {
  useSEO({
    title: "Receive Files Securely | PeerShare - Direct P2P File Download",
    description: "Download files shared via PeerShare's secure peer-to-peer network. Direct transfers with end-to-end encryption and no server storage.",
    keywords: "receive files, download files, p2p file download, secure file receive, direct file download, peer to peer download",
    canonicalUrl: "https://peershare.tech/receive"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <main>
        <FileReceive />
      </main>
    </div>
  );
};

export default FileReceivePage;
