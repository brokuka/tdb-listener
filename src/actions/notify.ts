import { chatUsers } from '..';
import { env } from '../config';
import { tgBot } from './connect';

export async function notifyAdmins(messageObject: any, messageText?: string) {
	try {
		const chatAdmins = await tgBot.api.getChatAdministrators(env.TELEGRAM_CHAT_ID);

		let mentions = '';

		for (const member of chatAdmins) {
			if (!member.user.is_bot) {
				chatUsers.set(messageObject.author.id, messageObject.author.username);
			}
		}

		for (const member of chatAdmins) {
			if (!member.user.is_bot) {
				mentions += `@${member.user.username} `;
			}
		}

		if (mentions && messageText) {
			messageText += `\n\n${mentions}`;
		}
	} catch (error) {
		console.error('Error occurs when getting users list:', error);
	}
}