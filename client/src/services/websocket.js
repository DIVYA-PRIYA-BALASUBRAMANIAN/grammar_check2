if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  window.global = window;
}

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function createStompClient(onConnectCallback) {
  const client = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws-chat'),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (str) => {
      // console.log('[STOMP]', str);
    },
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
