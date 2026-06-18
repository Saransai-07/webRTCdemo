import { useState } from "react";

export function useMediaStream() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const startStream = async (): Promise<MediaStream | null> => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: false, // use false on your desktop
        audio: true,
      });

      setStream(mediaStream);
      console.log("Media Stream:", mediaStream);
      return mediaStream;
    } catch (error: any) {
      return null;
    }
  };

  const toggleMute = () => {
    if (!stream) return;

    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;
    setIsMuted(!audioTrack.enabled);
  };

  const toggleCamera = () => {
    if (!stream) return;

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) {
      console.log("No camera available");
      return;
    }

    videoTrack.enabled = !videoTrack.enabled;
    setIsCameraOff(!videoTrack.enabled);
  };

  const stopStream = () => {
    stream?.getTracks().forEach((track) => track.stop());

    setStream(null);
    setIsMuted(false);
    setIsCameraOff(false);
  };

  return {
    stream,
    startStream,
    stopStream,
    toggleMute,
    toggleCamera,
    isMuted,
    isCameraOff,
  };
}