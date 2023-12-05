import { Socket } from "./Socket";
import dotenv from 'dotenv';

dotenv.config();

const webSocketServer = new Socket(Number(process.env.SERVER_PORT));