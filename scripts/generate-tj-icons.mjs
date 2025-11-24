import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const logoDir = path.join(projectRoot, 'public', 'images', 'logo');
const publicDir = path.join(projectRoot, 'public');

const tjCutPath = path.join(logoDir, 'exports', 'TJ_cut.png');

async function generateTJIcons() {
  try {
    console.log('🎨 Генерирую иконки из TJ_cut.png...\n');

    // Загружаем исходное изображение TJ
    const tjImage = await sharp(tjCutPath);
    const metadata = await tjImage.metadata();
    
    console.log(`📐 Размер исходного изображения TJ: ${metadata.width}x${metadata.height}px\n`);

    // Создаем квадратную базовую иконку с буквами TJ
    console.log('1️⃣  Создаю базовую квадратную иконку TJ...');
    const tjSquare = await sharp(tjCutPath)
      .resize({ 
        width: 1024, 
        height: 1024, 
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();

    // Сохраняем базовую иконку
    await sharp(tjSquare).toFile(path.join(logoDir, 'tj-icon-base.png'));
    console.log('   ✅ tj-icon-base.png создан\n');

    // 2. Генерируем все размеры фавиконок
    console.log('2️⃣  Генерирую фавиконки разных размеров...');
    
    const faviconSizes = [16, 32, 64, 128];
    for (const size of faviconSizes) {
      await sharp(tjSquare)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFile(path.join(publicDir, `favicon-${size}.png`));
      console.log(`   ✅ favicon-${size}.png создан`);
    }

    // Создаем favicon.ico (используем 32x32)
    await sharp(tjSquare)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFormat('png')
      .toFile(path.join(publicDir, 'favicon.ico'));
    console.log('   ✅ favicon.ico создан\n');

    // 3. Apple Touch Icon (180x180)
    console.log('3️⃣  Создаю Apple Touch Icon...');
    await sharp(tjSquare)
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('   ✅ apple-touch-icon.png создан\n');

    // 4. Android/PWA иконки
    console.log('4️⃣  Создаю Android/PWA иконки...');
    const pwaIcons = [192, 512];
    for (const size of pwaIcons) {
      await sharp(tjSquare)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFile(path.join(logoDir, 'exports', `tjyoga-logo-${size}.png`));
      console.log(`   ✅ tjyoga-logo-${size}.png создан`);
    }

    console.log('\n🎉 Все иконки с буквами TJ успешно созданы!');
    console.log('\n📋 Создано:');
    console.log('   • tj-icon-base.png - базовая TJ иконка');
    console.log('   • favicon-*.png (16, 32, 64, 128) - фавиконки');
    console.log('   • favicon.ico - для браузеров');
    console.log('   • apple-touch-icon.png - для iOS');
    console.log('   • tjyoga-logo-192.png, tjyoga-logo-512.png - для PWA');

  } catch (error) {
    console.error('❌ Ошибка при генерации иконок:', error);
    process.exit(1);
  }
}

generateTJIcons();

