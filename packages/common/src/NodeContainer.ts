import "reflect-metadata"
import { NodeRegistry } from "./NodeRegistry";
import { Symbols } from "@cofly-ai/interfaces";
import { getContainer } from "./BaseContainer";

const container = getContainer();
if(!container.isBound(Symbols.NodeRegistry)) {
    getContainer().bind<NodeRegistry>(Symbols.NodeRegistry).to(NodeRegistry);
}

function getNodeRegistry() {
    return getContainer().get<NodeRegistry>(Symbols.NodeRegistry);
}

export { getNodeRegistry }