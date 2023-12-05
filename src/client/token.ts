import { Socket } from "./socket-client";

export class Token {
    private id: number;
    private hasStick: boolean;
    private tokens: number[];
    private socket: Socket;

    constructor(id: number, hasStick: boolean, tokens: number[], socket: Socket) {
        this.id = id;
        this.hasStick = hasStick;
        this.tokens = tokens;
        this.socket = socket;
    }

    public passToken(): void {
        if (!this.hasStick) {
            console.log(`O token ${this.id} não está com o bastão.`);
            return;
        }

        let nextToken: number = this.id === this.tokens.length ? 0 : this.id;
        let tokenPassed: boolean = false;

        for (let i = 0; i < this.tokens.length; i++) {
            const result: string = '' // this.passTokenToNext(nextToken);

            if (result === 'success') {
                tokenPassed = true;
                break;
            }

            nextToken = (nextToken + 1) % this.tokens.length;
        }

        if (tokenPassed) {
            this.hasStick = false;
            console.log('O bastão foi passado para o próximo.');
        } else {
            console.log('O bastão não foi passado para o próximo.');
        }
    }

    public receiveToken(): void {
        // this.socket.receiveToken(this.id);
        this.hasStick = true;
        console.log('O token foi recebido.', `\n* Data horário atual: ${new Date().toLocaleString()}`)
    }
}