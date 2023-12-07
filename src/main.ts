import * as config from '../config.json';
import { TokenNode } from "./token-node";
import { NodeConfig } from "./interfaces/node-config";
import { Token } from "./interfaces/token";

const main = () => {
    const nodeConfig: NodeConfig = config;
    const currentNode: Token = nodeConfig.nodes[nodeConfig.nodeIndex];
    const nodes = nodeConfig.nodes
    const hasToken = nodes.indexOf(currentNode) === 0;

    new TokenNode(currentNode, nodes, hasToken);
}

main();