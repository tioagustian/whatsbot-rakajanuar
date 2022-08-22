const fs = require('fs');
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

    if (!fs.existsSync(`./files/tssr/${siteId}.json`)) {
        fs.writeFileSync(`./files/tssr/${siteId}.json`, JSON.stringify({
            siteId: siteId,
            siteName: siteName
        }, null, 2));
    }

    if (!fs.existsSync(`./files/tssr/${siteId}`)) {
        fs.mkdirSync(`./files/tssr/${siteId}`);
    }

    return await next('', siteName, siteId, chat.from, bot);
}

const processFile = async function(bot, chat) {
    if (chat.body == '!cancel') {
        return bot.backToMenu();
    }

    if (chat.body == '!done') {
        return await done(bot, chat.from);
    }
    
    const action = chat.options.action;
    const id = chat.options.id;
    const site = JSON.parse(fs.readFileSync(`./files/tssr/${id}.json`));

    if (chat.body == '!next') {
        return await next(action, site.siteName, site.siteId, chat.from, bot);
    }
    
    if (chat.hasMedia) {
        if (!site[action]) {
            site[action] = [];
        }
        if (!fs.existsSync(`./files/tssr/${id}/${action}`)) {
            fs.mkdirSync(`./files/tssr/${id}/${action}`);
        }
        const file = chat.media;
        const extension = file.mimetype.split('/')[1];
        const fileName = `${site.siteId}_${chat.body}_${chat.from}_${Date.now()}.${extension}`;
        const base64File = Buffer.from(file.data, 'base64');
        const info = {};
        info.file = `./files/tssr/${id}/${action}/${fileName}`;
        info.mimeType = file.mimetype;
        info.fileName = fileName;
        info.author = chat.from;
        fs.writeFileSync(info.file, base64File);
        site[action].push(info);
        fs.writeFileSync(`./files/tssr/${id}.json`, JSON.stringify(site, null, 2));
        await chat.reply(getMessage(action, site.siteName, site.siteId, true), {id: site.siteId, action: action}, processFile);
    } else {
        await chat.reply('You should have to send at least 1 photo!', {id: site.siteId, action: action}, processFile);
    }
}

const getMessage = function(type, siteName, siteId, done = false) {
    const messageGreeting = {
        shelter: `Please send shelter photo for ${siteName} (${siteId}) or *!cancel* to back to main menu\nExample:`,
        kwh: `Please send KWH photo for ${siteName} (${siteId}) or *!cancel* to back to main menu\nExample:`,
        power: `Please send AC power photo for ${siteName} (${siteId}) or *!cancel* to back to main menu\nExample:`,
        prop: `Please send PROP SAS Sx 7210 photo for ${siteName} (${siteId}) or *!cancel* to back to main menu\nExample:`,
        rectifier: `Please send Rectifier photo for ${siteName} (${siteId}) or *!cancel* to back to main menu\nExample:`,
        installation: `Please send Standart Installation photo for ${siteName} (${siteId}) or *!cancel* to back to main menu\nExample:`,
        serial: `Please send Serial Number & Part Number photo for ${siteName} (${siteId}) or *!cancel* to back to main menu\nExample:`,
        layout: `Please send Layout/Sketsa photo for ${siteName} (${siteId}) or *!cancel* to back to main menu\nExample:`,
    };

    const messageDone = {
        shelter: `Shelter photo for ${siteName} (${siteId}) has been saved!\nSend another file or send *!next* to proceed to next step`,
        kwh: `KWH PLN photo for ${siteName} (${siteId}) has been saved!\nSend another file or send *!next* to proceed to next step`,
        power: `AC power photo for ${siteName} (${siteId}) has been saved!\nSend another file or send *!next* to proceed to next step`,
        prop: `PROP SAS Sx 7210 photo for ${siteName} (${siteId}) has been saved!\nSend another file or send *!next* to proceed to next step`,
        rectifier: `Rectifier photo for ${siteName} (${siteId}) has been saved!\nSend another file or send *!next* to proceed to next step`,
        installation: `Standart Installation photo for ${siteName} (${siteId}) has been saved!\nSend another file or send *!next* to proceed to next step`,
        serial: `Serial Number & Part Number photo for ${siteName} (${siteId}) has been saved!\nSend another file or send *!next* to proceed to next step`,
        layout: `Layout/Sketsa photo for ${siteName} (${siteId}) has been saved!\nSend another file or send *!done* to complete tssr`,
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
        const example = img('shelter');
        if (example.length == 0) {
            return bot.sendMessage(from, 'No example found\nPlease send your photo', {id: siteId, action: 'shelter'}, processFile);
        }
        example.forEach(async img => {
            let media = MessageMedia.fromFilePath(img.path);
            let caption = img.caption;
            await bot.sendMessage(from, media, {caption: caption, id: siteId, action: "shelter"}, processFile);
        });
    } else if (typeof nexStep != 'undefined') {
        await bot.sendMessage(from, getMessage(nexStep, siteName, siteId));
        const example = img(nexStep);
        if (example.length == 0) {
            return bot.sendMessage(from, 'No example found\nPlease send your photo', {id: siteId, action: 'shelter'}, processFile);
        }
        example.forEach(async img => {
            let media = MessageMedia.fromFilePath(img.path);
            let caption = img.caption;
            await bot.sendMessage(from, media, {caption: caption, id: siteId, action: "shelter"}, processFile);
        });
    } else {
        return done(bot, from);
    }
}

const img = function(step) {
    const imgs = {
        shelter: [
            {
                path: './files/example/Shelter View/image033.png',
                caption: 'Shelter view'
            },
            {
                path: './files/example/Shelter View/image035.png',
                caption: 'Shelter view'
            },
            {
                path: './files/example/Shelter View/image037.png',
                caption: 'Shelter view'
            },
            {
                path: './files/example/Shelter View/image039.png',
                caption: 'Shelter view'
            },
            {
                path: './files/example/Shelter View/image041.png',
                caption: 'Shelter view'
            }
        ],
        kwh: [
            {
                path: './files/example/KWH/image043.png',
                caption: 'KWH'
            },
            {
                path: './files/example/KWH/image045.png',
                caption: 'MCB KWH'
            },
            {
                path: './files/example/KWH/image047.png',
                caption: 'Phase R Load Current (Measured) 1.14 A' 
            },
            {
                path: './files/example/KWH/image049.png',
                caption: 'Phase S Load Current (Measured) 1.05  A'
            },
            {
                path: './files/example/KWH/image051.png',
                caption: 'Phase T Load Current (Measured) 1.26  A'
            },
            {
                path: './files/example/KWH/image053.png',
                caption: 'Phase N Load Current (Measured) 0.09 A'
            }
        ],
        power: [
            {
                path: './files/example/AC POWER/ACPDB OUTDOOR.png',
                caption: 'AC Power Distribution Board Outdoor'
            },
            {
                path: './files/example/AC POWER/Voltage Measurement at Panel R-N 22.0 V.png',
                caption: 'Voltage Measurement at Panel R-N 22.0 V'
            },
            {
                path: './files/example/AC POWER/Voltage Measurement at Panel S-N 22.0 V.png',
                caption: 'Voltage Measurement at Panel S-N 22.0 V'
            },
            {
                path: './files/example/AC POWER/Voltage Measurement at Panel T-N 22.0 V.png',
                caption: 'Voltage Measurement at Panel T-N 22.0 V'
            }
        ],
        prop: [
            {
                path: './files/example/PROP SAS Sx 7210/image060.png',
                caption: 'FULL RACK RECTIFIER'
            },
            {
                path: './files/example/PROP SAS Sx 7210/image062.png',
                caption: 'PROPOSED NEW SAS Sx 7210'
            },
            {
                path: './files/example/PROP SAS Sx 7210/image064.png',
                caption: 'MCB SAS Sx 7210'
            },
            {
                path: './files/example/PROP SAS Sx 7210/image067.png',
                caption: 'GROUNDING'
            },
        ],
        rectifier: [
            {
                path: './files/example/Rectifier/image070.png',
                caption: 'Rectifier 1 Brand'
            },
            {
                path: './files/example/Rectifier/image072.png',
                caption: 'Module Rectifier 1'
            },
            {
                path: './files/example/Rectifier/image074.png',
                caption: ' Current Load 1'
            },
            {
                path: './files/example/Rectifier/image076.png',
                caption: 'Existing Battery Bank'
            }
        ],
        installation: [
            {
                path: './files/example/Standart Installation/image082.png',
                caption: 'VIEW FULL RACK RECTIFIER OPEN'
            },
            {
                path: './files/example/Standart Installation/image083.png',
                caption: 'VIEW FULL RACK RECTIFIER CLOSE'
            },
            {
                path: './files/example/Standart Installation/image086.png',
                caption: 'MCB/POWER CONNECTION SAS Sx 7210 (LABEL)'
            },
            {
                path: './files/example/Standart Installation/image088.png',
                caption: 'VIEW SAS Sx 7210 INSTALLED'
            },
            {
                path: './files/example/Standart Installation/image091.png',
                caption: 'VIEW RACK MOUNTING SAS Sx 7210'
            },
            {
                path: './files/example/Standart Installation/image093.png',
                caption: 'CONNECTION SFP + PATCH CORE INSTALLED (LABEL)'
            },
            {
                path: './files/example/Standart Installation/image095.png',
                caption: 'SPARE PATCH CORE + PROTECTED INSTALLED (LABEL)'
            },
            {
                path: './files/example/Standart Installation/image097.png',
                caption: 'GROUNDING ON SAS Sx 7210 (LABEL)'
            },
            {
                path: './files/example/Standart Installation/image099.png',
                caption: 'GROUNDING ON BUS BAR (LABEL)'
            },
            {
                path: './files/example/Standart Installation/image101.png',
                caption: 'CONNECTION POWER ON SAS Sx 7210 (LABEL)'
            },
            {
                path: './files/example/Standart Installation/image103.png',
                caption: 'CONNECTION PATCH CORE ON OTB INSTALLED (LABEL)'
            },
        ],
        serial: [
            {
                path: './files/example/Serial Number & Part Number/image104.png',
                caption: 'PART NUMBER AND SERIAL NUMBER SAS Sx 7210'
            },
            {
                path: './files/example/Serial Number & Part Number/image106.png',
                caption: 'PART NUMBER AND SERIAL NUMBER SFP 1'
            },
            {
                path: './files/example/Serial Number & Part Number/image108.png',
                caption: 'PART NUMBER AND SERIAL NUMBER SFP 2'
            },
            {
                path: './files/example/Serial Number & Part Number/image110.png',
                caption: 'PART NUMBER AND SERIAL NUMBER PSU 1'
            },
            {
                path: './files/example/Serial Number & Part Number/image112.png',
                caption: 'PART NUMBER AND SERIAL NUMBER PSU 2'
            },
            {
                path: './files/example/Serial Number & Part Number/image112.png',
                caption: 'PART NUMBER OS/FLASH CARD'
            },
        ],
        layout: [
            {
                path: './files/example/Surver Data/layout.jpg',
                caption: 'Layout'
            },
        ]
    }
    return imgs[step];
}

const done = async function(bot, chat) {
    await bot.sendMessage(from, `tssr has been saved.\nThank you!`);
    await bot.backToMenu();
}

exports.submitId = submitId;