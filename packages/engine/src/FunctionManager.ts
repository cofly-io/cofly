import { InngestFunction } from "inngest";

class FunctionManager {
    readonly #functions: Map<string, InngestFunction.Like>;
    #version: number;

    constructor() {
        this.#functions = new Map();
        this.#version = Date.now();
    }

    get functions(): InngestFunction.Like[] {
        return Array.from(this.#functions.values());
    }

    get version(): number {
        return this.#version;
    }

    set(funcId: string, func : InngestFunction.Like) {
        this.#functions.set(funcId, func);
        this.#version = Date.now();
    }

    delete(funcId: string) {
        this.#functions.delete(funcId);
        this.#version = Date.now();
    }

    contains(funcId: string) {
        return this.#functions.has(funcId);
    }
}

export const functionManager = new FunctionManager();