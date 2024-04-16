const fs = require('fs');
const path = require("path");
const { MessageMedia } = require('whatsapp-web.js');

const submitId = function(bot, chat) {
    bot.sendMessage(chat.from, 'Please send site ID and name or *!cancel* to back to main menu\nExample: 123456 SITE NAME', {}, processId);
}

const processId = async function(bot, chat) {
    if (chat.body == '!cancel') {
        return bot.backToMenu();
    }

    const siteId = chat.body.split(' ')[0];
    const siteName = chat.body.slice(siteId.length);
    if (!/^[a-zA-Z0-9]+$/.test(siteId)) {
        return bot.sendMessage(chat.from, 'Site ID must be alphanumeric', {}, processId);
    }

    if (!/^[a-zA-Z0-9\-_ ]+$/.test(siteName)) {
        return bot.sendMessage(chat.from, 'Site name must be alphanumeric, dash, underscore and space', {}, processId);
    }

    if (!fs.existsSync(`./files/patp/${siteId}.json`)) {
        fs.writeFileSync(`./files/patp/${siteId}.json`, JSON.stringify({
            siteId: siteId,
            siteName: siteName
        }, null, 2));
    }

    if (!fs.existsSync(`./files/patp/${siteId}`)) {
        fs.mkdirSync(`./files/patp/${siteId}`);
    }

    await bot.sendMessage(chat.from, `Site ID: ${siteId}\nSite Name: ${siteName}\nPlease send ABD photo or *!cancel* to back to main menu\nExample:`, {id: siteId}, processFile);
    const exampleFolder = './files/example/PATP/';
    const list = fs.readdirSync(exampleFolder);
    list.forEach(async file => {
        let filePath = exampleFolder+file;
        let extension = path.extname(filePath);
        let caption = path.basename(filePath, extension);
        let media = MessageMedia.fromFilePath(filePath);
        await bot.sendMessage(chat.from, media, {caption: caption, id: siteId}, processFile);
    });
}

const processFile = async function(bot, chat) {
    if (chat.body == '!cancel') {
        return bot.backToMenu();
    }

    if (chat.body == '!done') {
        return await done(bot, chat.from);
    }
    
    const id = chat.options.id;
    const site = JSON.parse(fs.readFileSync(`./files/patp/${id}.json`));
    
    if (chat.hasMedia) {
        if (!site.files) {
            site.files = [];
        }
        if (!fs.existsSync(`./files/patp/${id}`)) {
            fs.mkdirSync(`./files/patp/${id}`);
        }
        const file = chat.media;
        const extension = file.mimetype.split('/')[1];
        const caption = chat.body.replace(/\//g, ' ');
        const fileName = `${site.siteId}_${caption}_${chat.from}_${Date.now()}.${extension}`;
        const base64File = Buffer.from(file.data, 'base64');
        const info = {};
        info.file = `./files/patp/${id}/${fileName}`;
        info.mimeType = file.mimetype;
        info.fileName = fileName;
        info.author = chat.from;
        fs.writeFileSync(info.file, base64File);
        site.files.push(info);
        fs.writeFileSync(`./files/patp/${id}.json`, JSON.stringify(site, null, 2));
        await chat.reply(`File has been saved.\nPlease send another file or *!done* to finish`, {id: site.siteId}, processFile);
    } else {
        await chat.reply('You should have to send at least 1 photo!', {id: site.siteId}, processFile);
    }
}

const done = async function(bot, from) {
    await bot.sendMessage(from, `PATP has been saved.\nThank you!`);
    await bot.backToMenu();
}

exports.submitId = submitId;