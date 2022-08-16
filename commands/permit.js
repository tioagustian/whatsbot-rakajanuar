const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');

const submitId = function(bot, chat) {
    bot.sendMessage(chat.from, 'Please send permit ID or !cancel to back to main menu\nExample: 123456', {}, processId);
}

const processId = function(bot, chat) {
    if (chat.body == '!cancel') {
        return bot.backToMenu();
    }
    
    if (!fs.existsSync(`./files/permit/${chat.body}.json`)) {
        return bot.sendMessage(chat.from, 'permit ID not found', {}, processId);
    }

    const permit = JSON.parse(fs.readFileSync(`./files/permit/${chat.body}.json`));
    const file = fs.readFileSync(`./files/${permit.file}`);
    const tmp = file.toString().replace(/[“”‘’]/g,'');
    const base64File = Buffer.from(file).toString('base64');
    const media = new MessageMedia(permit.mimeType, base64File, permit.fileName);
    bot.reply(media);
}

exports.submitId = submitId;