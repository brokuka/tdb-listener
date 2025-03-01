import { Hono } from 'hono'
import { env } from './config';
import { discordClient, tgBot } from './actions/connect';
import { escapeMarkdown } from './helpers/common';
import { notifyAdmins } from './actions/notify';
import { sendMessageTg } from './actions/send';
import { Events } from 'discord.js';

/**
 * TODO: add users database to mention everyone
 * TODO: update admins in database, there is case when they changed
 * TODO: watch if images can be uploaded to telegram instead getting "preview" mode from discord
 * TODO: adding cmds to message only telegram, because some people not using discord
 */

// TODO: it's current solution, in the future must have database instead!
export const chatUsers = new Map();

tgBot.command('register', (ctx) => {
	if (ctx.chat.id.toString() !== env.TELEGRAM_CHAT_ID && !ctx.from?.id) return;

	chatUsers.set(ctx.from?.id, ctx.from?.username);
	ctx.reply(`@${ctx.from?.username}, you added to tag list!`);
});

discordClient.on('messageCreate', async (message) => {
	if (message.channelId !== env.DISCORD_CHAT_ID) return;

	const hasEveryoneMention = message.mentions.everyone;

	let username = escapeMarkdown(message.author.displayName);
	let content = escapeMarkdown(message.content);
	let formattedMessage = ``;

	if (hasEveryoneMention) {
		formattedMessage = `🔔 Notification from *${username}* 🔔\n\n${content}`;

		const adminsMention = await notifyAdmins(message)

		if (adminsMention) {
			formattedMessage += `\n\n${adminsMention}`;
		}
	}

	if (message.attachments.size > 0) {
		message.attachments.forEach(attachment => {
			const url = attachment.url;
			formattedMessage += `\n[${escapeMarkdown(attachment.name || 'file')}](${url})`;
		});
	}

	await sendMessageTg(message, formattedMessage)
});

const app = new Hono()

app.get('/', (c) => {
	return c.text('Hello Hono3!')
})

console.log('start bots')
discordClient.on(Events.Error, (err) => console.log('@err', err))
discordClient.login(env.DISCORD_TOKEN)
discordClient.on(Events.Error, (err) => console.log('@err', err))
tgBot.start({
	onStart(botInfo) {
		console.log('@tgBotInfo', botInfo)
	},
})
console.log('start end')

export default {
	port: env.SERVER_PORT,
	fetch: app.fetch,
}