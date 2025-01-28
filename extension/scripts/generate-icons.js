import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const sizes = [16, 32, 48, 128];
const inputSvg = path.join(process.cwd(), 'src/assets/icon.svg');
const outputDir = path.join(process.cwd(), 'src/assets');

async function generateIcons() {
    try {
        const svgBuffer = await fs.readFile(inputSvg);

        await Promise.all(sizes.map(async (size) => {
            const outputPath = path.join(outputDir, `icon${size}.png`);
            await sharp(svgBuffer)
                .resize(size, size)
                .png()
                .toFile(outputPath);
            console.log(`Generated ${size}x${size} icon`);
        }));

        console.log('All icons generated successfully!');
    } catch (error) {
        console.error('Error generating icons:', error);
        process.exit(1);
    }
}

generateIcons(); 