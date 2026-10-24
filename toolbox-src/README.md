# CFTC BrandTech Toolbox

Görsel Atölyesi, `https://www.cftcbrandtech.com/toolbox/` altında çalışan bağımsız bir tarayıcı uygulamasıdır. WebP, PNG, JPG ve AVIF çıktıları, oran presetleri, serbest/kilitli kırpma, kırpılmış sonuç önizlemesi ve toplu ZIP indirme sunar. Görseller sunucuya yüklenmez.

## Yayın yapısı

- `toolbox-src/`: düzenlenebilir kaynak kod ve kilitlenmiş bağımlılık sürümleri.
- `toolbox/`: kaynak koddan üretilmiş, doğrudan yayınlanabilir dosyalar; Git'e dahil edilir.
- `ssg/build.js`: `toolbox/` klasörünü `ssg/dist/toolbox/` içine kopyalar; site haritasına ve oluşturduğu sayfaların ana/alt menülerine bağlantı ekler.

Mevcut Vercel projesinde Root Directory `ssg`, Build Command `npm run build`, Output Directory `dist` ayarları kullanıldığında mevcut site derlemesi Toolbox'ı da içerir. Ana dizini doğrudan statik yayınlayan bir kurulumda `toolbox/` klasörü de tek başına çalışır. Ek ortam değişkeni, veri tabanı veya API anahtarı gerekmez.

## Kaynak kodu güncelleme

Node.js 22.12+ veya desteklenen daha yeni bir sürümle:

```sh
cd toolbox-src
npm ci
npm run build
cd ../ssg
npm run build
```

Vite'nin `/toolbox/` taban yolu; ana JavaScript dosyası, dinamik codec parçaları, Web Worker ve WASM dosyaları için korunmalıdır. Üretilen `toolbox/` dosyalarını kaynak değişiklikleriyle birlikte commit edin. Siteyi normal şekilde yeniden yayınlayın. Mevcut site build'i Toolbox bağımlılıklarını ayrıca yüklemeye ihtiyaç duymaz.

`Ücretsiz Araçlar` bağlantısı `data-no-swup` taşır. Aracın kendi sayfa yapısının yüklenebilmesi için bu niteliği kaldırmayın. Toolbox içindeki CFTC BrandTech bağlantısı ana siteye geri döner.

## Erişim ve sınırlar

Bu sürüm kurumsal sitenin herkese açık bir parçasıdır; ChatGPT hesabıyla giriş istemez. Dosya başına 50 MB ve görsel başına 40 megapiksel sınırı geçerlidir. Animasyonların ve çok sayfalı dosyaların ilk karesi/sayfası işlenir; kamera RAW ve PDF desteklenmez. Sekme kapatılınca dosyalar ve kırpma ayarları kaybolur.
