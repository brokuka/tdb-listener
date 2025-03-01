import { env } from '../config';
import { tgBot } from './connect';

export async function sendMessageTg(messageObject: any, messageText: string) {
	try {
		if (messageText.length) {
			await tgBot.api.sendMessage(env.TELEGRAM_CHAT_ID as string, messageText, {
				parse_mode: 'MarkdownV2'
			});
		}

	} catch (error) {
		console.error('Error while sending telegram message:', error);

		await tgBot.api.sendMessage(
			env.TELEGRAM_CHAT_ID as string,
			`${messageObject.author.username}: ${messageObject.content}`
		);
	}
}