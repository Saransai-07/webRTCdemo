import { useEffect, useRef } from "react";

type Props = {
  stream: MediaStream | null;
  muted?: boolean;
};

function VideoPlayer({ stream, muted = false }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      width={400}
    />
  );
}

export default VideoPlayer;