# Ücretsiz Araçlar

`node ssg/build.js` araç sayfalarını `araclar/` ve yayın çıktısı `ssg/dist/araclar/` altında üretir. Sayfa tanımları `ssg/tools.js`, hesaplamalar `js/tool-calculations.mjs`, etkileşimler `js/tools.js`, görünüm `css/tools.css` içindedir. Üretilen `araclar/` dosyalarını kaynak değişiklikleriyle birlikte saklayın.

Doğrulama: `node --test ssg/tests/tools.test.cjs` ve `node ssg/build.js`.

## PageSpeed kurulumu

Mevcut Vercel proje kökü `ssg`, build komutu `npm run build`, çıktı `dist` olarak kalır. `ssg/api/pagespeed.js` sunucu işlevi, statik çıktının dışında Vercel tarafından yayınlanır. İşlev süresi `vercel.json` içinde 60 saniyedir; kullanılan hosting planının bunu desteklemesi gerekir.

Google Cloud projesinde PageSpeed Insights API'yi etkinleştirin. API anahtarını yalnızca bu API için kısıtlayın ve Vercel ortam değişkenlerine `PAGESPEED_API_KEY` olarak ekleyin. Anahtarı dosyalara veya tarayıcı koduna koymayın. Yeniden yayın sonrası bir gerçek URL ile mobil ve masaüstü raporlarını kontrol edin.

İşlev örneği başına IP başına dakikada üç istek sınırı vardır; bu bellek içi sınır farklı sunucu örnekleri arasında paylaşılmaz. Maliyet/kota için Google Cloud projesinde günlük API kotasını da sınırlayın. API yanıtları önbelleğe alınmaz, URL ve anahtar uygulama tarafından loglanmaz. Sadece Google'ın sabit API adresine bağlantı kurulur.

Salt statik hostingde hesaplayıcılar çalışır, site içi hız raporu için sunucu işlevi destekleyen Vercel kurulumu gerekir. Eksik anahtar durumunda kullanıcıya yapılandırma mesajı gösterilir. Canlıya yayın bu değişikliğin parçası değildir.
