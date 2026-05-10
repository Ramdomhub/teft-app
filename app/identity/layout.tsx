export default function IdentityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export async function generateMetadata({ searchParams }: { searchParams: { ref?: string } }) {
  const ogUrl = `https://teftlegion.com/api/og/identity`;
  return {
    title: "TEFT Legion Identity",
    description: "Your wallet already has a rank. Reveal your TEFT Identity.",
    openGraph: {
      title: "TEFT Legion Identity",
      description: "Your wallet already has a rank. Reveal your TEFT Identity.",
      images: [{ url: ogUrl, width: 1200, height: 630 }],
      url: "https://teftlegion.com/identity",
    },
    twitter: {
      card: "summary_large_image",
      title: "TEFT Legion Identity",
      description: "Yours is still hidden. Reveal it.",
      images: [ogUrl],
    },
  };
}
