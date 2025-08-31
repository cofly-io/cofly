import { INode, INodeBasic, INodeDetail, NodeLink, CatalogType, IExecuteOptions, IconName } from '@repo/common';
import config from "./node.json"
import emailSend from "./EmailSend"

export class EmailSend implements INode {
    node: INodeBasic = {
        kind: config.kind,
        name: config.name,
        catalog: config.catalog as CatalogType,
        version: config.version,
        description: config.description,
        icon: config.icon as IconName
    };
    detail: INodeDetail = {
        // displayName: config.displayName,
        // name: config.name,
        // group: config.group as NodeGroupType[],
        // subtitle: config.subtitle,
        // description: config.description,
        // inputs: [NodeConnectionTypes.Main],
        // outputs: [NodeConnectionTypes.Main],
        fields: [
            {
                displayName: 'SMTP Host',
                name: 'smtpHost',
                type: 'string',
                default: '',
                required: true,
                placeholder: 'mail.example.com',
                description:
                    'SMTP host of the sender.',
                controlType: 'input'
            },
            {
                displayName: 'SMTP Port',
                name: 'smtpPort',
                type: 'number',
                default: 465,
                required: true,
                placeholder: '465',
                description:
                    'SMTP port of the sender.',
                controlType: 'input'
            },
            {
                displayName: 'Secure',
                name: 'secure',
                type: 'boolean',
                default: true,
                required: true,
                placeholder: '',
                description:
                    'Whether to use identity authentication.',
                controlType: 'input'
            },
            {
                displayName: 'SMTP Username',
                name: 'smtpUsername',
                type: 'string',
                default: "",
                required: true,
                placeholder: 'admin',
                description:
                    'SMTP username of the sender.',
                controlType: 'input'
            },
            {
                displayName: 'SMTP Password',
                name: 'smtpPassword',
                type: 'string',
                default: "",
                required: true,
                placeholder: '',
                description:
                    'SMTP password of the sender.',
                controlType: 'input'
            },
            {
                displayName: 'From Email',
                name: 'fromEmail',
                type: 'string',
                default: '',
                required: true,
                placeholder: 'admin@example.com',
                description:
                    'Email address of the sender. You can also specify a name: Nathan Doe &lt;.',
                controlType: 'input'
            },
            {
                displayName: 'To Email',
                name: 'toEmail',
                type: 'string',
                default: '',
                required: true,
                placeholder: 'info@example.com',
                description:
                    'Email address of the recipient. You can also specify a name: Nathan Doe &lt;.',
                controlType: 'input'
            },
            {
                displayName: 'Subject',
                name: 'subject',
                type: 'string',
                default: '',
                placeholder: 'My subject line',
                description: 'Subject line of the email',
                controlType: 'input'
            },
            {
                displayName: 'Email Format',
                name: 'emailFormat',
                type: 'options',
                options: [
                    {
                        name: 'Text',
                        value: 'text',
                    },
                    {
                        name: 'HTML',
                        value: 'html',
                    },
                    {
                        name: 'Both',
                        value: 'both',
                    },
                ],
                default: 'text',
                controlType: 'input'
            },
            {
                displayName: 'Text',
                name: 'bodyText',
                type: 'string',
                // typeOptions: {
                //     rows: 5,
                // },
                default: '',
                description: 'Plain text message of email',
                displayOptions: {
                    showBy: {
                        emailFormat: ['text', 'both'],
                    },
                },
                controlType: 'input'
            },
            {
                displayName: 'HTML',
                name: 'bodyHtml',
                type: 'string',
                // typeOptions: {
                //     rows: 5,
                // },
                default: '',
                description: 'HTML text message of email',
                displayOptions: {
                    showBy: {
                        emailFormat: ['html', 'both'],
                    },
                },
                controlType: 'input'
            },
            {
                displayName: 'Options',
                name: 'options',
                type: 'collection',
                placeholder: 'Add option',
                default: {},
                controlType: 'input',
                options: [
                    {
                        displayName: 'CC Email',
                        name: 'ccEmail',
                        type: 'string',
                        default: '',
                        placeholder: 'cc@example.com',
                        description: 'Email address of CC recipient',
                        controlType: 'input',
                    },
                    {
                        displayName: 'BCC Email',
                        name: 'bccEmail',
                        type: 'string',
                        default: '',
                        placeholder: 'bcc@example.com',
                        description: 'Email address of BCC recipient',
                        controlType: 'input',
                    },
                    {
                        displayName: 'Ignore SSL Issues (Insecure)',
                        name: 'allowUnauthorizedCerts',
                        type: 'boolean',
                        default: false,
                        description: 'Whether to connect even if SSL certificate validation is not possible',
                        controlType: 'input',
                    },
                    {
                        displayName: 'Reply To',
                        name: 'replyTo',
                        type: 'string',
                        default: '',
                        placeholder: 'info@example.com',
                        description: 'The email address to send the reply to',
                        controlType: 'input',
                    },
                ],
            },
        ],
    };

    async execute(opts: IExecuteOptions): Promise<any> {
        const inputs = opts?.inputs
        return await emailSend({
            smtpHost: inputs?.smtpHost,
            smtpPort: inputs?.smtpPort,
            secure: inputs?.secure,
            smtpUsername: inputs?.smtpUsername,
            smtpPassword: inputs?.smtpPassword,
            rejectUnauthorized: inputs?.rejectUnauthorized,
            fromEmail: inputs?.fromEmail,
            toEmail: inputs?.toEmail,
            subject: inputs?.subject,
            emailFormat: inputs?.emailFormat,
            bodyText: inputs?.bodyText,
            bodyHtml: inputs?.bodyHtml,
        });
    }
}
