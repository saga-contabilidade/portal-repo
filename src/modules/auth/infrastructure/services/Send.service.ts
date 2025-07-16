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
    private readonly fromEmail = process.env.EMAIL_FROM!;
    private readonly domainLink = process.env.DOMAIN_LINK_URL;
    private readonly fromName = process.env.EMAIL_NAME_FROM!;
    private readonly templateUuid = process.env.MAILTRAP_PASSWORD_RESET_TEMPLATE_UUID;

    constructor(){
        const token = process.env.MAILTRAP_API_KEY;
        if(!token) {
            throw new Error("A API do Mailtrap (MAIL_API_KEY) não está configurada.");
        }
        this.client = new MailtrapClient({ token });
    }

    async sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
        const resetLink = `${this.domainLink}?token=${token}`;
        const sender = { email: this.fromEmail, name: this.fromName };

        try {
            await this.client.send({
                from: sender,
                to: [{ email: to }],
                template_uuid: this.templateUuid as string,
                template_variables: {
                    "user_name": name,
                    "user_email": to,
                    "pass_reset_link": resetLink
                },
            });

        } catch (error) {

            throw new Error("Não foi possível enviar o e-mail de redefinição de senha.");
        }
    }
}