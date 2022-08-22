const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');

const submitId = function(bot, chat) {
    chat.sendMessage(chat.from, 'Please send site ID name : evidence or *!cancel* to back to main menu\nExample: 123456 SITE NAME : Your evidence', {}, processId);
}

const processId = async function(bot, chat) {
    if (chat.body == '!cancel') {
        return chat.backToMenu();
    }

    if (chat.body == '!done') {
        return await done(bot, chat);
    }

    const siteId = chat.body.split(' ')[0];
    const split = chat.body.split(':');
    const siteName = split[0].slice(siteId.length + 1).replace(/\s+$/, '');
    let evidence = '';
    if (split.length > 0) {
        evidence = split[1].replace(/^\s+/, '');
    }

    if (!/^[a-zA-Z0-9]+$/.test(siteId)) {
        return chat.sendMessage(chat.from, 'Site ID must be alphanumeric', {}, processId);
    }
    
    if (!/^[a-zA-Z0-9\- ]+$/.test(siteName)) {
        return chat.sendMessage(chat.from, 'Site name must be alphanumeric, dash, space', {}, processId);
    }

    if (!/^[a-zA-Z0-9\-@ ]+$/.test(evidence)) {
        return chat.sendMessage(chat.from, 'Evidence must be alphanumeric, dash, space', {}, processId);
    }

    if (!fs.existsSync(`./files/evidence/${siteId}.json`)) {
        fs.writeFileSync(`./files/evidence/${siteId}.json`, JSON.stringify({
            siteId: siteId,
            siteName: siteName,
            evidence: [
                evidence
            ],
            files: []
        }, null, 2));
    } else {
        const site = JSON.parse(fs.readFileSync(`./files/evidence/${siteId}.json`));
        site.evidence.push(evidence);
        fs.writeFileSync(`./files/evidence/${siteId}.json`, JSON.stringify(site, null, 2));
    }

    if (!fs.existsSync(`./files/evidence/${siteId}`)) {
        fs.mkdirSync(`./files/evidence/${siteId}`);
        if (!fs.existsSync(`./files/evidence/${siteId}/${evidence}`)) {
            fs.mkdirSync(`./files/evidence/${siteId}/${evidence}`);
        }
    }

    return await chat.sendMessage(chat.from, `Please attach evidence files for ${siteId} (${siteName}) or *!cancel* to back to main menu`, {id: siteId, evidence: evidence}, processFile);
}

const processFile = async function(bot, chat) {
    if (chat.body == '!cancel') {
        return chat.backToMenu();
    }

    if (chat.body == '!done') {
        return await done(bot, chat);
    }
    
    const evidence = chat.options.evidence;
    const id = chat.options.id;
    const site = JSON.parse(fs.readFileSync(`./files/evidence/${id}.json`));

    if (chat.hasMedia) {
        if (!fs.existsSync(`./files/evidence/${id}/${evidence}`)) {
            fs.mkdirSync(`./files/evidence/${id}/${evidence}`);
        }
        const file = chat.media;
        const extension = file.mimetype.split('/')[1];
        const fileName = `${site.siteId}_${chat.body}_${chat.from}_${Date.now()}.${extension}`;
        const base64File = Buffer.from(file.data, 'base64');
        const info = {};
        info.file = `./files/evidence/${id}/${evidence}/${fileName}`;
        info.mimeType = file.mimetype;
        info.fileName = fileName;
        info.author = chat.from;
        fs.writeFileSync(info.file, base64File);
        site.files.push(info);
        fs.writeFileSync(`./files/evidence/${id}.json`, JSON.stringify(site, null, 2));
        await chat.reply(`Evidence file for ${site.siteId} (${site.siteName}): ${evidence} has been saved.\nSend another file or *!done* to complete step or *!cancel* to back to main menu`, {id: site.siteId, evidence: evidence}, processFile);
    } else {
        await chat.reply('You should have to send at least 1 photo!', {id: site.siteId, evidence: evidence}, processFile);
    }
}

const done = async function(bot, chat) {
    await chat.sendMessage(chat.from, `Evidence has been saved.\nThank you!`);
    await chat.backToMenu();
}

exports.submitId = submitId;