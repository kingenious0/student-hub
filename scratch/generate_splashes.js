const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const logoPath = path.join(__dirname, '..', 'public', 'LaHustle-Original.png');

const splashSizes = [
    { w: 1290, h: 2796 },
    { w: 1179, h: 2556 },
    { w: 1125, h: 2436 },
    { w: 1242, h: 2688 },
    { w: 1668, h: 2388 },
    { w: 2048, h: 2732 },
    { w: 2732, h: 2732 },
    { w: 640,  h: 1136 },
    { w: 750,  h: 1334 },
    { w: 828,  h: 1792 }
];

async function generate() {
    console.log('Loading logo from:', logoPath);
    const logo = await Jimp.read(logoPath);
    
    for (const size of splashSizes) {
        console.log(`Generating splash ${size.w}x${size.h}...`);
        
        // Create background (#050505 in hex color format for Jimp: 0x050505FF)
        const background = new Jimp(size.w, size.h, 0x050505FF);
        
        // Clone logo and resize
        const tempLogo = logo.clone();
        
        // Target logo width is 60% of screen width
        const targetWidth = Math.round(size.w * 0.60);
        tempLogo.resize(targetWidth, Jimp.AUTO);
        
        // Center position
        const x = Math.round((size.w - tempLogo.bitmap.width) / 2);
        const y = Math.round((size.h - tempLogo.bitmap.height) / 2);
        
        // Composite
        background.composite(tempLogo, x, y);
        
        const outputPath = path.join(__dirname, '..', 'public', `splash-${size.w}x${size.h}.png`);
        await background.writeAsync(outputPath);
        console.log(`Saved: ${outputPath}`);
    }
    console.log('All splash screens generated successfully!');
}

generate().catch(console.error);
