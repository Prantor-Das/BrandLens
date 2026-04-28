import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"]
});

function getMetadataBase() {
  const explicitUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (explicitUrl) {
    return new URL(explicitUrl);
  }

  const vercelUrl = process.env.VERCEL_URL;

  if (vercelUrl) {
    return new URL(`https://${vercelUrl}`);
  }

  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "BrandLens AI",
  description: "Brand intelligence for the AI era. Compare how leading LLMs talk about your brand and where to improve visibility.",
  openGraph: {
    title: "BrandLens AI",
    description: "Query ChatGPT, Gemini, and Claude simultaneously and see how your brand ranks.",
    images: ["/opengraph-image"]
  }
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

function SparkleIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 text-[var(--color-accent)]" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1.5L9.45 5.55L13.5 7L9.45 8.45L8 12.5L6.55 8.45L2.5 7L6.55 5.55L8 1.5Z"
        fill="currentColor"
      />
      <path
        d="M12.5 11.5L13.05 13.45L15 14L13.05 14.55L12.5 16.5L11.95 14.55L10 14L11.95 13.45L12.5 11.5Z"
        fill="currentColor"
        opacity="0.72"
      />
    </svg>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html className={inter.variable} lang="en">
      <body>
        <div className="relative min-h-screen">
          <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_84%,transparent)] backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-8">
              <Link className="inline-flex items-center gap-3" href="/">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--background-elevated)_90%,transparent)]">
                  <SparkleIcon />
                </span>
                <span className="text-sm font-semibold tracking-[0.18em] text-[var(--foreground)] uppercase">
                  BrandLens
                </span>
              </Link>

              <nav className="flex items-center gap-5 text-sm text-[var(--foreground-muted)]">
                <Link
                  className="transition-colors duration-[var(--transition-fast)] hover:text-[var(--foreground)]"
                  href="/#how-it-works"
                >
                  How it works
                </Link>
                <a
                  className="transition-colors duration-[var(--transition-fast)] hover:text-[var(--foreground)]"
                  href="https://github.com"
                  rel="noreferrer"
                  target="_blank"
                >
                  GitHub
                </a>
              </nav>
            </div>
          </header>

          {children}

          <footer className="border-t border-[var(--border)]">
            <div className="mx-auto w-full max-w-7xl px-6 py-6 text-sm text-[var(--foreground-subtle)] md:px-8">
              BrandLens AI helps teams understand brand visibility across the models shaping buyer discovery.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
