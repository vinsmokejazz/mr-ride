const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

let connection;
let channel;

async function connect() {
  if (channel) {
    return { connection, channel };
  }

  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  console.log("Connected to RabbitMQ");

  connection.on("close", () => {
    channel = null;
    connection = null;
    console.warn("RabbitMQ connection closed");
  });

  connection.on("error", (error) => {
    console.error("RabbitMQ connection error:", error);
  });

  return { connection, channel };
}

async function subscribeToQueue(queueName, callback) {
  const { channel: activeChannel } = await connect();
  await activeChannel.assertQueue(queueName, { durable: true });

  await activeChannel.consume(queueName, async (message) => {
    if (!message) {
      return;
    }

    try {
      await callback(message.content.toString());
      activeChannel.ack(message);
    } catch (error) {
      console.error(`Error handling message from ${queueName}:`, error);
      activeChannel.nack(message, false, false);
    }
  });
}

async function publishToQueue(queueName, data) {
  const { channel: activeChannel } = await connect();
  await activeChannel.assertQueue(queueName, { durable: true });

  const payload = typeof data === "string" ? data : JSON.stringify(data);
  activeChannel.sendToQueue(queueName, Buffer.from(payload), { persistent: true });
}

module.exports = {
  connect,
  subscribeToQueue,
  publishToQueue,
};
