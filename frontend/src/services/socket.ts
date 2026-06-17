export function createSocket(roomId: any) {
  return new WebSocket(`ws://127.0.0.1:8000/ws/call/${roomId}/`);
}