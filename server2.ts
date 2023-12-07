import * as net from 'net';
import * as readline from 'readline';
import { Token } from './src/interfaces/token';

export class TokenNode {
  private readLine: readline.Interface;
  private currentNode: Token;
  private nodes: Token[];
  private server: net.Server;
  private hasToken: boolean;

  constructor(currentNode: Token, nodes: Token[], hasToken: boolean) {
    this.currentNode = currentNode;
    this.nodes = nodes;
    this.hasToken = hasToken;

    this.readLine = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.server = net.createServer();
    this.run();
  }

  private run() {
    this.server.on('connection', (socket) => {
      socket.on('data', (data) => {
        this.handleMessage(data.toString());
      });
      
    });
    
    this.server.listen(this.currentNode.port, () => {
      console.log(`Node rodando na porta ${this.currentNode.port}...`);
      if (this.hasToken) {
        this.passToken();
      }
    });
  }

  private handleMessage(msg: string) {
    if (msg === 'TOKEN') {
      console.log("Token recebido!")
      // mandar mensagem 'recebido'
      this.hasToken = true;
      this.passToken();
    }
  }

  private passToken() {
    this.readLine.question('Deseja implementar o recurso? (s/n): ', (answer) => {
      if (answer.toLowerCase() === 's') {
        this.sendMessage("TOKEN");
      } else {
        this.passToken();
      }
    });
  }

  private sendMessage(message: string) {
    const nextToken = this.getNextToken();
    
    const client = new net.Socket();

    if(this.hasToken) {
      client.on('error', (err) => {
        client.destroy();
        console.log(`O node da porta ${nextToken.port} está offline. Tentando próximo...`);
        const currentTokenIndex = this.nodes.indexOf(this.currentNode);
        const nextIndex = (currentTokenIndex + 1) % this.nodes.length;
        this.nodes[nextIndex].isActive = false;
        this.sendMessage("TOKEN");
      });

      client.connect(nextToken.port, nextToken.host, () => {
        client.write(message);
        this.hasToken = false;
        client.destroy();
      });
    }
    
  }

  private getNextToken(): Token {
    const currentTokenIndex = this.nodes.indexOf(this.currentNode);

    for (let i = 1; i < this.nodes.length; i++) {
      const nextIndex = (currentTokenIndex + i) % this.nodes.length;
      const nextToken = this.nodes[nextIndex];

      if (nextToken.isActive) {
        return nextToken;
      }
    }

    return this.nodes[0];
  }
}