import filenamify from "filenamify";
import { serverTimestamp } from "./utils";
const ytSearch = require("youtube-sr").default;
const ytdl = require("ytdl-core");
const { PassThrough } = require("stream");

// MAIN FUNCTIONS
export async function downloadTrack(track, silent = true) {
  try {
    if (!silent && track) {
      console.log(
        `[${serverTimestamp()}]: Downloading ${track.name} by ${
          track.artists[0].name
        }...`
      );
    }
    // Find and download YouTube video
    const id = await findYtId(track);
    let buffer = await downloadYT(id);

    // Create filename
    const filename =
      pathNamify(`${track.name} by ${track.artists[0].name}`) + ".m4a";

    return { buffer, filename };
  } catch (error) {
    console.error(error);
  }
}

// SUB FUNCTIONS
async function findYtId(track) {
  try {
    const query = `${track.name} by ${track.artists[0].name} official`;

    // Get search data
    const videos = await ytSearch.search(query, { limit: 5, type: "video" });

    // Find closest to the track's duration
    let closestDuration = null;
    let closestVideoUrl = null;

    for (const video of videos) {
      // Check if duration is exact
      if (video.duration === track.duration_ms) {
        return video.id;
      }

      // Check if closest duration
      if (
        !closestDuration ||
        Math.abs(video.duration - track.duration_ms) <
          Math.abs(closestDuration - track.duration_ms)
      ) {
        closestDuration = video.duration;
        closestVideoUrl = video.id;
      }
    }

    return closestVideoUrl;
  } catch (error) {
    console.error(error);
  }
}

async function downloadYT(id) {
  try {
    // Get info
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`);

    // Choose the highest quality audio format
    const audioFormat = ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
    });

    // Get audio stream and process it
    const audioStream = ytdl.downloadFromInfo(info, { format: audioFormat });
    const buffer = streamToBuffer(audioStream);

    return buffer;
  } catch (error) {
    console.error(error);
  }
}

async function streamToBuffer(stream) {
  try {
    return new Promise((resolve, reject) => {
      const mp3Buffer = [];
      const outputStream = new PassThrough();
      outputStream.on("error", (err) => {
        reject(err);
      });
      outputStream.on("end", () => {
        const finalBuffer = Buffer.concat(mp3Buffer);
        resolve(finalBuffer);
      });

      stream.pipe(outputStream);
      outputStream.on("data", (chunk) => {
        mp3Buffer.push(chunk);
      });

      outputStream.on("error", (err) => {
        reject(err);
      });
    });
  } catch (error) {
    console.error(error);
  }
}

// UTIL FUNCTIONS
function pathNamify(path) {
  return filenamify(path).replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, "");
}
