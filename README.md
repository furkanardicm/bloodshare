# BloodShare - Kan Bağışı Platformu

BloodShare, kan bağışı ihtiyaçlarını kolayca paylaşabileceğiniz ve bağışçılarla iletişime geçebileceğiniz bir platformdur.

## Özellikler

- 🩸 Kan bağışı ihtiyaçlarını paylaşma
- 🔍 Kan grubu ve şehre göre filtreleme
- 👥 Güvenli kullanıcı yönetimi
- 📱 Mobil uyumlu tasarım
- 🌙 Karanlık mod desteği

## Teknolojiler

- Next.js 14
- TypeScript
- MongoDB
- NextAuth.js
- Tailwind CSS
- Radix UI
- shadcn/ui

## Kurulum

1. Repoyu klonlayın:

```bash
git clone https://github.com/furkanardicm/bloodshare.git
cd bloodshare
```

2. Bağımlılıkları yükleyin:

```bash
npm install
```

3. `.env` dosyasını oluşturun:

```env
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

## Katkıda Bulunma

1. Bu repoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request oluşturun

## Lisans

MIT Lisansı altında dağıtılmaktadır. Daha fazla bilgi için `LICENSE` dosyasına bakın.
