"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishToQueue = exports.connectRabbitMQ = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
let channel;
const connectRabbitMQ = async () => {
    try {
        const connection = await amqplib_1.default.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        console.log("✅ connected to rabbitmq");
    }
    catch (error) {
        console.log("Failed to connect to rabbitmq", error);
    }
};
exports.connectRabbitMQ = connectRabbitMQ;
const publishToQueue = async (queueName, message) => {
    if (!channel) {
        console.log("Rabbitmq channel is not initalized");
        return;
    }
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true,
    });
};
exports.publishToQueue = publishToQueue;
