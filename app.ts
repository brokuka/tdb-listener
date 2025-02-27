import { Bot } from 'grammy';
import { Client, GatewayIntentBits } from 'discord.js'

/**
 * TODO: add users database to mention everyone
 * TODO: update admins in database, there is case when they changed
 * TODO: watch if images can be uploaded to telegram instead getting "preview" mode from discord
 */

const env = {
	DISCORD_CHAT_ID: process.env.DISCORD_CHAT_ID as string,
	TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN as string,
	TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID as string,
}

const tgBot = new Bot(env.TELEGRAM_TOKEN)

// TODO: it's current solution, in the future must have database instead!
const chatUsers = new Map();

const discordClient = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	]
});

function escapeMarkdown(text: string) {
	return text
		.replace(/_/g, '\\_')
		.replace(/\*/g, '\\*')
		.replace(/\[/g, '\\[')
		.replace(/\]/g, '\\]')
		.replace(/\(/g, '\\(')
		.replace(/\)/g, '\\)')
		.replace(/~/g, '\\~')
		.replace(/`/g, '\\`')
		.replace(/>/g, '\\>')
		.replace(/#/g, '\\#')
		.replace(/\+/g, '\\+')
		.replace(/-/g, '\\-')
		.replace(/=/g, '\\=')
		.replace(/\|/g, '\\|')
		.replace(/\{/g, '\\{')
		.replace(/\}/g, '\\}')
		.replace(/\./g, '\\.')
		.replace(/!/g, '\\!');
}

tgBot.command('register', (ctx) => {
	if (ctx.chat.id.toString() !== env.TELEGRAM_CHAT_ID && !ctx.from?.id) return;

	chatUsers.set(ctx.from?.id, ctx.from?.username);
	ctx.reply(`@${ctx.from?.username}, you added to tag list!`);
});

discordClient.on('messageCreate', async (message) => {
	if (message.channelId !== process.env.DISCORD_CHAT_ID) return;

	const hasEveryoneMention = message.mentions.everyone;

	let username = escapeMarkdown(message.author.displayName);
	let content = escapeMarkdown(message.content);
	let formattedMessage = ``;

	if (hasEveryoneMention) {
		formattedMessage = `🔔 Notification from *${username}* 🔔\n\n${content}`;

		try {
			const chatAdmins = await tgBot.api.getChatAdministrators(env.TELEGRAM_CHAT_ID);

			let mentions = '';

			for (const member of chatAdmins) {
				if (!member.user.is_bot) {
					chatUsers.set(message.author.id, message.author.username);
				}
			}

			for (const member of chatAdmins) {
				if (!member.user.is_bot) {
					mentions += `@${member.user.username} `;
				}
			}

			if (mentions) {
				formattedMessage += `\n\n${mentions}`;
			}
		} catch (error) {
			console.error('Error occurs when getting users list:', error);
		}

	}

	if (message.attachments.size > 0) {
		message.attachments.forEach(attachment => {
			const url = attachment.url;
			formattedMessage += `\n[${escapeMarkdown(attachment.name || 'file')}](${url})`;
		});
	}

	try {
		if (formattedMessage.length) {
			await tgBot.api.sendMessage(process.env.TELEGRAM_CHAT_ID as string, formattedMessage, {
				parse_mode: 'MarkdownV2'
			});
		}

	} catch (error) {
		console.error('Error while sending telegram message:', error);

		await tgBot.api.sendMessage(
			process.env.TELEGRAM_CHAT_ID as string,
			`${message.author.username}: ${message.content}`
		);
	}
});

discordClient.login(process.env.DISCORD_TOKEN);
tgBot.start()