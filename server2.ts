import * as WebSocketServer from 'ws';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const PORT = 3001;

class TokenRingServer {
  private server: WebSocketServer.Server;
  private nextServerUrl: string;

  constructor(port: number) {
    this.server = new WebSocketServer.Server({ port }, () => {
      console.log(`Server listening on port ${port}`);
      // if(PORT === 3000) this.askQuestion()
    });

    this.server.on('connection', (socket: WebSocketServer) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: WebSocketServer) {
    socket.on('message', (message: string) => {
      this.handleMessage(socket, message);
    });
  }

  private async handleMessage(socket: WebSocketServer, message: string) {
    if (message === 'token') {
      console.log('Received token. Asking question...');
      const answer = await this.askQuestion();
      
      // Send token to the next server only if the answer is provided
      if (answer) {
        console.log('Passing token to the next server...');
        this.passToken();
      }
    }
  }

  private async askQuestion(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      rl.question('Do you want to pass the token? (yes/no): ', (answer) => {
        resolve(answer.toLowerCase() === 'yes');
      });
    });
  }

  private passToken() {
    const client = new WebSocket(this.nextServerUrl);

    client.addEventListener("open", (event) => {
      console.log('Connected to the next server. Passing token...');
      client.send('token');
      client.send("Olá, servidor!");
    });
  }

  public setNextServerUrl(url: string) {
    this.nextServerUrl = url;
  }
}

// Usage
const server = new TokenRingServer(PORT);
const nextServerUrl = 'ws://localhost:3000'; // Set the URL of the next server
server.setNextServerUrl(nextServerUrl);
