import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

/**
 * Generates a valid PNG Buffer with correct CRC and structure that AAPT2 will accept.
 */
function createPerfectPng(width, height, r, g, b) {
    const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    
    function calculateCrc(buf) {
        let crc = 0xffffffff;
        const table = [];
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) {
                if (c & 1) c = 0xedb88320 ^ (c >>> 1);
                else c = c >>> 1;
            }
            table[n] = c;
        }
        for (let i = 0; i < buf.length; i++) {
            crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
        }
        return (crc ^ 0xffffffff) >>> 0;
    }

    function chunk(type, data) {
        const len = Buffer.alloc(4);
        len.writeUInt32BE(data.length);
        const typeBuf = Buffer.from(type, 'ascii');
        const combination = Buffer.concat([typeBuf, data]);
        const crc = Buffer.alloc(4);
        crc.writeUInt32BE(calculateCrc(combination));
        return Buffer.concat([len, combination, crc]);
    }

    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8; // bits
    ihdr[9] = 2; // color type RGB
    ihdr[10] = 0; // compression
    ihdr[11] = 0; // filter
    ihdr[12] = 0; // interlace

    const rowSize = width * 3 + 1;
    const imgData = Buffer.alloc(height * rowSize);
    for (let y = 0; y < height; y++) {
        imgData[y * rowSize] = 0; // filter type None
        for (let x = 0; x < width; x++) {
            const pos = y * rowSize + 1 + x * 3;
            imgData[pos] = r;
            imgData[pos + 1] = g;
            imgData[pos + 2] = b;
        }
    }

    const idat = zlib.deflateSync(imgData);
    return Buffer.concat([
        header,
        chunk('IHDR', ihdr),
        chunk('IDAT', idat),
        chunk('IEND', Buffer.alloc(0))
    ]);
}

const resPath = 'android/app/src/main/res';
const iconDensities = [
    { name: 'ldpi', size: 36, adaptive: 81 },
    { name: 'mdpi', size: 48, adaptive: 108 },
    { name: 'hdpi', size: 72, adaptive: 162 },
    { name: 'xhdpi', size: 96, adaptive: 216 },
    { name: 'xxhdpi', size: 144, adaptive: 324 },
    { name: 'xxxhdpi', size: 192, adaptive: 432 }
];

// 1. Process Mipmaps (App Icons)
iconDensities.forEach(d => {
    const dir = path.join(resPath, `mipmap-${d.name}`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    console.log(`Generating icons for ${d.name}...`);
    // Legacy icons
    fs.writeFileSync(path.join(dir, 'ic_launcher.png'), createPerfectPng(d.size, d.size, 66, 133, 244)); // Google Blue
    fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), createPerfectPng(d.size, d.size, 66, 133, 244));
    
    // Adaptive layers
    fs.writeFileSync(path.join(dir, 'ic_launcher_background.png'), createPerfectPng(d.adaptive, d.adaptive, 15, 15, 15)); // Dark
    fs.writeFileSync(path.join(dir, 'ic_launcher_foreground.png'), createPerfectPng(d.adaptive, d.adaptive, 255, 255, 255)); // White
});

// 2. Process Drawables (Splash Screens)
// We'll search for every directory that contains a splash.png and replace it with a valid high-res one
function fixSplashes(root) {
    const entries = fs.readdirSync(root, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(root, entry.name);
        if (entry.isDirectory()) {
            fixSplashes(fullPath);
        } else if (entry.name === 'splash.png') {
            console.log(`Fixing splash: ${fullPath}`);
            // Use 1280x720 or similar for splashes to ensure compliance
            const isLand = root.includes('-land');
            const w = isLand ? 1920 : 1080;
            const h = isLand ? 1080 : 1920;
            fs.writeFileSync(fullPath, createPerfectPng(w, h, 0, 0, 0));
        }
    }
}

fixSplashes(resPath);

console.log('--- PROFESSIONAL ASSET REGENERATION COMPLETE ---');
