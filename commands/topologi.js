const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');

const submitId = function(bot, chat) {
    bot.sendMessage(chat.from, 'Please send Topologi ID or !cancel to back to main menu\nExample: 123456', {}, processId);
}

const processId = function(bot, chat) {
    if (chat.body == '!cancel') {
        return bot.backToMenu();
    }

    const siteId = chat.body.split(' ')[0];
    if (!/^[a-zA-Z0-9]+$/.test(siteId)) {
        return chat.sendMessage(chat.from, 'Site ID must be alphanumeric', {}, processId);
    }
    
    if (!fs.existsSync(`./files/topologi/${siteId}.json`)) {
        return bot.sendMessage(chat.from, 'Topologi ID not found', {}, processId);
    }

    const topologi = JSON.parse(fs.readFileSync(`./files/topologi/${siteId}.json`));
    const file = fs.readFileSync(`${topologi.file.path}`);
    const base64File = Buffer.from(file).toString('base64');
    const media = new MessageMedia(topologi.file.mimeType, base64File, topologi.file.name);
    bot.reply(media);
}

exports.submitId = submitId;