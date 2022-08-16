const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');

const submitId = function(bot, chat) {
    bot.sendMessage(chat.from, 'Please send Topologi ID or !cancel to back to main menu\nExample: 123456', {}, processId);
}

const processId = function(bot, chat) {
    if (chat.body == '!cancel') {
        return bot.backToMenu();
    }
    
    if (!fs.existsSync(`./files/topologi/${chat.body}.json`)) {
        return bot.sendMessage(chat.from, 'Topologi ID not found', {}, processId);
    }

    const topologi = JSON.parse(fs.readFileSync(`./files/topologi/${chat.body}.json`));
    const file = fs.readFileSync(`./files/${topologi.file}`);
    const tmp = file.toString().replace(/[“”‘’]/g,'');
    const base64File = Buffer.from(file).toString('base64');
    const media = new MessageMedia(topologi.mimeType, base64File, topologi.fileName);
    bot.reply(media);
}

exports.submitId = submitId;