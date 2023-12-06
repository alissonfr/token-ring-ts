import * as dgram from 'dgram';
import * as readline from 'readline';
import { Token } from './interfaces/token';

export class TokenNode {
  private readLine: readline.Interface;
  private currentNode: Token;
  private nodes: Token[];
  private socket: dgram.Socket;
  private hasToken: boolean;

  constructor(currentNode: Token, nodes: Token[]) {
    this.currentNode = currentNode;
    this.nodes = nodes;
    this.hasToken = true;

    this.readLine = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.socket = dgram.createSocket('udp4');
    this.run();
  }

  private run() {
    this.socket.on('message', (msg, rinfo) => {
      this.handleMessage(msg.toString());
    });

    this.socket.bind(this.currentNode.port, () => {
      console.log(`Node rodando na porta ${this.currentNode.port}...`);
      this.listenForToken();
    });
  }

  private handleMessage(msg: string) {
    if (msg === 'TOKEN') {
      this.hasToken = true;
      this.readLine.question('Você quer passar o token? (s/n): ', (answer) => {
        if (answer.toLowerCase() === 's') {
          this.passToken();
        } else {
          this.listenForToken();
        }
      });
    }
  }

  private passToken() {
    this.hasToken = false;
    const nextNodeSocket = dgram.createSocket('udp4');
    const nextToken = this.getNextToken();
    this.socket.send('TOKEN', nextToken.port, nextToken.host, (err) => {
      if (err) {
        console.error(err);
      }
      this.socket.close();
      this.listenForToken();
    });
  }

  private listenForToken() {
    const nextToken = this.getNextToken();
    this.socket.send('TOKEN', nextToken.port, nextToken.host, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  private getNextToken(): Token {
    const currentIndex = this.nodes.indexOf(this.currentNode);
    const nextIndex = (currentIndex + 1) % this.nodes.length;

    return this.nodes[nextIndex];
  }

}
