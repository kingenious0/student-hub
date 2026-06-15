const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'public', 'LaHustle-Official_logo.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Match base64 data
const match = svgContent.match(/href="data:image\/png;base64,([^"]+)"/);
if (match) {
    const base64Data = match[1];
    const buffer = Buffer.from(base64Data, 'base64');
    const outputPath = path.join(__dirname, '..', 'public', 'LaHustle-Original.png');
    fs.writeFileSync(outputPath, buffer);
    console.log('Successfully saved original logo image to public/LaHustle-Original.png');
} else {
    console.error('Could not find base64 image inside the SVG.');
}
