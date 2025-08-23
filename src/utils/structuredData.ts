export const createWebsiteStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "PeerShare",
  "description": "Secure, fast, and privacy-focused peer-to-peer file sharing platform",
  "url": "https://peershare.tech",
  "logo": "https://peershare.tech/favicon.png",
  "sameAs": [
    "https://twitter.com/lovable_dev"
  ],
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://peershare.tech/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
});

export const createSoftwareApplicationStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PeerShare",
  "description": "Direct peer-to-peer file sharing with end-to-end encryption. No uploads, no limits, no compromises on privacy.",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web Browser, Windows, macOS, Linux, iOS, Android",
  "url": "https://peershare.tech",
  "screenshot": "https://lovable.dev/opengraph-image-p98pqg.png",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "127"
  },
  "author": {
    "@type": "Organization",
    "name": "PeerShare Team"
  }
});

export const createHowToStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Share Files with PeerShare",
  "description": "Learn how to securely share files using peer-to-peer technology",
  "image": "https://lovable.dev/opengraph-image-p98pqg.png",
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
      "image": "https://peershare.tech/step1.png"
    },
    {
      "@type": "HowToStep",
      "name": "Share Link",
      "text": "Get an instant secure link. Share it however you like - text, email, or chat.",
      "image": "https://peershare.tech/step2.png"
    },
    {
      "@type": "HowToStep",
      "name": "Direct Transfer",
      "text": "Files transfer directly between devices. Fast, private, and secure.",
      "image": "https://peershare.tech/step3.png"
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