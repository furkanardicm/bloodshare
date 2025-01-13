import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI ortam değişkeni tanımlanmamış.');
}

let isConnected = false;

export async function connect() {
  try {
    if (isConnected) {
      console.log('MongoDB zaten bağlı, mevcut bağlantı kullanılıyor.');
      return mongoose;
    }

    mongoose.set('strictQuery', true);

    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('MongoDB bağlantısı başarılı!');
    return mongoose;
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    throw error;
  }
}

// İlk bağlantıyı kur
connect().catch(console.error);

// Eski dbConnect fonksiyonunu da export edelim geriye dönük uyumluluk için
export const dbConnect = connect; 