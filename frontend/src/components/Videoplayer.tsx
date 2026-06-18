import { useEffect, useRef } from "react";

type Props = {
  stream: MediaStream | null;
  muted?: boolean;
};

function VideoPlayer({ stream, muted = false }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const hasVideo =
    stream?.getVideoTracks().length &&
    stream.getVideoTracks().length > 0;

  useEffect(() => {
    if (!stream) return;

    if (hasVideo && videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    if (!hasVideo && audioRef.current) {
      audioRef.current.srcObject = stream;
    }
  }, [stream, hasVideo]);

  if (!stream) {
    return <p>No stream available</p>;
  }

  if (hasVideo) {
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

  return (
    <div>
      <p>Audio stream active 🎤</p>
      <audio ref={audioRef} autoPlay muted={muted} />
    </div>
  );
}

export default VideoPlayer;