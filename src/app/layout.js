import { Inter } from "next/font/google";
import Providers from "./providers";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Spotify Downloader",
  description: "Easily download spotify playlists or tracks.",
  keywords: ["Spotify", "Spotify Downloader", "Portfolio", "My Work"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Script
          defer
          src="https://analytics.eu.umami.is/script.js"
          data-website-id="4fdaf949-05a3-4ab3-bab2-a7faa5ac6884"
        />
        <div className="w-full h-full fixed -z-10">
          <div className="absolute bottom-0 md:bottom-1/4 left-0 md:left-1/3 w-44 h-44 bg-accent rounded-full blur-[180px]" />
          <div className="absolute bottom-2/3 left-[100px] w-24 h-24 bg-accent rounded-full blur-[150px] hidden md:block" />
          <div className="absolute top-10 right-24 w-32 h-32 bg-accent rounded-full blur-[150px]" />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
