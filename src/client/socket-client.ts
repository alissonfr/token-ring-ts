import WebSocket from 'ws';
import * as readline from 'readline';

export class SocketClient {
  private ws: WebSocket;
  private rl: readline.Interface;

  constructor(host: string, port: string) {
    this.ws = new WebSocket(`ws://${host}:${port}`);
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.ws.on('open', () => {
      console.log('Conectado ao servidor');

      this.ws.on('message', (message: string) => {
        console.log(`Recebido: ${message}`);
        
        this.rl.question('Passar o token para o próximo cliente? (y/n): ', (answer) => {
          if (answer.toLowerCase() === 'y') {
            this.ws.send('TOKEN');
          }
        });
      });
    });
  }
}