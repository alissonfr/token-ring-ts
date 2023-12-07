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
      logMessage("\nAcessando recurso...")
      logSuccess("Recurso acessado.\n")
      this.nodeChoice();

    } else {
      logMessage("\nPassando token...\n")
      this.sendMessage(TipoMensagemEnum.TOKEN);
    }
  }

  private sendMessage(message: string) {
    const nextNode = this.getNextNode();

    const client = new WebSocket(`ws://${nextNode.host}:${nextNode.port}`);

    client.on("error", (err) => {
      logError(`O nó da porta ${nextNode.port} está offline. Tentando próximo...`)
      this.nodes[this.nodes.indexOf(nextNode)].isActive = false;
      this.sendMessage(TipoMensagemEnum.TOKEN);
    });

    client.on("open", () => {
      logSuccess(`Token passado para o nó da porta ${nextNode.port}`)
      client.send(message);
      this.nodes[this.nodes.indexOf(this.currentNode)].hasToken = false;
      this.nodes[this.nodes.indexOf(nextNode)].hasToken = true;
      this.resetNodes();
      client.close();
    });
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
    const client = new WebSocket(`ws://${nextNode.host}:${nextNode.port}`);

    client.on("error", (err) => {
      logError(`Ping: O nó da porta ${nextNode.port} está offline. Tentando próximo...`)
      this.nodes[nextIndex].isActive = false;

      if (this.nodes[nextIndex].hasToken) {
        this.nodes[nextIndex].hasToken = false;

        this.nodes[this.nodes.indexOf(this.currentNode)].hasToken = true;
        this.nodeChoice();
      }
    });

    client.on("open", () => {
      logSuccess(`Ping: O nó da porta ${nextNode.port} está online.`)
      this.resetNodes();
      client.close();
    });
  }

  private resetNodes(): void {
    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i].isActive = true;
    }
  }
}
