# Ücretsiz Araçlar

`node ssg/build.js` araç sayfalarını `araclar/` ve yayın çıktısı `ssg/dist/araclar/` altında üretir. Sayfa tanımları `ssg/tools.js`, hesaplamalar `js/tool-calculations.mjs`, etkileşimler `js/tools.js`, görünüm `css/tools.css` içindedir. Üretilen `araclar/` dosyalarını kaynak değişiklikleriyle birlikte saklayın.

Doğrulama: `node --test ssg/tests/tools.test.cjs` ve `node ssg/build.js`.

API'ler dahil yerel önizleme: `ssg` klasöründe `npm run dev` (Node 24). Varsayılan adres `http://127.0.0.1:4174/araclar/`; `.env.local` otomatik yüklenir. Önce build çalıştırın.

## Yeni değerlendirme araçları

Reklam kârlılığı ve e-ticaret araçları değişken giderler sonrası katkı hesaplar; sabit gider ve vergiler sonrası net kâr hesaplamaz. Büyüme fırsatları aracı kullanıcı beyanına göre web sitesi, ölçüm, SEO, reklam ve CRM için eşit ağırlıklı beş maddelik öz değerlendirme sunar.

`/api/site-analysis?mode=conversion&url=…` tek sayfa; `mode=competitor&url=…&competitor=…&keyword=…` iki sayfa için HTML ön incelemesi yapar. Sunucu işlevi `ssg/api/site-analysis.js`, güvenli okuma ve sinyal çıkarımı `ssg/lib/site-analysis.cjs` içindedir. Her yönlendirmede URL ve DNS doğrulanır; bağlantı doğrulanmış herkese açık IPv4 adresine sabitlenir. Özel/rezerve IP'ler, kimlik bilgili URL'ler ve özel portlar engellenir. En fazla üç yönlendirme, sayfa başına 15 saniye ve 2 MB HTML sınırı vardır. IPv6-only siteler desteklenmez.

HTML incelemesi sayfada JavaScript çalıştırmaz, form göndermez, kimlik doğrulama veya erişim engellerini aşmaz. Engellenen ya da okunamayan sayfalar raporda ayrıca belirtilir. SEO sonuçları sıralama, trafik veya backlink verisi değildir; dönüşüm ön incelemesinde mobil PageSpeed raporu ayrıca istenir ve kısmi hatalarda erişilebilen bulgular korunur. Sonuç ekranlarındaki uzman desteği bağlantıları mevcut iletişim sayfasına gider; otomatik başvuru gönderilmez.

## PageSpeed kurulumu

Mevcut Vercel proje kökü `ssg`, build komutu `npm run build`, çıktı `dist` olarak kalır. `ssg/api/pagespeed.js` sunucu işlevi, statik çıktının dışında Vercel tarafından yayınlanır. İşlev süresi `vercel.json` içinde 60 saniyedir; kullanılan hosting planının bunu desteklemesi gerekir.

Google Cloud projesinde PageSpeed Insights API'yi etkinleştirin. API anahtarını yalnızca bu API için kısıtlayın ve Vercel ortam değişkenlerine `PAGESPEED_API_KEY` olarak ekleyin. Anahtarı dosyalara veya tarayıcı koduna koymayın. Yeniden yayın sonrası bir gerçek URL ile mobil ve masaüstü raporlarını kontrol edin.

İşlev örneği başına IP başına dakikada üç istek sınırı vardır; bu bellek içi sınır farklı sunucu örnekleri arasında paylaşılmaz. Maliyet/kota için Google Cloud projesinde günlük API kotasını da sınırlayın. API yanıtları önbelleğe alınmaz, URL ve anahtar uygulama tarafından loglanmaz. Sadece Google'ın sabit API adresine bağlantı kurulur.

Salt statik hostingde hesaplayıcılar çalışır, site içi hız raporu için sunucu işlevi destekleyen Vercel kurulumu gerekir. Eksik anahtar durumunda kullanıcıya yapılandırma mesajı gösterilir. Canlıya yayın bu değişikliğin parçası değildir.
