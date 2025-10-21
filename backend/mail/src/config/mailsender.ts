import nodemailer from "nodemailer";

interface MailResponse {
    messageId?: string;
}

const mailSender = async (
    email: string,
    title: string,
    body: string
): Promise<MailResponse | undefined> => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 465,
            secure: true, // Use true for port 465, false for other ports
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_APP_PASS,
            },
        });

        // Send mail
        const info = await transporter.sendMail({
            from: `Chat System <${process.env.MAIL_USER}>`,
            to: email,
            subject: title,
            html: body,
        });

        return info;
    } catch (error) {
        throw error; // Rethrow to allow caller to handle
    }
};

export default mailSender;