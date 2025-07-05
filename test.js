// test_db.js

// .env dosyasını en önce yüklediğimizden emin oluyoruz.
import dotenv from 'dotenv';
dotenv.config();

console.log("--- Veritabanı Bağlantı Testi Başladı ---");

// .env dosyasından okunan değişkenleri kontrol edelim
console.log("Okunan DB Host:", process.env.DB_HOST);
console.log("Okunan DB User:", process.env.DB_USER);
console.log("Okunan DB Port:", process.env.DB_PORT);
console.log("Okunan DB Database:", process.env.DB_DATABASE);

// Veritabanı bağlantısını dinamik olarak import ediyoruz
const testConnection = async () => {
  try {
    console.log("\n'db.js' modülü yükleniyor...");
    const { default: sql } = await import('./db.js');
    console.log("'db.js' modülü başarıyla yüklendi.");

    console.log("Veritabanına bağlanıp sorgu gönderiliyor...");
    
    // Basit bir sorgu ile bağlantıyı test et
    const result = await sql`SELECT NOW()`;
    
    console.log("\n✅ BAŞARILI! Veritabanı bağlantısı çalışıyor.");
    console.log("Veritabanı saati:", result[0].now);

    // Bağlantıyı sonlandır
    await sql.end();

  } catch (error) {
    console.error("\n❌ HATA! Veritabanına bağlanılamadı.");
    console.error("Hata Detayı:", error.message);
    console.error("\nLütfen .env dosyanızdaki DATABASE_URL veya diğer DB_ değişkenlerinin doğruluğunu ve Supabase projenizin aktif olduğunu kontrol edin.");
  }
};

testConnection();
