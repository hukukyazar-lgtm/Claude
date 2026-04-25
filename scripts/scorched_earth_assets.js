import fs from 'fs';
import path from 'path';

// Valid 1x1 Transparent PNG Base64
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA6ie6hQAAAABJRU5ErkJggg==';
const pngBuffer = Buffer.from(pngBase64, 'base64');

const resPath = 'android/app/src/main/res';

function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.png')) {
            fs.writeFileSync(fullPath, pngBuffer);
            console.log(`Replaced with valid PNG: ${fullPath}`);
        }
    }
}

// 1. Cleanup specific known offenders
const offenders = [
    'android/app/src/main/res/values/ic_launcher_background.xml'
];
offenders.forEach(f => {
    if (fs.existsSync(f)) {
        fs.unlinkSync(f);
        console.log(`Deleted conflicting file: ${f}`);
    }
});

// 2. Fix all PNGs
walk(resPath);

console.log('Scorched earth asset fix complete.');
