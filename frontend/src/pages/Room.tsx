import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { createSocket } from "../services/socket";
import { useMediaStream } from "../hooks/userMedia";
import { usePeerConnection } from "../hooks/usePeerConnection";
import VideoPlayer from "../components/Videoplayer";

function Room() {
  const { roomId } = useParams();

  const socketRef = useRef<WebSocket | null>(null);
  const myId = useRef(crypto.randomUUID());

  const {
    stream,
    startStream,
    stopStream,
    toggleCamera,
    toggleMute,
    isCameraOff,
    isMuted,
  } = useMediaStream();

  const {
    remoteStream,
    connectionState,
    createPeer,
    createOffer,
    createAnswer,
    setRemoteAnswer,
    addIceCandidate,
    closePeer,
  } = usePeerConnection();

  useEffect(() => {
    const initialize = async () => {
      // 3. Create websocket
      const socket = createSocket(roomId);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connected");

        socket.send(
          JSON.stringify({
            sender: myId.current,
            type: "joined",
            room: roomId,
          }),
        );
      };

      // 1. Start local media
      const localStream = await startStream();

      // 2. Create peer after media is ready
      if (localStream) {
        createPeer(localStream, (candidate) => {
          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(
              JSON.stringify({
                sender: myId.current,
                type: "candidate",
                candidate,
              }),
            );
          }
        });
      }

      socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.sender === myId.current) {
          console.log("Ignoring own message");
          return;
        }
        console.log("Received:", data);

        if (data.type === "offer") {
          console.log("Offer received");

          const answer = await createAnswer(data.offer);

          if (answer) {
            socket.send(
              JSON.stringify({
                sender: myId.current,
                type: "answer",
                answer,
              }),
            );
          }
        }

        if (data.type === "answer") {
          console.log("Answer received");
          await setRemoteAnswer(data.answer);
        }

        if (data.type === "candidate") {
          console.log("Candidate received");
          await addIceCandidate(data.candidate);
        }
      };

      socket.onclose = () => {
        console.log("Socket disconnected");
      };
    };

    initialize();

    return () => {
      socketRef.current?.close();
      closePeer();
      stopStream();
    };
  }, []);

  const handleCall = async () => {
    const offer = await createOffer();

    if (!offer) return;

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          sender: myId.current,
          type: "offer",
          offer,
        }),
      );
    }

    console.log("Offer sent");
  };

  const handleEndCall = () => {
    socketRef.current?.close();
    closePeer();
    stopStream();
  };

  useEffect(() => {
    console.log("Remote stream updated:", remoteStream);
  }, [remoteStream]);

  return (
    <div>
      <h1>Room: {roomId}</h1>
      <p>Status: {connectionState}</p>

      <button
        onClick={handleCall}
        disabled={
          connectionState === "connecting" || connectionState === "connected"
        }
      >
        Start Call
      </button>

      <h3>Local</h3>
      <VideoPlayer stream={stream} muted />

      <h3>Remote</h3>
      <VideoPlayer stream={remoteStream} />

      <button onClick={toggleMute}>{isMuted ? "Unmute" : "Mute"}</button>

      <button onClick={toggleCamera}>
        {isCameraOff ? "Camera On" : "Camera Off"}
      </button>

      <button onClick={handleEndCall}>End Call</button>
    </div>
  );
}

export default Room;
