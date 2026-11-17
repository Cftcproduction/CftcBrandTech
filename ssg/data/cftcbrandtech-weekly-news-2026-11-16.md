# CFTCbrandtech Haftalık Dijital Rapor
**Rapor:** 2026-11-16  |  **İncelenen dönem:** 9–15 Kasım 2026

9–15 Kasım 2026 döneminde 5 somut gelişme: Google Search Referer ölçümleme dokümanı, Shopify değişiklik günlüğü, Shopify müşteri hesapları, AB Digital Fairness Act teklifi ve Google Ads geliştirici duyuru kaynağı taşınması. Meta Ads için doğrulanmış yüksek etkili yeni duyuru tespit edilmedi. Shopify yenilikleri ikas/IdeaSoft için geçerli değildir.

## Doğrulanmış gelişmeler

### 1. Google Search kaynak trafiğini tanımlama dokümanı — P1 (2026-11-12)
**Alan:** SEO / GA4 ölçümleme  |  **Pazar:** TR, ABD, UK, AB; tüm organik trafik alan siteler

**Ne değişti?** Google, Google Search kaynaklı ziyaretleri HTTP Referer ile belirleme yöntemini resmî olarak belgelendirdi; yeni bir sıralama algoritması veya GA4 özelliği ilan edilmedi.

**Neden önemli?** Search Console tıklamaları ile GA4 oturumları farklı ölçüldüğünden SEO performansının yanlış yorumlanmasını ve hatalı kanal sınıflamasını önlemeye yardımcı olur.

**Bu haftanın testi:** Search Console organik tıklamalarını GA4 google/organic oturumlarıyla aynı tarih ve açılış sayfasında karşılaştır; 10 yüksek trafikli URL için yönlendirme zincirlerini, Referer, consent, UTM/gclid korumasını incele; farkı cihaz ve tarayıcıya göre ayır.

**KPI:** GSC tıklama / GA4 organik oturum oranı, direct/unassigned oturum payı, landing-page ölçüm kapsaması.

**Sınır/uyarı:** GSC tıklaması GA4 oturumuna bire bir eşitlenmez; düzeltme sonrası mutlak eşitlik hedeflenmemeli.

**Resmî kaynak:** https://developers.google.com/search/docs/monitor-debug/identify-google-search-traffic/ (2026-11-12)

### 2. Shopify Store activity log yeniden tasarlandı — P1 (2026-11-13)
**Alan:** E-ticaret / operasyon  |  **Pazar:** Shopify kullanan TR/ABD/UK/AB mağazalar

**Ne değişti?** Ürün, sipariş, indirim, tema, uygulama, personel, ödeme ve ayar değişiklikleri tek günlükte toplanıyor; aktör, alan, tarih filtreleri ve uygun kayıtlarda önce/sonra değerleri gösteriliyor; 18 aya kadar saklama belirtiliyor.

**Neden önemli?** Hatalı fiyat, indirim, checkout veya tema değişikliklerinden doğan gelir kaybının kök nedenini daha hızlı bulmayı sağlayabilir.

**Bu haftanın testi:** Test mağazasında düşük riskli bir ürün açıklaması veya test indirimi değiştir; günlüğün aktörü, alanı, zamanını doğru gösterdiğini kontrol et; bir örnek olayın teşhis süresini ölç.

**KPI:** değişiklik tespit süresi, olay çözüm süresi, kaydı bulunan kritik değişiklik oranı.

**Sınır/uyarı:** Yetki ve kayıt kapsamı sınırlı; geçmiş tüm işlemler geriye dönük mevcut değil; IdeaSoft ve ikas için geçerli değil.

**Resmî kaynak:** https://changelog.shopify.com/posts/review-store-changes-in-the-new-store-activity-log (2026-11-13)

### 3. Shopify müşteri hesaplarında mağaza kredisi ve öneriler — P2 (2026-11-12)
**Alan:** E-ticaret / CRO  |  **Pazar:** Güncel Shopify müşteri hesabı kullanan ABD/UK/AB/TR mağazalar

**Ne değişti?** Güncel müşteri hesaplarında kredi bakiyesi tüm sayfalarda görülebiliyor; ilk siparişini vermemiş giriş yapmış müşterilere kişiselleştirilmiş katalog önerileri gösteriliyor.

**Neden önemli?** Mevcut kredinin görünürlüğü kullanım sürtünmesini azaltabilir; öneriler ilk satın almayı kolaylaştırabilir; etkisi deneyle doğrulanmalı.

**Bu haftanın testi:** Uygun hesaplarda kredi bakiyesi ve önerilerin doğru görünmesini doğrula; uygun yeni müşteri segmentinin 14 günlük dönüşümünü önceki benzer kohortla karşılaştır, trafik karışımını kontrol et.

**KPI:** ilk sipariş dönüşüm oranı, müşteri hesabından ürüne tıklama oranı, kredi kullanım oranı, sipariş başına gelir.

**Sınır/uyarı:** Eski müşteri hesaplarında özellik bulunmayabilir; kişiselleştirme performans artışı garanti etmez.

**Resmî kaynak:** https://changelog.shopify.com/posts/customer-accounts-now-show-store-credit-and-personalized-product-recommendations (2026-11-12)

### 4. AB Digital Fairness Act teklifi — P1 (2026-11-11)
**Alan:** Web/UX / mevzuat  |  **Pazar:** AB tüketicilerine satış yapan Türkiye/UK/ABD merkezli e-ticaret ve lead-gen markaları

**Ne değişti?** Avrupa Komisyonu, manipülatif tasarım kalıpları, gizli ücretler ve şeffaf olmayan influencer pazarlamasını hedefleyen Digital Fairness Act teklifini ve CPC iş birliği reformunu sundu.

**Neden önemli?** AB tüketicilerine satış yapan sitelerde fiyat şeffaflığı, abonelik iptali ve reklam açıklamalarının yeniden değerlendirilmesini gerektirebilir; bu henüz yürürlükte olan yeni bir kanun değil.

**Bu haftanın testi:** AB müşteri yolculuğunu mobilde test et: liste fiyatı-sepet-kargo-ödeme toplamı tutarlılığı, önceden seçili kutular, aciliyet iddiaları, influencer iş birliği etiketleri ve iptal akışı; bulguları risk matrisine koy.

**KPI:** checkout aşaması terk oranı, beklenmedik ücret şikâyetleri, fiyat tutarsızlığı sayısı, uyumsuz tasarım bulgusu.

**Sınır/uyarı:** Hukuki yürürlük ve kapsam ayrıca takip edilmeli; hukuki görüş yerine geçmez.

**Resmî kaynak:** https://audiovisual.ec.europa.eu/en/stories/M-010072 (2026-11-11)

### 5. Google Ads geliştirici duyuru kanalı taşındı — P3 (2026-11-10)
**Alan:** Google Ads / ajans otomasyonu  |  **Pazar:** Google Ads API kullanan tüm pazarlar

**Ne değişti?** Google Ads Developer Blog, 11 Kasım itibarıyla Google for Developers alanına taşındı; yeni RSS adresi duyuruldu.

**Neden önemli?** Ajansın API değişikliklerini takip eden otomasyonları eski besleme yüzünden duyuruları kaçırabilir; kampanya performansında doğrudan değişiklik yok.

**Bu haftanın testi:** İzleme botunda yeni RSS https://developers.google.com/ads/blog/rss.xml kaynağını ekle, son 25 gönderiyi çek ve eski-yeni kaynak mükerrerlerini ayıkla.

**KPI:** duyuru yakalama gecikmesi, başarılı RSS sorgu oranı, mükerrer bildirim sayısı.

**Sınır/uyarı:** Yeni RSS son 25 gönderiyi içerir ve ürün bazlı feed sağlamaz.

**Resmî kaynak:** https://developers.google.com/ads/blog/posts/2026/11/the-google-ads-developer-blog-is-moving (2026-11-10)

## Yeni ve önemli duyuru doğrulanamayan alanlar
Meta Ads için bu tarih aralığında, kampanya kurulumunu değiştirmeyi gerektiren yüksek etkili bir resmî duyuru doğrulanmadı. GA4 için 9–15 Kasım tarihli yeni bir ürün sürümü doğrulanmadı; 6 Kasım tarihli Data Manager beta duyurusu bu haftanın kapsamı dışındadır. Türkiye ve İngiltere’ye özgü, doğrulanmış yeni e-ticaret kuralı tespit edilmedi.

## Önceliklendirilmiş haftalık aksiyon planı (16–20 Kasım)

- **P1 · Pazartesi · Analytics:** GSC–GA4 ve platform siparişleri: Ölçüm farklarını kontrol edin. Kendi sitenizde Search Console organik tıklamalarını GA4 google/organic oturumlarıyla aynı tarih aralığı ve açılış sayfasında karşılaştırın; bu iki metriğin birebir eşleşmesi beklenmez. Son yedi günün GA4 satın alma kayıtlarını e-ticaret platformunuzdaki gerçek siparişlerle, aynı saat dilimi ve işlem kimliği (transaction_id) üzerinden karşılaştırın. Eksik veya mükerrer kayıtları inceleyin; test siparişlerini ayrıca işaretleyerek gerçek satış analizinden ayırın. **KPI:** Gerçek siparişlerin GA4’te yakalanma oranı, mükerrer satın alma sayısı ve ciro farkı.
- **P1 · Salı · UX/Compliance:** AB tüketicilerine satış yapıyor veya reklamlarla ulaşıyorsanız sitenizde toplam fiyatı, teslimat bilgilerini, influencer iş birliği açıklamalarını ve yanıltıcı tasarım kalıplarını kontrol edin; düzeltmeleri etki ve riske göre sıralayın. **KPI:** kritik risk bulgusu ve checkout terk oranı.
- **P1 · Çarşamba · E-ticaret operasyon:** Shopify kullanıyorsanız test mağazanızda bir test indirimi veya tema değişikliğini değişiklik günlüğünden izleyin; farklı bir altyapı kullanıyorsanız kendi platformunuzun kayıt imkânlarını kontrol edin. **KPI:** olay tespit/çözüm süresi.
- **P2 · Perşembe · CRO:** Uygun Shopify mağazanızda müşteri hesabı önerilerini ve mağaza kredisi görünürlüğünü doğrulayın; benzer müşteri gruplarının dönüşümünü karşılaştırarak etkisini ölçün. **KPI:** ilk satın alma CVR ve kredi kullanımı.
- **P3 · Cuma · Otomasyon:** Google Ads API duyurularını RSS ile takip ediyorsanız yeni kaynağa geçin; Meta Ads ve GA4 resmî değişiklik kanallarını da izlemeye devam edin. **KPI:** RSS başarı oranı.

## Kaynaklar ve telif notları

- 2026-11-12 — Google Search Central: Google Search trafiği için Referer dokümantasyonu. https://developers.google.com/search/updates
- 2026-11-12 — Google Search Central: Referer, Search Console ve GA4 farkları. https://developers.google.com/search/docs/monitor-debug/identify-google-search-traffic/
- 2026-11-13 — Shopify: Mağaza işlem geçmişi. https://changelog.shopify.com/posts/review-store-changes-in-the-new-store-activity-log
- 2026-11-12 — Shopify: Müşteri hesabında kredi ve ürün önerileri. https://changelog.shopify.com/posts/customer-accounts-now-show-store-credit-and-personalized-product-recommendations
- 2026-11-11 — European Commission: Digital Fairness Act teklifi. https://audiovisual.ec.europa.eu/en/stories/M-010072
- 2026-11-11 — European Commission Germany: Karanlık örüntüler, gizli ücretler ve influencer şeffaflığı. https://germany.representation.ec.europa.eu/nachrichten-und-veranstaltungen/pressemitteilungen/gleiche-rechte-offline-und-online-eu-kommission-schlagt-aktualisierung-der-verbraucherschutzregeln-2026-11-11_de
- 2026-11-10 — Google Ads Developer: Teknik duyuru RSS taşınması. https://developers.google.com/ads/blog/posts/2026/11/the-google-ads-developer-blog-is-moving

Tüm analiz ve test planları özgün olarak yazılmıştır. Kaynakların kısa olgusal özetleri kullanılmış, metin veya görseller kopyalanmamıştır. Tarihler resmî duyuru/dokümantasyon tarihleridir. Önerilen testler doğrulanmış ürün etkisi değil, hipotezdir.
