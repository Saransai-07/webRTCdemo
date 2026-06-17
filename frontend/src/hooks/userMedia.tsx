import { useState } from "react";

export function useMediaStream() {
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startStream = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log("Devices:", devices);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(mediaStream);
      console.log("Media stream started:", mediaStream);
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
          alert(`Unknown error: ${error.name}`);
      }
    }
  };

  const stopStream = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  };

  return {
    stream,
    startStream,
    stopStream,
  };
}
