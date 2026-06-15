const fs = require('fs');
const path = require('path');

const pngPath = path.join(__dirname, '..', 'public', 'LaHustle-Original.png');
const pngBuffer = fs.readFileSync(pngPath);
const base64Data = pngBuffer.toString('base64');

const svgContent = `<svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
	<defs>
		<image  width="1024" height="918" id="img1" href="data:image/png;base64,${base64Data}"/>
	</defs>
	<use href="#img1" x="0" y="53"/>
</svg>`;

const svgPath = path.join(__dirname, '..', 'public', 'LaHustle-Official_logo.svg');
fs.writeFileSync(svgPath, svgContent);
console.log('Successfully restored original SVG logo!');
