const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');

const submitId = function(bot, chat) {
    bot.sendMessage(chat.from, 'Please send site ID and name or !cancel to back to main menu\nExample: 123456 SITE NAME', {}, processId);
}

const processId = async function(bot, chat) {
    if (chat.body == '!cancel') {
        return bot.backToMenu();
    }

    const siteId = chat.body.split(' ')[0];
    const siteName = chat.body.slice(siteId.length + 1);

    if (!/^[a-zA-Z0-9]+$/.test(siteId)) {
        return bot.sendMessage(chat.from, 'Site ID must be alphanumeric', {}, processId);
    }
    
    if (!/^[a-zA-Z0-9\- ]+$/.test(siteName)) {
        return bot.sendMessage(chat.from, 'Site name must be alphanumeric, dash, space', {}, processId);
    }

    if (!fs.existsSync(`./files/ttsr/${siteId}.json`)) {
        fs.writeFileSync(`./files/ttsr/${siteId}.json`, JSON.stringify({
            siteId: siteId,
            siteName: siteName
        }, null, 2));
    }

    if (!fs.existsSync(`./files/ttsr/${siteId}`)) {
        fs.mkdirSync(`./files/ttsr/${siteId}`);
    }

    return await next('', siteName, siteId, chat.from, bot);
}

const processFile = async function(bot, chat) {
    if (chat.body == '!cancel') {
        return bot.backToMenu();
    }

    if (chat.body == '!done') {
        return await done(bot, chat);
    }
    
    const action = chat.options.action;
    const id = chat.options.id;
    const site = JSON.parse(fs.readFileSync(`./files/ttsr/${id}.json`));

    if (chat.body == '!next') {
        const n = await next(action, site.siteName, site.siteId, chat.from, bot);
        if (!n) {
            return await done(bot, chat);
        }
    }
    
    if (chat.hasMedia) {
        if (!site[action]) {
            site[action] = [];
        }
        if (!fs.existsSync(`./files/ttsr/${id}/${action}`)) {
            fs.mkdirSync(`./files/ttsr/${id}/${action}`);
        }
        const file = await bot.downloadMedia();
        const extension = file.mimetype.split('/')[1];
        const fileName = `${site.siteId}_${chat.body}_${chat.from}_${Date.now()}.${extension}`;
        const base64File = Buffer.from(file.data, 'base64');
        const info = {};
        info.file = `./files/ttsr/${id}/${action}/${fileName}`;
        info.mimeType = file.mimetype;
        info.fileName = fileName;
        info.author = chat.from;
        fs.writeFileSync(info.file, base64File);
        site[action].push(info);
        fs.writeFileSync(`./files/ttsr/${id}.json`, JSON.stringify(site, null, 2));
        await bot.reply(getMessage(action, chat.body, site.siteId, true), {id: site.siteId, action: action}, processFile);
    }
}

const getMessage = function(type, siteName, siteId, done = false) {
    const messageGreeting = {
        shelter: `Please send shelter photo for ${siteName} (${siteId}) or !cancel to back to main menu\nExample:`,
        kwh: `Please send KWH photo for ${siteName} (${siteId}) or !cancel to back to main menu\nExample:`,
        power: `Please send AC power photo for ${siteName} (${siteId}) or !cancel to back to main menu\nExample:`,
        prop: `Please send PROP SAS Sx 7210 photo for ${siteName} (${siteId}) or !cancel to back to main menu\nExample:`,
        rectifier: `Please send Rectifier photo for ${siteName} (${siteId}) or !cancel to back to main menu\nExample:`,
        installation: `Please send Standart Installation photo for ${siteName} (${siteId}) or !cancel to back to main menu\nExample:`,
        serial: `Please send Serial Number & Part Number photo for ${siteName} (${siteId}) or !cancel to back to main menu\nExample:`,
        layout: `Please send Layout/Sketsa photo for ${siteName} (${siteId}) or !cancel to back to main menu\nExample:`,
    };

    const messageDone = {
        shelter: `Shelter photo for ${siteName} (${siteId}) has been saved!\nSend another file or send !next to proceed to next step`,
        kwh: `KWH PLN photo for ${siteName} (${siteId}) has been saved!\nSend another file or send !next to proceed to next step`,
        power: `AC power photo for ${siteName} (${siteId}) has been saved!\nSend another file or send !next to proceed to next step`,
        prop: `PROP SAS Sx 7210 photo for ${siteName} (${siteId}) has been saved!\nSend another file or send !next to proceed to next step`,
        rectifier: `Rectifier photo for ${siteName} (${siteId}) has been saved!\nSend another file or send !next to proceed to next step`,
        installation: `Standart Installation photo for ${siteName} (${siteId}) has been saved!\nSend another file or send !next to proceed to next step`,
        serial: `Serial Number & Part Number photo for ${siteName} (${siteId}) has been saved!\nSend another file or send !next to proceed to next step`,
        layout: `Layout/Sketsa photo for ${siteName} (${siteId}) has been saved!\nSend another file or send !done to complete TTSR`,
    };

    if (done) {
        return messageDone[type];
    } else {
        return messageGreeting[type];
    }
    
}

const next = async function(previous = '', siteName, siteId, from, bot) {
    const list = ['shelter','kwh', 'power', 'prop', 'rectifier', 'installation', 'serial', 'layout'];
    const nexStep = list[list.indexOf(previous) + 1];
    if (previous == '') {
        await bot.sendMessage(from, getMessage("shelter", siteName, siteId));
        const media = MessageMedia.fromFilePath(`./shelter.example.jpg`);
        await bot.sendMessage(from, media, {id: siteId, action: "shelter"}, processFile);
    } else if (typeof nexStep != 'undefined') {
        await bot.sendMessage(from, getMessage(nexStep, siteName, siteId));
        const media = MessageMedia.fromFilePath(`./${nexStep}.example.jpg`);
        await bot.sendMessage(from, media, {id: siteId, action: nexStep}, processFile);
    } else {
        return false;
    }
}

const done = async function(bot, chat) {
    await bot.sendMessage(chat.from, `TTSR has been saved.\nThank you!`);
    await bot.backToMenu();
}

exports.submitId = submitId;