import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Spotify Downloader",
  description: "Easilty diwnload tracks from Spotify to your devices, completely free!",
  keywords:["spotify", "Spotify Downloader", "spotify to mp3"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="w-full h-full -z-10 fixed">
          <div className="absolute bottom-0 md:bottom-1/4 left-0 md:left-1/3 w-44 h-44   rounded-full blur-[10rem] bg-green-600" />
          <div className="absolute bottom-2/3 left-[100px] w-24 h-24  rounded-full blur-[10rem] hidden md:block bg-green-600" />
          <div className="absolute top-10 right-24 w-32 h-32  rounded-full blur-[10rem] bg-green-600" />
        </div>
        {children}
        </body>
    </html>
  );
}
