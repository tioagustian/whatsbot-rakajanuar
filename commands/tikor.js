const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');

const submitId = function(bot, chat) {
    bot.sendMessage(bot.message.from, 'Please send tikor ID or cancel to back to main menu', {}, processId);
}

const processId = function(bot, chat) {
    if (chat.body == 'cancel') {
        return bot.backToMenu();
    }
    
    if (!fs.existsSync(`./files/topologi/${chat.body}.json`)) {
        return bot.sendMessage(bot.message.from, 'Tikor ID not found', {}, processId);
    }

    const topologi = JSON.parse(fs.readFileSync(`./files/Tikor/${chat.body}.json`));
    // const file = fs.readFileSync(`./files/${topologi.file}`);
    // const tmp = file.toString().replace(/[“”‘’]/g,'');
    // const base64File = Buffer.from(file).toString('base64');
    // const media = new MessageMedia(topologi.mimeType, base64File, topologi.fileName);
    bot.reply(`to do: add action`);
}

exports.submitId = submitId;