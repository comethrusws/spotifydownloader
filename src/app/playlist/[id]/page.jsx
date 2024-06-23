import { getPlaylist } from "@/lib/spotify";
import { notFound } from "next/navigation";
import React from "react";
import PlaylistInfo from "@/components/PlaylistInfo";
import TrackList from "@/components/TrackList";
import Search from "@/components/Search";
import HomeButton from "@/components/buttons/HomeButton";

const PlaylistPage = async ({ params }) => {
  const { id } = params;

  // Check if no id
  if (id === "null") return;

  // Fetch playlist
  const playlist = await getPlaylist(id);

  // Check if playlist was not found
  if (!playlist) notFound();

  return (
    <div className="w-full flex justify-center">
      <main className="md:mt-[100px] w-full md:w-[700px] py-8 px-5 space-y-4">
        <div className="flex items-center w-full gap-4">
          <HomeButton />
          <Search />
        </div>

        {playlist ? (
          <>
            <PlaylistInfo playlist={playlist} />
            <TrackList tracks={playlist.tracks} />
          </>
        ) : null}
      </main>
    </div>
  );
};

export default PlaylistPage;
