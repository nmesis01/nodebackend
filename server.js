// server.js (Daha Sağlam Başlatma Mantığı)

// Önce dotenv'i import edip çalıştırıyoruz.
import dotenv from 'dotenv';
dotenv.config();

// Diğer temel modülleri import ediyoruz.
import express from 'express';
import cors from 'cors';

// Sunucuyu başlatmak için bir async fonksiyon oluşturuyoruz.
// Bu, veritabanı bağlantısını (sql) dinamik olarak import etmemizi sağlar.
const startServer = async () => {
  try {
    // DİNAMİK IMPORT: Bu satır, dotenv.config() çalıştıktan SONRA
    // db.js'i yükler ve sql nesnesini alır.
    const { default: sql } = await import('./db.js');
    console.log("Veritabanı modülü başarıyla yüklendi.");

    const app = express();

    // Middleware'ler
    app.use(cors());
    app.use(express.json());

    // Temel bağlantı testi için endpoint
    app.get('/', (req, res) => {
      res.send('Backend sunucusu çalışıyor!');
    });

    // Tüm albümleri getiren endpoint
    app.get('/api/albums', async (req, res) => {
      try {
        const allAlbums = await sql`
          SELECT
             a.id, a.title, a.description, a.cover_url,
             ar.name as artist,
             (SELECT json_agg(s.*) FROM songs s WHERE s.album_id = a.id) as songs
           FROM albums a
           JOIN artists ar ON a.artist_id = ar.id
           GROUP BY a.id, ar.name
           ORDER BY a.id
        `;
        res.json(allAlbums);
      } catch (err) {
        console.error("Albümleri çekerken hata:", err.message);
        res.status(500).send("Sunucu Hatası");
      }
    });

    // Arama endpoint'i
    app.get('/api/search', async (req, res) => {
        const searchTerm = req.query.q;
        if (!searchTerm) {
            return res.status(400).json({ error: 'Arama terimi gerekli' });
        }

        try {
            const results = await sql`
                SELECT 
                    s.id, s.title, s.duration, s.audio_url, s.cover_url,
                    json_build_object('id', al.id, 'title', al.title) as album,
                    ar.name as artist
                FROM songs s
                JOIN albums al ON s.album_id = al.id
                JOIN artists ar ON al.artist_id = ar.id
                WHERE unaccent(s.title) ILIKE unaccent(${'%' + searchTerm + '%'}) 
                   OR unaccent(ar.name) ILIKE unaccent(${'%' + searchTerm + '%'})
            `;
            res.json(results);
        } catch (err) {
            console.error("Arama hatası:", err.message);
            res.status(500).send("Sunucu Hatası");
        }
    });

    // Canlı ortam ve yerel ortam için port ayarı
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Node.js sunucusu ${PORT} portunda çalışıyor`);
    });

  } catch (error) {
    console.error("Sunucu başlatılırken bir hata oluştu:", error);
    process.exit(1); // Hata durumunda programı sonlandır
  }
};

// Sunucuyu başlat
startServer();
