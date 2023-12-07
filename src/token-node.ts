import select, { Separator } from '@inquirer/select';
import WebSocket from "ws";
import { Token } from "./interfaces/token";
import { TipoMensagemEnum } from "./enums/tipo-mensagem.enum";
import { logError, logMessage, logSuccess } from './helpers/log.helper';

export class TokenNode {
  private currentNode: Token;
  private nodes: Token[];
  private wss: WebSocket.Server;

  constructor(currentNode: Token, nodes: Token[]) {
    this.currentNode = currentNode;
    this.nodes = nodes;

    this.wss = new WebSocket.Server({ port: this.currentNode.port });
  }

  run() {
    this.wss.on("connection", (ws) => {
      ws.on("message", (data) => {
        this.handleToken(data.toString());
      });
    });

    console.log(`Node rodando na porta ${this.currentNode.port}...`);

    if (this.currentNode.hasToken) {
      this.nodeChoice();
    }
  }

  private handleToken(msg: string) {
    if (msg === TipoMensagemEnum.TOKEN) {
      logSuccess("\nToken recebido!\n")
      this.nodes[this.nodes.indexOf(this.currentNode)].hasToken = true;
      this.nodeChoice();
    }
  }

  private async nodeChoice() {
    const answer = await select({
      message: 'Selecione uma opção',
      choices: [
        { name: 'Acessar recurso', value: '1', },
        { name: 'Passar o token para o próximo nó', value: '2', },
      ],
    });

    if (answer === "1") {
      this.accessResource();

    } else {
      this.passToken();
    }
  }

  private accessResource() {
    logMessage("\nAcessando recurso...")
    logSuccess("Recurso acessado.\n")
    this.nodeChoice();
  }

  private passToken() {
    logMessage("\nPassando token...\n")
    this.sendMessage(TipoMensagemEnum.TOKEN);
  }

  private sendMessage(message: string) {
    const nextNode = this.getNextNode();
    const client = this.createWebSocketClient(nextNode);

    client.on("error", (err) => {
      this.handleClientError(err, nextNode);
    });

    client.on("open", () => {
      this.handleClientOpen(nextNode, client, message);
    });
  }

  private createWebSocketClient(node: Token): WebSocket {
    return new WebSocket(`ws://${node.host}:${node.port}`);
  }

  private handleClientError(err: any, nextNode: Token) {
    logError(`O nó da porta ${nextNode.port} está offline. Tentando próximo...`)
    this.nodes[this.nodes.indexOf(nextNode)].isActive = false;
    this.sendMessage(TipoMensagemEnum.TOKEN);
  }

  private handleClientOpen(nextNode: Token, client: WebSocket, message: string) {
    logSuccess(`Token passado para o nó da porta ${nextNode.port}`)
    client.send(message);
    this.nodes[this.nodes.indexOf(this.currentNode)].hasToken = false;
    this.nodes[this.nodes.indexOf(nextNode)].hasToken = true;
    this.resetNodes();
    client.close();
  }

  private getNextNode(): Token {
    const currentNodeIndex = this.nodes.indexOf(this.currentNode);

    for (let i = 1; i < this.nodes.length; i++) {
      const nextIndex = (currentNodeIndex + i) % this.nodes.length;
      const nextNode = this.nodes[nextIndex];

      if (nextNode.isActive) {
        return nextNode;
      }
    }

    return this.currentNode;
  }

  checkNextNode() {
    if (this.nodes[this.nodes.indexOf(this.currentNode)].hasToken) {
      return; // Não tem pq ficar pingando nos outros se eu já tenho o token
    }

    const nextNode = this.getNextNode();
    const nextIndex = this.nodes.indexOf(nextNode);
    const client = this.createWebSocketClient(nextNode);

    client.on("error", (err) => {
      this.handlePingError(err, nextNode, nextIndex);
    });

    client.on("open", () => {
      this.handlePingSuccess(nextNode);
      client.close();
    });
  }

  private handlePingError(err: any, nextNode: Token, nextIndex: number) {
    logError(`Ping: O nó da porta ${nextNode.port} está offline. Tentando próximo...`)
    this.nodes[nextIndex].isActive = false;

    if (this.nodes[nextIndex].hasToken) {
      this.nodes[nextIndex].hasToken = false;
      this.nodes[this.nodes.indexOf(this.currentNode)].hasToken = true;
      this.nodeChoice();
    }
  }

  private handlePingSuccess(nextNode: Token) {
    logSuccess(`Ping: O nó da porta ${nextNode.port} está online.`)
    this.resetNodes();
  }

  private resetNodes(): void {
    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].isActive = true;
    }
  }
}
