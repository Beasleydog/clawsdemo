const fs = require("fs");
const path = require("path");

const folder = path.join(__dirname, "../pos");
const fileNames = fs.readdirSync(folder);

const palmJsonPath = path.join(__dirname, "/palm.json");
const palmJsonContent = fs.readFileSync(palmJsonPath, "utf8");
let palmAnnotations = JSON.parse(palmJsonContent);

let cleanAnnotations = "";
fileNames.forEach((fileName, fileIndex) => {
  console.log(`Processing image ${fileIndex + 1} of ${fileNames.length}`);
  //Get width and height of image
  const imagePath = path.join(__dirname, `../pos/${fileName}`);
  const image = fs.readFileSync(imagePath);
  const { width, height } = getImageDimensions(image);

  function getImageDimensions(buffer) {
    // This is a simplified approach and may not work for all image formats
    // It assumes the image is either PNG or JPEG
    if (buffer[0] === 0x89 && buffer[1] === 0x50) {
      // PNG
      return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20),
      };
    } else if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      // JPEG
      let i = 4;
      while (i < buffer.length) {
        if (buffer[i] === 0xff && buffer[i + 1] === 0xc0) {
          return {
            height: buffer.readUInt16BE(i + 5),
            width: buffer.readUInt16BE(i + 7),
          };
        }
        i++;
      }
    }
    throw new Error("Unsupported image format");
  }

  const annotations = palmAnnotations[fileName.split(".")[0]];
  if (annotations) {
    const points = annotations.labels
      .map((label, i) => {
        if (label == "palm") {
          const cords = annotations.bboxes[i];
          const x = Math.floor(cords[0] * width);
          const y = Math.floor(cords[1] * height);
          const w = Math.floor(cords[2] * width);
          const h = Math.floor(cords[3] * height);
          return `${x} ${y} ${w} ${h}`;
        }
      })
      .filter((point) => point)
      .join("   ");

    cleanAnnotations += `pos/${fileName}  ${
      annotations.labels.filter((label) => label == "palm").length
    }  ${points}\n`;
  } else {
    console.log(`${fileName} not found in palm.json`);
  }
});

fs.writeFileSync(path.join(__dirname, "../pos.dat"), cleanAnnotations);
