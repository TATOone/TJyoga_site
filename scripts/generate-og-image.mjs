import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const logoPath = path.join(projectRoot, 'public', 'images', 'logo', 'full_logo.png');
const outputPath = path.join(projectRoot, 'public', 'images', 'og-image.png');

async function generateOGImage() {
  try {
    console.log('🎨 Создаю Open Graph изображение для соцсетей...\n');

    // Стандартный размер для OG изображений
    const width = 1200;
    const height = 630;

    // Создаём красивый градиентный фон в тёмных тонах для контраста
    // От оливкового к тёмно-коричневому
    const svgBackground = `
      <svg width="${width}" height="${height}">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#8B7355;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#5A4A3A;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#grad1)" />
      </svg>
    `;

    // Загружаем логотип
    const logo = await sharp(logoPath)
      .resize({ width: 600, height: 400, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    // Создаём финальное изображение: фон + логотип по центру
    await sharp(Buffer.from(svgBackground))
      .composite([
        {
          input: logo,
          gravity: 'center'
        }
      ])
      .png({ quality: 90 })
      .toFile(outputPath);

    console.log('✅ Open Graph изображение создано: og-image.png');
    console.log('📐 Размер: 1200x630px (стандарт для соцсетей)');
    console.log('🎨 Фон: элегантный градиент в цветах бренда');
    console.log('📱 Теперь при отправке ссылки будет красивое превью!\n');

  } catch (error) {
    console.error('❌ Ошибка при создании OG изображения:', error);
    process.exit(1);
  }
}

generateOGImage();

