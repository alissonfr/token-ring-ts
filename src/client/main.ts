import { Token } from './token';
import { SocketClient } from './socket-client';
import dotenv from 'dotenv';
dotenv.config();

const TOKENS: number[] = [1, 2, 3];

function main(): void {
    const socket = new SocketClient(process.env.SERVER_HOST!, process.env.SERVER_PORT!);
    //const token = new Token(1, false, TOKENS, socket);
    
    //token.passToken();
    //token.receiveToken();
}

main();
