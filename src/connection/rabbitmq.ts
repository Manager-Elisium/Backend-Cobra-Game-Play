import amqp from 'amqplib';

export let connection: amqp.Connection | null = null;

export async function createRabbitmqConnection(): Promise<amqp.Connection> {
  if (!connection) {
    const amqpServer = process.env.RABBITMQ_CLIENT;
    connection = await amqp.connect(amqpServer);
  }
  return connection;
}