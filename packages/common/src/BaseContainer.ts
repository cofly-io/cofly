import { Container, Newable } from "inversify";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // 环境变量类型定义
        }
        interface Process {
            __GLOBAL_CONTAINER__?: Container;
            __CONTAINER_INITIALIZED__?: boolean;
        }
    }
}

export function getContainer(): Container {
    // 检查是否已初始化
    if (!process.__GLOBAL_CONTAINER__) {
        process.__GLOBAL_CONTAINER__ = new Container({
            defaultScope: "Singleton",
        });
        process.__CONTAINER_INITIALIZED__ = true;
        console.log('Container initialized');
    }

    return process.__GLOBAL_CONTAINER__;
}

export class BaseContainer<T> {
    readonly #identity: string;

    get container() {
        return getContainer();
    }

    constructor(identity: string) {
        this.#identity = identity;
    }

    bind(contactor: Newable<T>) {
        if(!this.container.isBound(this.#identity))
        {
            this.container.bind<T>(this.#identity).to(contactor).inSingletonScope();
        }

        return this.mediator;
    }

    get mediator() : T | undefined {
        if(this.container.isBound(this.#identity)) {
            return this.container.get<T>(this.#identity);
        }

        return undefined;
    }
}