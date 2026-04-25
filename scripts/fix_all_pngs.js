import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

/**
 * Generates a minimal valid PNG.
 */
function createMinimalPng(width = 1, height = 1, r = 0, g = 0, b = 0, a = 255) {
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
    ihdr[8] = 8; // bit depth
    ihdr[9] = 6; // RGBA
    ihdr[10] = 0; // compression
    ihdr[11] = 0; // filter
    ihdr[12] = 0; // interlace

    const rowSize = width * 4 + 1;
    const imgData = Buffer.alloc(height * rowSize);
    for (let y = 0; y < height; y++) {
        imgData[y * rowSize] = 0; // None filter
        for (let x = 0; x < width; x++) {
            const pos = y * rowSize + 1 + x * 4;
            imgData[pos] = r;
            imgData[pos + 1] = g;
            imgData[pos + 2] = b;
            imgData[pos + 3] = a;
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

function isPng(filePath) {
    try {
        const buffer = fs.readFileSync(filePath);
        if (buffer.length < 8) return false;
        const signature = buffer.slice(0, 8);
        const expected = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
        return signature.equals(expected);
    } catch (e) {
        return false;
    }
}

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

const resDir = 'android/app/src/main/res';
if (fs.existsSync(resDir)) {
    walk(resDir, (filePath) => {
        if (filePath.endsWith('.png')) {
            const stats = fs.statSync(filePath);
            if (stats.size === 0 || !isPng(filePath)) {
                console.log(`Fixing corrupted PNG: ${filePath}`);
                // Use black for splash/night, transparent for others as a safe guess
                const isNight = filePath.includes('night');
                const isSplash = filePath.includes('splash');
                if (isNight || isSplash) {
                    fs.writeFileSync(filePath, createMinimalPng(48, 48, 0, 0, 0, 255)); // Black
                } else {
                    fs.writeFileSync(filePath, createMinimalPng(48, 48, 0, 0, 0, 0)); // Transparent
                }
            }
        }
    });
} else {
    console.log('Resource directory not found');
}
