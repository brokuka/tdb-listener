import { Bot } from 'grammy';
import { env } from '../config';
import { Client, GatewayIntentBits } from 'discord.js';

const tgBot = new Bot(env.TELEGRAM_TOKEN)

const discordClient = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	]
});

discordClient.on('error', (dce) => console.log('@dce', dce))

export { tgBot, discordClient }