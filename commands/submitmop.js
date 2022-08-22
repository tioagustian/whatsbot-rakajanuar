const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');

const submitId = function(bot, chat) {
    const admin = ['6289624813760@c.us', '6282120475719@c.us', '6288976393216@c.us', '6282111182808@c.us', '6285893586445@c.us'];
    if (!admin.includes(chat.from)) {
        return bot.sendMessage(chat.from, 'You are not authorized to use this command');
    }
    chat.sendMessage(chat.from, 'Please send site ID *!cancel* to back to main menu\nExample: 123456', {}, processId);
}

const processId = async function(bot, chat) {
    if (chat.body == '!cancel') {
        return chat.backToMenu();
    }

    if (chat.body == '!done') {
        return await done(bot, chat);
    }

    const siteId = chat.body.split(' ')[0];
    if (!/^[a-zA-Z0-9]+$/.test(siteId)) {
        return chat.sendMessage(chat.from, 'Site ID must be alphanumeric', {}, processId);
    }

    if (!fs.existsSync(`./files/mop/${siteId}.json`)) {
        fs.writeFileSync(`./files/mop/${siteId}.json`, JSON.stringify({
            siteId: siteId,
            file: {}
        }, null, 2));
    }
    
    return await chat.sendMessage(chat.from, `Please attach mop file for ${siteId} or *!cancel* to back to main menu`, {siteId: siteId}, processFile);
}

const processFile = async function(bot, chat) {
    if (chat.body == '!cancel') {
        return chat.backToMenu();
    }
    
    const id = chat.options.siteId;
    const site = JSON.parse(fs.readFileSync(`./files/mop/${id}.json`));

    if (chat.hasMedia) {
        const file = chat.media;
        const extension = file.mimetype.split('/')[1];
        const fileName = `${site.siteId}_${file.filename}_${chat.from}_${Date.now()}.${extension}`;
        const base64File = Buffer.from(file.data, 'base64');
        const info = {};
        info.path = `./files/mop/${fileName}`;
        info.mimeType = file.mimetype;
        info.name = file.filename;
        info.author = chat.from;
        fs.writeFileSync(info.path, base64File);
        site.file = info;
        fs.writeFileSync(`./files/mop/${id}.json`, JSON.stringify(site, null, 2));
        return await done(bot, chat);
    } else {
        await chat.reply('You should have to send at least 1 file!', {siteId: site.siteId}, processFile);
    }
}

const done = async function(bot, chat) {
    await chat.sendMessage(chat.from, `MOP file has been saved.\nThank you!`);
    await chat.backToMenu();
}

exports.submitId = submitId;