import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

/**
 * Generates a valid PNG with a colored circle on a transparent background.
 */
function createCirclePng(size, r, g, b) {
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

    const width = size;
    const height = size;
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8; // bits
    ihdr[9] = 6; // color type RGBA
    ihdr[10] = 0; // compression
    ihdr[11] = 0; // filter
    ihdr[12] = 0; // interlace

    const rowSize = width * 4 + 1;
    const imgData = Buffer.alloc(height * rowSize);
    const radius = size / 2.5;
    const centerX = size / 2;
    const centerY = size / 2;

    for (let y = 0; y < height; y++) {
        imgData[y * rowSize] = 0; // filter type None
        for (let x = 0; x < width; x++) {
            const pos = y * rowSize + 1 + x * 4;
            const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            if (dist < radius) {
                imgData[pos] = r;
                imgData[pos + 1] = g;
                imgData[pos + 2] = b;
                imgData[pos + 3] = 255;
            } else {
                imgData[pos] = 0;
                imgData[pos + 1] = 0;
                imgData[pos + 2] = 0;
                imgData[pos + 3] = 0; // Transparent
            }
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
const targets = [
    { dir: 'mipmap-ldpi', file: 'ic_launcher.png', size: 36, color: [66, 133, 244] },
    { dir: 'mipmap-ldpi', file: 'ic_launcher_round.png', size: 36, color: [66, 133, 244] },
    { dir: 'mipmap-mdpi', file: 'ic_launcher_round.png', size: 48, color: [66, 133, 244] }
];

targets.forEach(t => {
    const fullDir = path.join(resPath, t.dir);
    if (!fs.existsSync(fullDir)) fs.mkdirSync(fullDir, { recursive: true });
    const fullPath = path.join(fullDir, t.file);
    fs.writeFileSync(fullPath, createCirclePng(t.size, t.color[0], t.color[1], t.color[2]));
    console.log(`Generated: ${fullPath} (${t.size}x${t.size})`);
});
