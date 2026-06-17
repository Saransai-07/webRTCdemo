import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { createSocket } from "../services/socket";
import { useMediaStream } from "../hooks/userMedia";
// import VideoPlayer from "../components/videoplayer";
import { usePeerConnection } from "../hooks/usePeerConnection";
import VideoPlayer from "../components/Videoplayer";
// import VideoPlayer from "../components/VideoPlayer";
// import { useMediaStream } from "../hooks/useMediaStream";

function Room() {
  const { roomId } = useParams();
  const { stream, startStream } = useMediaStream();
  const { createPeer } = usePeerConnection();
  

  useEffect(() => {
    const socket = createSocket(roomId);

    socket.onopen = () => {
      console.log("Connected");

      socket.send(
        JSON.stringify({
          type: "joined",
          room: roomId,
        }),
      );
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received:", data);
    };

    startStream();
    createPeer();
    
    

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div>
      <h1>Room: {roomId}</h1>
      <VideoPlayer stream={stream} muted />
    </div>
  );
}

export default Room;
