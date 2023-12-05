import { SocketServer } from "./socket-server";
import dotenv from 'dotenv';
dotenv.config();

const server = new SocketServer();
server.start(Number(process.env.SERVER_PORT!));