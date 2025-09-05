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
				label: 'SMTP Host',
				fieldName: 'smtpHost',
				description: 'SMTP host of the sender.',
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'mail.example.com',
					validation: { required: true }
				}
			},
			{
				label: 'SMTP Port',
				fieldName: 'smtpPort',
				description: 'SMTP port of the sender.',
				control: {
					name: 'input',
					dataType: 'number',
					defaultValue: 465,
					placeholder: '465',
					validation: { required: true }
				}
			},
			{
				label: 'Secure',
				fieldName: 'secure',
				description: 'Whether to use identity authentication.',
				control: {
					name: 'input',
					dataType: 'boolean',
					defaultValue: true,
					validation: { required: true }
				}
			},
			{
				label: 'SMTP Username',
				fieldName: 'smtpUsername',
				description: 'SMTP username of the sender.',
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'admin',
					validation: { required: true }
				}
			},
			{
				label: 'SMTP Password',
				fieldName: 'smtpPassword',
				description: 'SMTP password of the sender.',
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					validation: { required: true }
				}
			},
			{
				label: 'From Email',
				fieldName: 'fromEmail',
				description: 'Email address of the sender. You can also specify a name: Nathan Doe &lt;.',
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'admin@example.com',
					validation: { required: true }
				}
			},
			{
				label: 'To Email',
				fieldName: 'toEmail',
				description: 'Email address of the recipient. You can also specify a name: Nathan Doe &lt;.',
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'info@example.com',
					validation: { required: true }
				}
			},
			{
				label: 'Subject',
				fieldName: 'subject',
				description: 'Subject line of the email',
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: '',
					placeholder: 'My subject line'
				}
			},
			{
				label: 'Email Format',
				fieldName: 'emailFormat',
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: 'text',
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
					]
				}
			},
			{
				label: 'Text',
				fieldName: 'bodyText',
				description: 'Plain text message of email',
				conditionRules: {
					showBy: {
						emailFormat: ['text', 'both'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: ''
				}
			},
			{
				label: 'HTML',
				fieldName: 'bodyHtml',
				description: 'HTML text message of email',
				conditionRules: {
					showBy: {
						emailFormat: ['html', 'both'],
					},
				},
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: ''
				}
			},
			{
				label: 'Options',
				fieldName: 'options',
				control: {
					name: 'input',
					dataType: 'string',
					defaultValue: {},
					options: [
						{
							label: 'CC Email',
							fieldName: 'ccEmail',
							description: 'Email address of CC recipient',
							control: {
								name: 'input',
								dataType: 'string',
								defaultValue: '',
								placeholder: 'cc@example.com'
							}
						},
						{
							label: 'BCC Email',
							fieldName: 'bccEmail',
							description: 'Email address of BCC recipient',
							control: {
								name: 'input',
								dataType: 'string',
								defaultValue: '',
								placeholder: 'bcc@example.com'
							}
						},
						{
							label: 'Ignore SSL Issues (Insecure)',
							fieldName: 'allowUnauthorizedCerts',
							description: 'Whether to connect even if SSL certificate validation is not possible',
							control: {
								name: 'input',
								dataType: 'boolean',
								defaultValue: false
							}
						},
						{
							label: 'Reply To',
							fieldName: 'replyTo',
							description: 'The email address to send the reply to',
							control: {
								name: 'input',
								dataType: 'string',
								defaultValue: '',
								placeholder: 'info@example.com'
							}
						},
					]
				}
			}
		]
	}
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