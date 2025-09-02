import { ProxyAgent, fetch as http, Response, RequestInfo, RequestInit } from 'undici'

const proxy = process.env.FETCH_PROXY ? new ProxyAgent(process.env.FETCH_PROXY) : undefined;

export async function fetch(
    input: RequestInfo,
    init?: RequestInit
): Promise<Response> {
    if(proxy && init) {
        init.dispatcher = proxy;
    }
    return http(input, init);
}