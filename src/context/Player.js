"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

const PlayerContext = createContext();
export const usePlayer = () => useContext(PlayerContext);
export const PlayerProvider = ({ children }) => {
  const [trackId, setTrackId] = useState(null);
  const [audio, setAudio] = useState(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (audio) {
      if (playing) {
        audio.play();
      } else {
        audio.pause();
      }
    }
  }, [audio, playing, trackId]);

  const loadAudio = (audioUrl) => {
    // Pause current audio if any
    audio?.pause();

    // Load audio data
    const audioSrc = new Audio(audioUrl);
    audioSrc.onended = function () {
      setPlaying(false);
    };

    // Set current track
    setTrackId(audioUrl);
    setAudio(audioSrc);

    // Play track regardless of current state
    setPlaying(true);
  };

  const togglePlay = (audioUrl) => {
    if (!audio || trackId !== audioUrl) {
      loadAudio(audioUrl);
    } else {
      setPlaying(!playing);
    }
  };

  const isTrackPlaying = (otherTrackId) => {
    return trackId === otherTrackId && playing;
  };

  // Value object to be passed as context value
  const value = { togglePlay, trackId, playing, isTrackPlaying };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};
