import Link from "next/link";

const About = () => {
  return (
    <div className="w-full flex justify-center">
      <main className="md:mt-[100px] w-full md:w-[700px] py-8 px-5 space-y-4">
        <div className="text-text md:w-4/5 space-y-2">
          <h1 className="text-3xl font-bold mb-4">About</h1>
          <h2 className="text-2xl font-semibold mb-3">
            What does this website do?
          </h2>
          <p>
            This website allows users to download Spotify playlists and tracks
            easily. When downloading playlist the website returns a ZIP file
            with all the tracks. Individual tracks are served with metadata.
          </p>
          <h2 className="text-2xl font-semibold mb-3">How do I use it?</h2>
          <p>
            Simply press on the three dots in a Spotify track or playlist, share
            it, copy the link, then paste the link in the input dialog on the{" "}
            <Link href="/" className="underline">
              home page
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
};

export default About;
