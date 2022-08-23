const fs = require('fs');
const path = require("path");

const folder = './files/example/View Site/';
const list = fs.readdirSync(folder);

list.forEach(file => {
    let filePath = folder + file;
    let extension = path.extname(filePath);
    let fileName = path.basename(filePath, extension);
    console.log(filePath);
});