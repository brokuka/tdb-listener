import { Bot } from 'grammy';
import { env } from '../config';
import { Client, Events, GatewayIntentBits } from 'discord.js';

const tgBot = new Bot(env.TELEGRAM_TOKEN)

const discordClient = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	]
});

discordClient.on('debug', (e) => {
	console.log('@debug', e);
})
export { tgBot, discordClient }