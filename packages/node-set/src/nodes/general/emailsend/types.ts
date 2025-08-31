import { Type, type Static } from "@sinclair/typebox";

export const EmailSendOptionsSchema = Type.Object({
    smtpHost: Type.String(),
    smtpPort: Type.Number(),
    secure: Type.Boolean(),
    smtpUsername: Type.String(),
    smtpPassword: Type.String(),
    rejectUnauthorized: Type.Boolean(),
    fromEmail: Type.String(),
    toEmail: Type.String(),
    subject: Type.String(),
    emailFormat: Type.String(),
    bodyText: Type.String(),
    bodyHtml: Type.String(),
});

export type EmailSendOptions = Static<typeof EmailSendOptionsSchema>;