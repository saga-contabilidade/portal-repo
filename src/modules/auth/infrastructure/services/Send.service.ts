import { config } from '@/config';
import { MailtrapClient } from 'mailtrap';

export interface IMailService {
    sendPasswordResetEmail (
        to: string,
        name: string,
        token: string,
    ): Promise <void>; 
}

export class MailtrapClientService implements IMailService{
    private client: MailtrapClient;
    private readonly fromEmail = config.mail.fromEmail;
    private readonly domainLink = config.mail.domainLink;
    private readonly fromName = config.mail.fromName;
    private readonly templateUuid = config.mail.templates.passwordReset;

    constructor(){
        this.client = new MailtrapClient({ token: config.mail.token });
    }

    async sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
        const resetLink = `${this.domainLink}?token=${token}`;
        const sender = { email: this.fromEmail, name: this.fromName };

        try {
            await this.client.send({
                from: sender,
                to: [{ email: to }],
                template_uuid: this.templateUuid,
                template_variables: {
                    "user_name": name,
                    "user_email": to,
                    "pass_reset_link": resetLink
                },
            });

        } catch (error) {
            console.error("Mailtrap service error:", error);
            throw new Error("Não foi possível enviar o e-mail de redefinição de senha.");
        }
    }
}