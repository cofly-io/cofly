import "reflect-metadata"
import { ConnectRegistry } from "./ConnectRegistry";
import { Symbols } from "@cofly-ai/interfaces";
import { getContainer } from "./BaseContainer";

const container = getContainer();
if(!container.isBound(Symbols.ConnectRegistry)) {
    getContainer().bind<ConnectRegistry>(Symbols.ConnectRegistry).to(ConnectRegistry);
}

function getConnectRegistry() {
    return getContainer().get<ConnectRegistry>(Symbols.ConnectRegistry);
}

export { getConnectRegistry }