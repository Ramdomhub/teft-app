import { Metadata } from "next";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { token } = await params;
  const sp = await searchParams;
  const name = sp.name || "Unknown Token";
  const symbol = sp.symbol || "?";
  const multiplier = sp.mx ? parseFloat(sp.mx) : null;
  const wallets = sp.w || "0";
  const pctChange = multiplier ? `${((multiplier - 1) * 100).toFixed(0)}%` : "";
  const title = `⚡ ${symbol} ${pctChange} | TEFT Pulse`;
  const description = `${wallets}x Smart Wallets bought ${name}. Entry: ${sp.em || "?"} → Now: ${sp.cm || "?"}. See what others don't.`;
  const ogImageUrl = `https://teftlegion.com/api/og/${token}?${new URLSearchParams(sp as Record<string, string>).toString()}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      url: `https://teftlegion.com/pulse/signal/${token}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function SignalPage() {
  redirect("/pulse");
}
