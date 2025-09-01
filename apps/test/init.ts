import { initializeContainers } from "@repo/services";
import { initializeConnects, initializeNodes } from "@repo/node-set";

export async function init() {
    await initializeContainers();
    await initializeConnects();
    await initializeNodes();
}