const fs = require('fs');
const path = require("path");

const folder = './files/permit/';
const list = fs.readdirSync(folder);

list.forEach(file => {
    let filePath = folder + file;
    let extension = path.extname(filePath);
    let fileName = path.basename(filePath, extension);
    let mimeType = 'application/pdf';
    let siteId = fileName.split(' ')[0];
    let siteName = fileName.split(' ')[1];
    let json = {
        siteId: siteId,
        siteName: siteName,
        file: {}
    };
    
    json.file.path = filePath;
    json.file.mimeType = mimeType;
    json.file.name = fileName;
    json.file.author = 'admin';
    fs.writeFileSync(`./files/permit/${siteId}.json`, JSON.stringify(json, null, 2));
    console.log(json);
});