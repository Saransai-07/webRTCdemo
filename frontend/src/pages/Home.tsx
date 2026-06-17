import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const joinRoom = () => {
    if (!roomId) return;
    navigate(`/room/${roomId}`);
  };

  return (
    <div>
      <h1>Video Call App</h1>

      <input
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter Room ID"
      />

      <button onClick={joinRoom}>Join Room</button>
    </div>
  );
}

export default Home;