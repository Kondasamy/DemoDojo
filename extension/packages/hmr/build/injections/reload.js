(function () {
  'use strict';

  const LOCAL_RELOAD_SOCKET_PORT = 8081;
  const LOCAL_RELOAD_SOCKET_URL = `ws://localhost:${LOCAL_RELOAD_SOCKET_PORT}`;

  const DO_UPDATE = 'do_update';
  const DONE_UPDATE = 'done_update';

  class MessageInterpreter {
     constructor() {}

    static send(message) {
      return JSON.stringify(message);
    }

    static receive(serializedMessage) {
      return JSON.parse(serializedMessage);
    }
  }

  function initClient({ id, onUpdate }) {
    const ws = new WebSocket(LOCAL_RELOAD_SOCKET_URL);

    ws.onopen = () => {
      ws.addEventListener('message', event => {
        const message = MessageInterpreter.receive(String(event.data));

        if (message.type === DO_UPDATE && message.id === id) {
          onUpdate();
          ws.send(MessageInterpreter.send({ type: DONE_UPDATE }));
          return;
        }
      });
    };
  }

  function addReload() {
    const reload = () => {
      chrome.runtime.reload();
    };

    initClient({
      // @ts-expect-error That's because of the dynamic code loading
      id: __HMR_ID,
      onUpdate: reload,
    });
  }

  addReload();

})();
