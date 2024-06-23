"use client";

import { downloadBlob, getFilenameFromHeaders } from "@/lib/utils";
import React, { createContext, useState, useContext, useEffect } from "react";
import Queue from "@/components/Queue";
import axios from "axios";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { ID3Writer } from "browser-id3-writer";
import JSZip from "jszip";
import { v4 as uuidv4 } from "uuid";
import DownloadDialog from "@/components/DownloadDialog";

const DownloaderContext = createContext();
export const useDownloader = () => useContext(DownloaderContext);
export const DownloaderProvider = ({ children }) => {
  // List of tracks or playlists
  const [queue, setQueue] = useState([]);

  // Current track or playlist being downloaded
  const [currentDownload, setCurrentDownload] = useState(null);

  // Already downloaded playlists or tracks
  const [downloadedItems, setDownloadedItems] = useState([]);

  // Trigger for downloading state
  const [downloading, setDownloading] = useState(false);

  // Progress
  const [progress, setProgress] = useState(0);

  // Download dialog
  const [dialogItem, setDialogItem] = useState(null);
  const [defaultSpeed, setDefaultSpeed] = useState(null);

  useEffect(() => {
    const download = async () => {
      // Get downloadable type
      const type = currentDownload.type;

      // Handle different types of downloadables
      if (type === "playlist") {
        const { blob, filename } = await downloadPlaylist(currentDownload);
        await downloadBlob(blob, filename);
        setProgress(0);
      } else if (type === "track") {
        const { buffer, filename } = await downloadTrack(currentDownload);
        await downloadBlob(buffer, filename);
        setProgress(0);
      }

      addToDownloaded(currentDownload);
      setDownloading(false);
    };

    if (currentDownload) {
      download();
    }
  }, [currentDownload]);

  // Trigger to move from track to track
  useEffect(() => {
    const nextInQueue = () => {
      if (queue.length !== 0) {
        // Get first item in list
        const next = queue[0];

        // Remove the item from the state
        setQueue((prev) => [...prev.slice(1, prev.length)]);
        return next;
      }

      // Return null if no items in list
      return null;
    };

    if (queue.length !== 0 && !downloading) {
      // Set the download to next in queue
      const next = nextInQueue();
      setCurrentDownload(next || null);
      setDownloading(true);
    } else if (!downloading) {
      // On finish remove the last download
      setCurrentDownload(null);
    }
  }, [queue, downloading]);

  const downloadPlaylist = async (playlist) => {
    try {
      const items = playlist.tracks.items;

      // Create zip file
      const zip = new JSZip();

      // Load FFmpeg
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();

      // Download tracks by chunks of n size
      const chunkSize = 10;
      const totalChunks = Math.ceil(items.length / chunkSize);

      // Iterate over chunks
      for (let i = 0; i < totalChunks; i++) {
        const chunkStart = i * chunkSize;
        const chunkEnd = Math.min(chunkStart + chunkSize, items.length);
        const chunkItems = items.slice(chunkStart, chunkEnd);

        // Push download promises to the array
        const downloadPromises = [];
        for (const item of chunkItems) {
          async function downloadWithProgress() {
            const track = await downloadTrack(
              { ...item.track, speed: playlist.speed },
              ffmpeg
            );
            setProgress((prev) => prev + (1 / playlist.tracks.total) * 100);
            return track;
          }
          downloadPromises.push(downloadWithProgress());
        }

        // Wait for all downloads in the current chunk to complete
        const downloads = await Promise.all(downloadPromises);

        // Add downloaded tracks to the zip
        downloads.forEach((download) => {
          if (download) {
            const { filename, buffer } = download;
            zip.file(filename, buffer);
          }
        });
      }

      // Get zip blob
      const blob = await zip.generateAsync({ type: "blob" });
      const filename = pathNamify(playlist.name) + ".zip";

      return { blob, filename };
    } catch (error) {
      console.error(error);
    }
  };

  const downloadTrack = async (track, ffmpeg = null) => {
    try {
      // Download track
      const response = await axios.post("/api/download/track", track, {
        responseType: "blob",
      });
      let buffer = response.data;

      let filename = getFilenameFromHeaders(response.headers);

      // If mode == slow it should conver to mp3 and add metadata
      if (track.speed === "slow") {
        // Convert to mp3
        buffer = await convert(response.data, ffmpeg);
        if (!buffer) return; // If any errors occur just return null

        buffer = await addMetadata(buffer, track);

        // Change file extension
        filename = filename.slice(0, -4) + ".mp3";
      }

      // Download blob with appropriate filename from headers
      return { buffer, filename };
    } catch (error) {
      console.error(error);
    }
  };

  function pathNamify(path) {
    return path.replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, "");
  }

  const convert = async (trackBuffer, ffmpeg = null) => {
    try {
      if (!ffmpeg) {
        // Load FFmpeg
        ffmpeg = new FFmpeg();
        await ffmpeg.load();
      }

      // Write the file
      const id = uuidv4();
      await ffmpeg.writeFile(`${id}.m4a`, await fetchFile(trackBuffer));

      // Execute FFmpeg command to convert mp4 to mp3
      await ffmpeg.exec(["-i", `${id}.m4a`, `${id}.mp3`]);
      const data = await ffmpeg.readFile(`${id}.mp3`);

      // Delete files
      await ffmpeg.deleteFile(`${id}.m4a`);
      await ffmpeg.deleteFile(`${id}.mp3`);

      return data.buffer;
    } catch (error) {
      console.error(error);
    }
  };

  async function addMetadata(buffer, track) {
    try {
      // Fetch cover
      const cover = await fetchCover(track.album.images[0].url);
      const writer = new ID3Writer(buffer);
      writer
        .setFrame("TIT2", track.name)
        .setFrame("TALB", track.album.name)
        .setFrame("TRCK", `${track.disk_number}`)
        .setFrame("TPE1", [
          track.artists.map((artist) => artist.name).join("; "),
        ])
        .setFrame("APIC", {
          type: 3,
          data: cover,
          description: `${track.name} cover`,
        });

      return writer.addTag();
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchCover(url) {
    try {
      // Fetch the image
      const response = await axios.get(url, { responseType: "arraybuffer" });

      // Return the image data as a buffer
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  const addDownload = (spotifyItem, speed) => {
    setQueue((prev) => [...prev, { ...spotifyItem, speed }]);
  };

  const addToDownloaded = (item) => {
    setDownloadedItems((prev) => [...prev, item]);
  };

  const itemState = (item) => {
    // Check if already downloaded
    const downloadedItem = downloadedItems.find(
      (downloadedItem) => item.id === downloadedItem.id
    );
    if (downloadedItem) return "downloaded";

    if (item.id === currentDownload?.id) return "downloading";

    // Check if
    const queuedItem = queue.find((queueItem) => item.id === queueItem.id);
    if (queuedItem) return "queued";

    return null;
  };

  const openDialog = (item) => {
    setDialogItem(item);
  };

  const closeDialog = () => {
    setDialogItem(null);
  };

  // Value object to be passed as context value
  const value = {
    addDownload,
    currentDownload,
    itemState,
    queue,
    progress,
    openDialog,
    closeDialog,
    dialogItem,
    setDefaultSpeed,
    defaultSpeed,
  };

  return (
    <DownloaderContext.Provider value={value}>
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full md:w-[700px] z-10"
        style={{ padding: 12 }}
      >
        <Queue />
      </div>
      <DownloadDialog />
      {children}
    </DownloaderContext.Provider>
  );
};
