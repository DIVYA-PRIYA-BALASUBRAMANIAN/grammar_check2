if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  window.global = window;
}

import { Client } from '@stomp/stompjs';

export function createStompClient(onConnectCallback) {
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = typeof window !== 'undefined' && window.location.hostname ? `${window.location.hostname}:8080` : 'localhost:8080';
  const brokerURL = `${protocol}//${host}/ws-chat`;

  const client = new Client({
    brokerURL: brokerURL,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: () => {},
    onConnect: (frame) => {
      if (onConnectCallback) onConnectCallback(client);
    },
    onStompError: (frame) => {
      console.warn('STOMP broker error:', frame.headers['message'], frame.body);
    }
  });

  try {
    client.activate();
  } catch (err) {
    console.warn('WebSocket activate error:', err);
  }

  return client;
}
