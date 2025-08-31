import { subscribe } from "@inngest/realtime";
import { StatusType } from "@repo/common";
import { EventMediator, inngest, triggerConfig } from "./index";

export interface WorkflowRunOptions {
    data: any;
    waitOutput?: boolean | false;
    debug?: boolean | false;
    stream?: boolean | false;
}

export interface WorkflowEvent {
    type: 'workflow';
    status: "RUNNING" | "COMPLETED" | "FAILED",
    startedAt: number,
    endedAt?: number,
}

export interface WorkflowActionEvent {
    name: string,
    type: 'action'
    status: StatusType,
    startedAt: number,
    endedAt?: number,
    input?: any;
    output?: any;
}

const topic = "messages";

export class WorkflowMediator {

    public static channel(eventId?: string) {
        return `workflow/debug/${eventId}`;
    }

    public static async publish(publish?: any, eventId?: string, data?: WorkflowEvent | WorkflowActionEvent) {
        if(publish !== undefined) {
            await publish({
                channel: this.channel(eventId),
                topic: topic,
                data: data,
            });
        }
    }

    public static async subscribe(eventId: string) {
        return await subscribe({
            app: inngest,
            channel: this.channel(eventId),
            topics: [topic],
        });
    }

    public static async run(opts: WorkflowRunOptions) {
        const eventData = {
            ...opts.data,
            debug: opts.debug,
            stream: opts.stream
        }

        return await EventMediator.sendEvent(triggerConfig.event, eventData, opts.waitOutput);
    }
}