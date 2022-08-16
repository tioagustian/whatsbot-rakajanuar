const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');

const submitId = function(bot, chat) {
    bot.sendMessage(chat.from, 'Please send MOP ID or !cancel to back to main menu\nExample: 123456', {}, processId);
}

const processId = function(bot, chat) {
    if (chat.body == '!cancel') {
        return bot.backToMenu();
    }
    
    if (!fs.existsSync(`./files/mop/${chat.body}.json`)) {
        return bot.sendMessage(chat.from, 'MOP ID not found', {}, processId);
    }

    const mop = JSON.parse(fs.readFileSync(`./files/mop/${chat.body}.json`));
    const file = fs.readFileSync(`./files/${mop.file}`);
    const tmp = file.toString().replace(/[“”‘’]/g,'');
    const base64File = Buffer.from(file).toString('base64');
    const media = new MessageMedia(mop.mimeType, base64File, mop.fileName);
    bot.reply(media);
}

exports.submitId = submitId;