import { Inngest } from 'inngest';
import { realtimeMiddleware } from "@inngest/realtime";

const baseURL = process.env.INNGEST_BASEURL || 'http://127.0.0.1:8288'

export const inngest = new Inngest({
    id: 'cofly',
    baseUrl: baseURL,
    eventKey: process.env.INNGEST_EVENT_KEY,
    middleware: [realtimeMiddleware()],
});