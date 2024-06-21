import Image from "next/image";
import Link from "next/link";
import Search from "./components/Search";

export default function Home() {
  return (
    <main className="w-full h-full flex items-center justify-center">
      <div className="px-5 w-full md:w-[700px] space-y-5">
        <div className="text-text">
          <br />
          <h1 className="text-4xl font-bold">SPOTIFY DOWNLOADER</h1>
        </div>
        <Search />
      </div>
    </main>
  );
}
