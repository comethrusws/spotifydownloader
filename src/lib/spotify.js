import axios from "axios";

export const getToken = async () => {
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    "grant_type=client_credentials",
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      auth: {
        username: process.env.CLIENT_ID,
        password: process.env.CLIENT_SECRET,
      },
    }
  );

  return response.data.access_token;
};

export const getRequest = async (url) => {
  const token = await getToken();
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

export async function getPlaylist(id) {
  try {
    let playlist = await getRequest(
      `https://api.spotify.com/v1/playlists/${id}`
    );

    let { next } = playlist.tracks;
    while (next) {
      const nextTracks = await getRequest(next);
      playlist.tracks.items.push(...nextTracks.items);

      next = nextTracks.next;
    }

    return playlist;
  } catch (error) {
    console.error(`Error fetching playlist: ${id}`);
  }
}

export async function getTrack(id) {
  try {
    const track = await getRequest(`https://api.spotify.com/v1/tracks/${id}`);
    return track;
  } catch (error) {
    console.error("Error fetching track:", error);
  }
}
