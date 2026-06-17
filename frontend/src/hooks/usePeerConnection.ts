import { useRef } from "react";

export function usePeerConnection() {
  const peerRef = useRef<RTCPeerConnection | null>(null);

  const createPeer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    peerRef.current = peer;

    console.log("Peer connection created");
    return peer;
  };

  const createOffer = async () => {
    if (!peerRef.current) return null;

    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);

    console.log("Offer created", offer);
    return offer;
  };

  const createAnswer = async (offer: RTCSessionDescriptionInit) => {
    if (!peerRef.current) return null;

    await peerRef.current.setRemoteDescription(
      new RTCSessionDescription(offer),
    );

    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);

    console.log("Answer created", answer);

    return answer;
  };

  const setRemoteAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerRef.current) return;

    await peerRef.current.setRemoteDescription(
      new RTCSessionDescription(answer),
    );

    console.log("Remote answer set");
  };

  return {
    peerRef,
    createPeer,
    createOffer,
    createAnswer,
    setRemoteAnswer,
  };
}
