import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const logoDir = path.join(projectRoot, 'public', 'images', 'logo');
const publicDir = path.join(projectRoot, 'public');

const fullLogoPath = path.join(logoDir, 'tjyoga-logo-full.png');

async function generateLogos() {
  try {
    console.log('🎨 Начинаю генерацию логотипов и иконок...\n');

    // Загружаем исходное изображение
    const fullLogo = await sharp(fullLogoPath);
    const metadata = await fullLogo.metadata();
    
    console.log(`📐 Размер исходного изображения: ${metadata.width}x${metadata.height}px\n`);

    // 1. Создаем горизонтальный логотип для шапки (убираем лишние поля)
    console.log('1️⃣  Создаю оптимизированный логотип для шапки...');
    await fullLogo
      .trim() // Убираем прозрачные края
      .resize({ width: 800, withoutEnlargement: true })
      .toFile(path.join(logoDir, 'tjyoga-logo-header.png'));
    console.log('   ✅ tjyoga-logo-header.png создан\n');

    // 2. Вырезаем только буквы "TJ" для иконок (нижняя часть изображения)
    // Буквы TJ находятся в нижней части - берем примерно нижние 20% изображения
    console.log('2️⃣  Вырезаю буквы "TJ" для иконок...');
    
    const tjHeight = Math.floor(metadata.height * 0.25); // Берем нижние 25%
    const tjTop = metadata.height - tjHeight;
    
    // Вырезаем только текст "TJ"
    const tjExtract = await sharp(fullLogoPath)
      .extract({ 
        left: 0, 
        top: tjTop, 
        width: metadata.width, 
        height: tjHeight 
      })
      .trim() // Убираем лишние края
      .toBuffer();

    // Создаем квадратную иконку с буквами TJ
    const tjSquare = await sharp(tjExtract)
      .resize({ 
        width: 1024, 
        height: 1024, 
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();

    // Сохраняем базовую TJ иконку
    await sharp(tjSquare).toFile(path.join(logoDir, 'tj-icon-base.png'));
    console.log('   ✅ tj-icon-base.png создан\n');

    // 3. Генерируем все размеры фавиконок
    console.log('3️⃣  Генерирую фавиконки разных размеров...');
    
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

    // 4. Apple Touch Icon (180x180)
    console.log('4️⃣  Создаю Apple Touch Icon...');
    await sharp(tjSquare)
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('   ✅ apple-touch-icon.png создан\n');

    // 5. Android/PWA иконки
    console.log('5️⃣  Создаю Android/PWA иконки...');
    const pwaIcons = [192, 512];
    for (const size of pwaIcons) {
      await sharp(tjSquare)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFile(path.join(logoDir, 'exports', `tjyoga-logo-${size}.png`));
      console.log(`   ✅ tjyoga-logo-${size}.png создан`);
    }
    console.log('');

    // 6. Open Graph изображение (1200x630) - используем полный логотип
    console.log('6️⃣  Создаю Open Graph изображение для соцсетей...');
    
    // Создаем фон цвета бренда
    const ogBackground = await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 4,
        background: { r: 245, g: 240, b: 230, alpha: 1 } // light-text цвет
      }
    }).png().toBuffer();

    // Накладываем логотип по центру
    await sharp(ogBackground)
      .composite([{
        input: await sharp(fullLogoPath)
          .resize({ width: 800, withoutEnlargement: true })
          .toBuffer(),
        gravity: 'center'
      }])
      .toFile(path.join(publicDir, 'images', 'og-image.png'));
    console.log('   ✅ og-image.png создан\n');

    console.log('🎉 Все логотипы и иконки успешно созданы!');
    console.log('\n📋 Создано:');
    console.log('   • tjyoga-logo-header.png - для шапки сайта');
    console.log('   • tj-icon-base.png - базовая TJ иконка');
    console.log('   • favicon-*.png (16, 32, 64, 128) - фавиконки');
    console.log('   • favicon.ico - для браузеров');
    console.log('   • apple-touch-icon.png - для iOS');
    console.log('   • tjyoga-logo-192.png, tjyoga-logo-512.png - для PWA');
    console.log('   • og-image.png - для соцсетей');

  } catch (error) {
    console.error('❌ Ошибка при генерации логотипов:', error);
    process.exit(1);
  }
}

generateLogos();

