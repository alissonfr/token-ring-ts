import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

export class SocketServer {
  private app: express.Application;
  private server: http.Server;
  private wss: WebSocket.Server;
  private tokenHolder: WebSocket | null;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });
    this.tokenHolder = null;

    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('Cliente conectado');

      if (!this.tokenHolder) {
        this.tokenHolder = ws;
        console.log('Detentor do token definido');
      }

      ws.on('message', (message: string) => {
        console.log(`Recebido: ${message}`);

        if (ws === this.tokenHolder) {
          this.tokenHolder = this.getNextClient(ws);
          if (this.tokenHolder) {
            console.log('Passando o token para o próximo cliente');
            this.tokenHolder.send('TOKEN');
          }
        }
      });

      ws.on('close', () => {
        console.log('Cliente desconectado');

        if (ws === this.tokenHolder) {
          this.tokenHolder = this.getNextClient(ws);
          if (this.tokenHolder) {
            console.log('Definindo o próximo cliente como novo detentor do token');
          }
        }
      });

      if (ws === this.tokenHolder) {
        console.log('Enviando token inicial para o detentor do token');
        ws.send('TOKEN');
      }
    });
  }

  private getNextClient(currentClient: WebSocket): WebSocket | null {
    const clients = Array.from(this.wss.clients);
    const currentIndex = clients.indexOf(currentClient);
    const nextIndex = (currentIndex + 1) % clients.length;

    return clients[nextIndex] as WebSocket;
  }

  public start(port: number) {
    this.server.listen(port, () => {
      console.log(`Servidor WebSocket iniciou na porta ${port}...`);
    });
  }
}


