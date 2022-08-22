const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');

const submitId = function(bot, chat) {
    bot.sendMessage(chat.from, 'Please send MOP ID or !cancel to back to main menu\nExample: 123456', {}, processId);
}

const processId = function(bot, chat) {
    if (chat.body == '!cancel') {
        return bot.backToMenu();
    }

    const siteId = chat.body.split(' ')[0];
    if (!/^[a-zA-Z0-9]+$/.test(siteId)) {
        return chat.sendMessage(chat.from, 'Site ID must be alphanumeric', {}, processId);
    }
    
    if (!fs.existsSync(`./files/mop/${siteId}.json`)) {
        return bot.sendMessage(chat.from, 'MOP ID not found', {}, processId);
    }

    const mop = JSON.parse(fs.readFileSync(`./files/mop/${siteId}.json`));
    const file = fs.readFileSync(`${mop.file.path}`);
    const base64File = Buffer.from(file).toString('base64');
    const media = new MessageMedia(mop.file.mimeType, base64File, mop.file.name);
    bot.reply(media);
}

exports.submitId = submitId;