import { getPlaylist } from "@/lib/spotify";
import { NextResponse } from "next/server";

export const GET = async (request, { params }) => {
  const id = params.id;

  if (!id)
    return NextResponse.json(
      { message: "Provide a playlist ID" },
      { status: 400 }
    );

  try {
    const playlist = await getPlaylist(id);
    return NextResponse.json(playlist);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "There has been an error fetching the playlist" },
      { status: 500 }
    );
  }
};
