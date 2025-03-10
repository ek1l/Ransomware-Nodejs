const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  console.log('Conectado ao WebSocket');
});

ws.on('close', () => {
  console.log('Conexão WebSocket fechada');
});

ws.on('error', (err) => {
  console.error('Erro no WebSocket:', err.message);
});

const sendLog = (message) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(message);
  } else {
    console.log('WebSocket não está pronto, tentando reconectar...');
  }
};
export default sendLog;
