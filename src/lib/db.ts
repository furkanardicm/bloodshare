import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error(
    "MongoDB bağlantı adresi bulunamadı. Lütfen .env dosyasını kontrol edin."
  )
}

async function dbConnect() {
  try {
    if (mongoose.connection.readyState >= 1) {
      return
    }

    return await mongoose.connect(MONGODB_URI as string)
  } catch (error) {
    console.error("MongoDB bağlantı hatası:", error)
    throw error
  }
}

export default dbConnect 