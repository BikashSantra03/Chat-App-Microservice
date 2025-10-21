import amqp from "amqplib";

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
 *  Publish a message to a specified queue
 */
export const publishToQueue = async (queueName: string, message: any) => {
    if (!channel) {
        console.log("RabbitMQ channel is not initialized!");
        return;
    }

    try {
        // Ensure the queue exists before sending
        await channel.assertQueue(queueName, { durable: true });

        const messageString = JSON.stringify(message);
        channel.sendToQueue(queueName, Buffer.from(messageString), {
            persistent: true,
        });

        console.log(`Message published to ${queueName}`.yellow);
    } catch (error) {
        console.error(`Failed to publish to ${queueName}:`.red, error);
        throw error;
    }
};
