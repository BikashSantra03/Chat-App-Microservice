import amqp from "amqplib";
import colors from "colors";
import mailSender from "./mailsender.js";

let channel: amqp.Channel;

/**
 * Initialize RabbitMQ connection and store the channel
 */
export const connectRabbitMQ = async () => {
    try {
        // Connect to RabbitMQ
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABITMQ_HOST,
            port: 5672,
            username: process.env.RABITMQ_USERNAME,
            password: process.env.RABITMQ_PASSWORD,
        });

        // Create a channel for message operations
        channel = await connection.createChannel();

        console.log("Connected to RabbitMQ 🐰".yellow);
    } catch (error) {
        console.error("Failed to connect to RabbitMQ:".red, error);
        throw error;
    }
};

/**
 * Start consuming messages from the OTP queues
 */
export const startConsumers = async () => {
    if (!channel) {
        throw new Error("RabbitMQ channel is not initialized!");
    }

    const queues = ["send-otp-login", "send-otp-forget"];

    for (const queueName of queues) {
        // Ensure the queue exists
        await channel.assertQueue(queueName, { durable: true });

        // Consume messages from the queue
        channel.consume(
            queueName,
            async (msg) => {
                if (msg !== null) {
                    try {
                        const messageContent = JSON.parse(
                            msg.content.toString()
                        );
                        const { to, subject, body } = messageContent;

                        await mailSender(to, subject, body);
                        console.log(
                            `Email sent to ${to} from queue ${queueName}`.green
                        );

                        // Acknowledge the message
                        channel.ack(msg);
                    } catch (error) {
                        console.error(
                            `Error processing message from ${queueName}:`.red,
                            error
                        );
                        // Reject the message without requeueing (remove from queue)
                        channel.nack(msg, false, false);
                    }
                }
            },
            { noAck: false }
        );

        console.log(`Started consuming from queue: ${queueName}`.yellow);
    }
};
