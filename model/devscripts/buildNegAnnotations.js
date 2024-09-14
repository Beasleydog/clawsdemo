const fs = require("fs");
const path = require("path");

const folder = path.join(__dirname, "../neg");
const fileNames = fs.readdirSync(folder);

let cleanAnnotations = "";
fileNames.forEach((fileName) => {
  cleanAnnotations += `neg/${fileName}\n`;
});

fs.writeFileSync(path.join(__dirname, "../neg.txt"), cleanAnnotations);
