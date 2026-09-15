import { MAX_PHOTO_BYTES } from './own-car-input';

export async function prepareCarPhoto(file: File): Promise<File> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 25 * 1024 * 1024) {
    throw new Error('Выберите фото JPG, PNG или WebP размером до 25 МБ.');
  }
  const bitmap = await createImageBitmap(file);
  try {
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > 80000000) throw new Error('Слишком большое изображение.');
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Не удалось подготовить фото.');
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Не удалось подготовить фото.')), 'image/jpeg', 0.85));
    if (blob.size > MAX_PHOTO_BYTES) throw new Error('Фото слишком большое. Выберите другое изображение.');
    return new File([blob], 'car-photo.jpg', { type: 'image/jpeg' });
  } finally { bitmap.close(); }
}
