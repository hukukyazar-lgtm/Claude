import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, r, g, b) {
    const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    
    function chunk(type, data) {
        const length = Buffer.alloc(4);
        length.writeUInt32BE(data.length);
        const typeBuf = Buffer.from(type, 'ascii');
        const crc = Buffer.alloc(4);
        const crcVal = (function(buf){
            let crc = 0xffffffff;
            const table = [];
            for(let n=0; n<256; n++){
                let c=n;
                for(let k=0; k<8; k++){
                    if(c&1) c=0xedb88320^(c>>>1);
                    else c=c>>>1;
                }
                table[n]=c;
            }
            for(let i=0; i<buf.length; i++) crc=table[(crc^buf[i])&0xff]^(crc>>>8);
            return (crc^0xffffffff)>>>0;
        })(Buffer.concat([typeBuf, data]));
        crc.writeUInt32BE(crcVal);
        return Buffer.concat([length, typeBuf, data, crc]);
    }

    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;
    ihdr[9] = 2; // RGB
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;

    const rowSize = width * 3 + 1;
    const imgData = Buffer.alloc(height * rowSize);
    for (let y = 0; y < height; y++) {
        imgData[y * rowSize] = 0;
        for (let x = 0; x < width; x++) {
            const offset = y * rowSize + 1 + x * 3;
            imgData[offset] = r;
            imgData[offset + 1] = g;
            imgData[offset + 2] = b;
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
const densities = [
    { name: 'ldpi', iconSize: 36, adaptiveSize: 108 },
    { name: 'mdpi', iconSize: 48, adaptiveSize: 108 },
    { name: 'hdpi', iconSize: 72, adaptiveSize: 162 },
    { name: 'xhdpi', iconSize: 96, adaptiveSize: 216 },
    { name: 'xxhdpi', iconSize: 144, adaptiveSize: 324 },
    { name: 'xxxhdpi', iconSize: 192, adaptiveSize: 432 }
];

densities.forEach(d => {
    const dir = path.join(resPath, `mipmap-${d.name}`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // ic_launcher.png (Legacy)
    fs.writeFileSync(path.join(dir, 'ic_launcher.png'), createPng(d.iconSize, d.iconSize, 40, 40, 40)); 
    // ic_launcher_round.png (Legacy Round)
    fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), createPng(d.iconSize, d.iconSize, 40, 40, 40)); 
    
    // Adaptive Background
    fs.writeFileSync(path.join(dir, 'ic_launcher_background.png'), createPng(d.adaptiveSize, d.adaptiveSize, 20, 20, 20)); // Dark grey
    // Adaptive Foreground
    fs.writeFileSync(path.join(dir, 'ic_launcher_foreground.png'), createPng(d.adaptiveSize, d.adaptiveSize, 100, 100, 255)); // Light blue
});

// Also fix the splash.png in drawable (main fallback)
const drawableDir = path.join(resPath, 'drawable');
if (!fs.existsSync(drawableDir)) fs.mkdirSync(drawableDir, { recursive: true });
fs.writeFileSync(path.join(drawableDir, 'splash.png'), createPng(1024, 1024, 0, 0, 0));

console.log('Mobile assets regenerated with fixed PNG structures and multiple layers.');
