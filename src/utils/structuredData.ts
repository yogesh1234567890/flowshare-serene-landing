export const createWebsiteStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "PeerShare",
  "alternateName": "PeerShare - P2P File Sharing",
  "description": "Secure, fast, and privacy-focused peer-to-peer file sharing platform. Transfer files directly between devices with end-to-end encryption, no file size limits, and no server uploads.",
  "url": "https://peershare.tech",
  "logo": {
    "@type": "ImageObject",
    "url": "https://peershare.tech/favicon-96x96.png",
    "width": 96,
    "height": 96
  },
  "sameAs": [
    "https://twitter.com/peershare_tech"
  ],
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://peershare.tech/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  "inLanguage": "en-US",
  "isAccessibleForFree": true
});

export const createSoftwareApplicationStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "PeerShare",
  "alternateName": "PeerShare File Transfer",
  "description": "Direct peer-to-peer file sharing with end-to-end encryption. No uploads, no limits, no compromises on privacy. Transfer files directly between devices using WebRTC technology.",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web Browser, Windows, macOS, Linux, iOS, Android",
  "browserRequirements": "Requires JavaScript. Requires HTML5. Requires WebRTC support.",
  "url": "https://peershare.tech",
  "screenshot": "https://peershare.tech/og-image.png",
  "softwareVersion": "1.0.0",
  "datePublished": "2024-01-01",
  "dateModified": "2024-12-19",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "127",
    "bestRating": "5",
    "worstRating": "1"
  },
  "author": {
    "@type": "Organization",
    "name": "PeerShare",
    "url": "https://peershare.tech"
  },
  "featureList": [
    "End-to-end encryption",
    "No file size limits",
    "Direct P2P transfer",
    "No server uploads",
    "Zero-knowledge architecture",
    "Cross-platform support"
  ]
});

export const createHowToStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Share Files with PeerShare",
  "description": "Learn how to securely share files using peer-to-peer technology",
  "image": "https://peershare.tech/og-image.png",
  "totalTime": "PT2M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "supply": [
    {
      "@type": "HowToSupply",
      "name": "Device with internet connection"
    },
    {
      "@type": "HowToSupply", 
      "name": "File to share"
    }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "name": "Select Files",
      "text": "Choose any file from your device. No size limits, any format welcome.",
      "image": "https://peershare.tech/og-image.png"
    },
    {
      "@type": "HowToStep",
      "name": "Share Connection Code",
      "text": "Get an instant secure connection code. Share it with the recipient via text, email, or chat.",
      "image": "https://peershare.tech/og-image.png"
    },
    {
      "@type": "HowToStep",
      "name": "Direct Transfer",
      "text": "Files transfer directly between devices using WebRTC. Fast, private, and secure with optional end-to-end encryption.",
      "image": "https://peershare.tech/og-image.png"
    }
  ]
});

export const createFAQStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is PeerShare secure?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, PeerShare uses end-to-end encryption for all file transfers. Your files are encrypted during transfer and only you and the recipient can access them."
      }
    },
    {
      "@type": "Question",
      "name": "Are there file size limits?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No, PeerShare has no file size limits. You can share files of any size as long as both devices have sufficient storage and bandwidth."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need to create an account?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No account required! PeerShare works instantly without registration. Just select your files and start sharing."
      }
    },
    {
      "@type": "Question",
      "name": "How fast are the transfers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Transfer speeds depend on your internet connection and the recipient's connection. Since files transfer directly between devices, there are no server bottlenecks."
      }
    }
  ]
});