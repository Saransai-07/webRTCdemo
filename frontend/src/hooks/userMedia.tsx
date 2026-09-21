import { useState } from "react";

export function useMediaStream() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const startStream = async (): Promise<MediaStream | null> => {
    try {
      console.log("navigator:", navigator);
      console.log("mediaDevices:", navigator.mediaDevices);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });

      setStream(mediaStream);
      console.log("Media Stream:", mediaStream);
      return mediaStream;
    } catch (error: any) {
      console.error("Media error:", error);
      switch (error.name) {
        case "NotAllowedError":
          alert("Permission denied");
          break;
        case "NotFoundError":
          alert("Camera or microphone not found");
          break;
        case "NotReadableError":
          alert("Device already in use");
          break;
        default:
          alert(`Unknown error: ${error.TypeError}`);
          console.log(error.TypeError);
      }
      return null;
    }
  };

  const stopStream = () => {
    stream?.getTracks().forEach((track) => track.stop());

    setStream(null);
    setIsMuted(false);
    setIsCameraOff(false);
  };
  const toggleMute = () => {
    if (!stream) return;

    const audioTrack = stream.getAudioTracks()[0];

    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;
    setIsMuted(!audioTrack.enabled);

    console.log("Microphone:", audioTrack.enabled ? "ON" : "OFF");
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

    console.log("Camera:", videoTrack.enabled ? "ON" : "OFF");
  };

  return {
    stream,
    startStream,
    stopStream,
    toggleCamera,
    toggleMute,
    isCameraOff,
    isMuted,
  };
}
