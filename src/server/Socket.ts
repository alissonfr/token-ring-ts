import * as WebSocket from 'ws';

export class Socket {
  private server: WebSocket.Server;

  constructor(port: number) {
    this.server = new WebSocket.Server({ port });
    console.log(`Servidor rodando na porta ${port}...`)

    this.server.on('connection', this.handleConnection);
  }

  private handleConnection(socket: WebSocket) {
    console.log('Novo cliente conectado.');

    socket.on('message', (message: string) => {
      console.log(`Mensagem recebida: ${message}`);

      socket.send(`Você disse: ${message}`);
    });

    socket.on('close', () => {
      console.log('Cliente desconectado.');
    });

    socket.on('error', (error: Error) => {
      console.error(`Erro na conexão: ${error.message}`);
    });
  }
}


