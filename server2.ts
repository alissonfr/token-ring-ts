import * as dgram from 'dgram';
import * as readline from 'readline';

class Node {
  private rl: readline.Interface;
  private PORT: number;
  private nextNodeIP: string;
  private nextNodePort: number;
  private socket: dgram.Socket;
  private hasToken: boolean;

  constructor(PORT: number, nextNodeIP: string, nextNodePort: number) {
    this.PORT = PORT;
    this.nextNodeIP = nextNodeIP;
    this.nextNodePort = nextNodePort;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.socket = dgram.createSocket('udp4');
    this.hasToken = true;

    this.socket.on('message', (msg, rinfo) => {
      this.handleMessage(msg.toString());
    });

    this.socket.bind(this.PORT, () => {
      console.log(`Node rodando na porta ${this.PORT}...`);
      this.listenForToken();
    });
  }

  private handleMessage(msg: string) {
    if (msg === 'TOKEN') {
      this.hasToken = true;
      this.rl.question('Você quer passar o bastão? (s/n): ', (answer) => {
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
    const nextNode = dgram.createSocket('udp4');
    nextNode.send('TOKEN', this.nextNodePort, this.nextNodeIP, (err) => {
      if (err) {
        console.error(err);
      }
      nextNode.close();
      this.listenForToken();
    });
  }

  private listenForToken() {
    this.socket.send('TOKEN', this.nextNodePort, this.nextNodeIP, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
}

const PORT = 3001;
const nextNodeIP = '127.0.0.1';
const nextNodePort = 3000;

const node = new Node(PORT, nextNodeIP, nextNodePort);
