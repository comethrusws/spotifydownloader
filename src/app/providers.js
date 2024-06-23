"use client";
import { DownloaderProvider } from "@/context/Download";

const Providers = ({ children }) => {
  return <DownloaderProvider>{children}</DownloaderProvider>;
};

export default Providers;
