import nodemailer from 'nodemailer';
import { EmailSendOptions } from "./types";

export default async function(opts : EmailSendOptions) {

    const transport = nodemailer.createTransport({
        host: opts.smtpHost,
        port: opts.smtpPort,
        secure: opts.secure ?? false,
        auth: {
            user: opts.secure ? opts.smtpUsername : undefined,
            pass: opts.secure ? opts.smtpPassword : undefined
        },
        tls: {
            rejectUnauthorized: opts.rejectUnauthorized??false
        }
    });

    const mailBody = {
        from: opts.fromEmail,
        to: opts.toEmail,
        subject: opts.subject,
        text: '',
        html: ''
    };

    const text = opts.bodyText === undefined ? '' : opts.bodyText.toString();

    if(opts.emailFormat == 'text') {
        mailBody.text = text
    } else {
        mailBody.html = opts.bodyHtml === undefined ? `<span style="white-space: pre-line;">${text}</span>` : opts.bodyHtml.toString();
    }

    await transport.sendMail(mailBody);

    return true;
}
