import { useRef, useState } from "react";

export function usePeerConnection() {
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>("new");

  const addIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerRef.current) return;

    if (!peerRef.current.remoteDescription) {
      console.log("Remote description not set yet");
      pendingCandidates.current.push(candidate);
      return;
    }
    await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const flushPendingCandidates = async () => {
    if (!peerRef.current) return;

    for (const candidate of pendingCandidates.current) {
      await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    }

    pendingCandidates.current = [];
  };

  const createPeer = (
    stream: MediaStream,
    onIceCandidate: (candidate: RTCIceCandidate) => void,
  ) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });
    // Add local tracks to peer
    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });
    peer.onconnectionstatechange = () => {
      console.log("Connection state:", peer.connectionState);
      setConnectionState(peer.connectionState);
    };
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate");

        onIceCandidate(event.candidate);
      }
    };

    peer.ontrack = (event) => {
      console.log("Remote track received");

      const remote = event.streams[0];

      setRemoteStream(remote);
    };

    peerRef.current = peer;
    console.log("Peer connection created");
    return peer;
  };

  const createOffer = async () => {
    if (!peerRef.current) return null;
    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);
    console.log("Offer created:", offer);
    return offer;
  };

  const createAnswer = async (offer: RTCSessionDescriptionInit) => {
    if (!peerRef.current) return null;

    await peerRef.current.setRemoteDescription(
      new RTCSessionDescription(offer),
    );

    await flushPendingCandidates();

    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);

    console.log("Answer created:", answer);
    return answer;
  };

  const setRemoteAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerRef.current) return;

    await peerRef.current.setRemoteDescription(
      new RTCSessionDescription(answer),
    );

    await flushPendingCandidates();

    console.log("Remote answer set");
  };

  const closePeer = () => {
    peerRef.current?.close();
    peerRef.current = null;
    pendingCandidates.current = [];
    setRemoteStream(null);
  };

  return {
    peerRef,
    remoteStream,
    connectionState,
    createPeer,
    createOffer,
    createAnswer,
    setRemoteAnswer,
    addIceCandidate,
    closePeer,
  };
}
