import { Token } from './token';
import { Socket } from './socket';

const HOST = 'localhost';
const PORT = 3000;
const TOKENS: number[] = [1, 2, 3];

function main(): void {
    const socket: Socket = new Socket(HOST, PORT);
    const token: Token = new Token(1, false, TOKENS, socket);
    
    token.passToken();
    token.receiveToken();
}

main();
