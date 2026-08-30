# سجل المصادر — إعادة بناء جنائي-جغرافي لحرائق ولاية جيجل، أوت 2026

تاريخ الاطّلاع على جميع المصادر الواردة أدناه: **29 أوت 2026** (ما لم يُذكر خلاف ذلك).

---

## المستوى الأول (Tier 1) — بيانات رصدية ومؤسسات رسمية

### مجموعات البيانات الفضائية

| المعرّف | اسم المجموعة | الجهة | المستشعر / الدقة | المدى الزمني المستخدم | الرابط |
|---|---|---|---|---|---|
| DS-01 | FIRMS Active Fire Data — VIIRS S-NPP C2 (NRT) | NASA FIRMS / LANCE, NASA GSFC | VIIRS، 375 م | 22–29 أوت 2026 | https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_Europe_7d.csv |
| DS-02 | FIRMS Active Fire Data — VIIRS NOAA-20 C2 (NRT) | NASA FIRMS / LANCE | VIIRS، 375 م | 22–29 أوت 2026 | https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_Europe_7d.csv |
| DS-03 | FIRMS Active Fire Data — VIIRS NOAA-21 C2 (NRT) | NASA FIRMS / LANCE | VIIRS، 375 م | 22–29 أوت 2026 | https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-21-viirs-c2/csv/J2_VIIRS_C2_Europe_7d.csv |
| DS-04 | FIRMS Active Fire Data — MODIS C6.1 (NRT) | NASA FIRMS / LANCE | MODIS، 1 كم | 22–29 أوت 2026 | https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Europe_7d.csv |
| DS-05 | Sentinel-2 MSI Level-2A (COG) | ESA Copernicus / AWS Open Data (Element84 earth-search) | MSI، 10–20 م | مشاهد 18 و26 و28 أوت 2026 | https://earth-search.aws.element84.com/v1 |
| DS-06 | Copernicus DEM GLO-30 | ESA / Airbus، عبر AWS Open Data | نموذج ارتفاع رقمي، 30 م | ثابت | https://copernicus-dem-30m.s3.amazonaws.com/ |
| DS-07 | ASOS/METAR Archive — شبكة `DZ__ASOS` | Iowa Environmental Mesonet, Iowa State University (مستضيفة لأرصاد METAR الرسمية) | أرصاد سطحية | 20–30 أوت 2026 | https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py |
| DS-08 | Open-Meteo Forecast/Analysis API | Open-Meteo (مبني على نماذج ECMWF/DWD/NCEP) | حقول ساعية شبكية | 21–29 أوت 2026 | https://api.open-meteo.com/v1/forecast |
| DS-09 | OpenStreetMap عبر Overpass API و Nominatim | مساهمو OpenStreetMap (ODbL) | حدود إدارية، طرق، خطوط كهرباء، استعمالات أرض | لقطة 29 أوت 2026 | https://overpass-api.de/api/interpreter — https://nominatim.openstreetmap.org |

**المشاهد الفضائية المحدّدة المستعملة في تحليل شدّة الاحتراق:**

- `S2C_31SGA_20260818_0_L2A` — 18 أوت 2026، 10:30 ت.ع.م — غطاء سحابي 0.0٪ — **قبل الحريق**
- `S2B_31SGA_20260826_0_L2A` — 26 أوت 2026، 10:40 ت.ع.م — غطاء سحابي 0.7٪ — **أثناء** (يغطي الشريط الغربي فقط: 5.22–5.53 شرقاً)
- `S2C_31SGA_20260828_0_L2A` — 28 أوت 2026، 10:30 ت.ع.م — غطاء سحابي 8.7٪ — **بعد الحريق**

### محطات الرصد الجوي المستعملة

| الرمز | المحطة | الإحداثيات | الارتفاع | المسافة عن مركز منطقة الدراسة |
|---|---|---|---|---|
| DAAV | جيجل / الطاهير — فرحات عباس | 36.795°N، 5.877°E | 11 م | 13.7 كم |
| DABC | قسنطينة — محمد بوضياف | 36.276°N، 6.620°E | 694 م | 74.2 كم |
| DAAE | بجاية — سومام | 36.712°N، 5.070°E | 2 م | 82.9 كم |
| DAAS | سطيف — عين أرنات | 36.183°N، 5.250°E | 1038 م | 89.8 كم |
| DABT | باتنة | 35.752°N، 6.309°E | 1052 م | 111.1 كم |

> محطة عنابة (DABB) طُلبت لكن الاتصال انقطع أثناء التحميل ولم تُدرَج في التحليل النهائي.

---

## المستوى الأول (تابع) — تصريحات ومصادر رسمية جزائرية

| المعرّف | الوصف | الجهة | تاريخ النشر | الرابط |
|---|---|---|---|---|
| OF-01 | وزير الداخلية والجماعات المحلية والنقل يعلن فتح «تحقيقات معمّقة لكشف أسباب الاندلاع المتزامن لعدد من الحرائق في مناطق مختلفة من البلاد» | نقلاً عن وزير الداخلية السعيد سعيود — النهار أونلاين | 27 أوت 2026، 11:11 | https://ennaharonline.com/وزير-الداخلية-فتح-تحقيقات-معمقة-لكشف-أ |
| OF-02 | حصيلة 193 حريقاً في 13 ولاية خلال 24 ساعة (147 مُخمَد، 46 متواصل)؛ الوزير يعزو اتساع رقعة الحرائق في جيجل وبجاية إلى «الظروف المناخية الصعبة» وشدّة الرياح وارتفاع الحرارة | أوراس، نقلاً عن وزير الداخلية | 27 أوت 2026 | https://www.awras.com/193-حريقًا-في-13-ولاية-سعيود-يكشف-سبب-اتساع/ |
| OF-03 | حصيلة الحماية المدنية: حرائق ببلديات أولاد يحيى خدروش، تاكسنة (2)، زيامة منصورية (2)، سيدي معروف، الشقفة؛ تفاصيل الوسائل الجوية المجنّدة (Mi-26، AT-802، BE-200) | المديرية العامة للحماية المدنية، عبر الجزائر اليوم | 26–27 أوت 2026 | https://www.aljazairalyoum.dz/الحماية-المدنية-تسجل-159-حريقا-للغابات-و/ |
| OF-04 | إعلان الحداد الوطني ثلاثة أيام وتنكيس الأعلام؛ 12 وفاة (5 جيجل، 4 بجاية، 3 تيزي وزو) و54 جريحاً | رئاسة الجمهورية / وزارة الداخلية، عبر اليوم السابع | 27 أوت 2026 | https://www.youm7.com/story/2026/8/27/7527942 |
| OF-05 | العدالة الجزائرية: الحبس المؤقت لـ7 متهمين بإضرام حرائق في ولايات قالمة وقسنطينة وتيبازة وجيجل والبويرة — **يتعلق بوقائع أواخر جويلية 2026 وليس بحرائق 24–29 أوت** | النيابة لدى القطب الجزائي الوطني لمكافحة الإرهاب والجريمة المنظمة، محكمة سيدي أمحمد — عبر الخبر | **26 جويلية 2026، 18:29** | https://www.elkhabar.com/societe/العدالة-تكشف-صور-7-متهمين-بإضرام-حرائق-الغابات-273369 |

---

## المستوى الثاني (Tier 2) — مؤسسات إعلامية كبرى

| المعرّف | العنوان | الناشر | تاريخ النشر | الرابط |
|---|---|---|---|---|
| MD-01 | 58 حريقاً في 16 ولاية بالجزائر وإجلاء عائلات مع اقتراب النيران من المناطق المأهولة (يذكر بلديتَي أولاد يحيى خدروش والشقفة) | يورونيوز عربية | 26 أوت 2026، 22:00 ت.غ+2 | https://arabic.euronews.com/2026/08/26/algeria-wildfires-jijel-evacuations-forest-fires-residents-firefighting |
| MD-02 | «بينهم 21 من عائلة واحدة» — 73 ضحية في بلدية الجمعة بني حبيبي؛ تشييع جماعي لـ39 ضحية | سكاي نيوز عربية | 28 أوت 2026، 19:46 | https://www.skynewsarabia.com/middle-east/1888775 |
| MD-03 | At least 73 killed in Algeria wildfires as Jijel province begins recovery | Hespress (English) | 29 أوت 2026 | https://en.hespress.com/144532-at-least-73-killed-in-algeria-wildfires-as-jijel-province-begins-recovery.html |
| MD-04 | Death toll from Algeria wildfires rises to 12, dozens injured | Africanews | 27 أوت 2026 | https://www.africanews.com/2026/08/27/death-toll-from-algeria-wildfires-rises-to-12-dozens-injured/ |
| MD-05 | Algeria's north-east scorched by deadly wildfires, national mourning declared | Euronews (video) | 28 أوت 2026 | https://www.euronews.com/video/2026/08/28/algerias-north-east-scorched-by-deadly-wildfires-national-mourning-declared |
| MD-06 | Wildfires kill 12 and leave 54 injured in Jijel, Béjaïa and Tizi Ouzou | The Watchers | 28 أوت 2026 | https://watchers.news/2026/08/28/wildfires-kill-12-and-leave-54-injured-in-jijel-bejaia-and-tizi-ouzou-algeria/ |
| MD-07 | حرائق الجزائر تحصد 73 قتيلاً ودفن جماعي لـ39 ضحية بولاية جيجل | أخبار الغد | 28–29 أوت 2026 | https://www.alghad.tv/اخبار-الغد/news/حرائق-الجزائر-تحصد-73-قتيلا-ودفن-جماعي-لـ39-ضحية-بولاية-جيجل |
| MD-08 | حرائق جيجل… استمرار عمليات الإخماد والبحث عن ضحايا (فرق مختصة بكلاب مدرّبة لتفتيش المنازل المحترقة) | العربي الجديد | 28–29 أوت 2026 | https://www.alaraby.co.uk/society/حرائق-جيجل-استمرار-عمليات-الإخماد-والبحث-عن-ضحايا |
| MD-09 | الجزائر تسيطر على معظم حرائق الشرق وتواصل مراقبة البؤر المطفأة | صوت بيروت | 29 أوت 2026 | https://www.sawtbeirut.com/world-news/الجزائر-تسيطر-على-معظم-حرائق-الشرق-وتو/ |
| MD-10 | حرائق الجزائر: تحقيقات أمنية وسط تساؤلات عن افتعال بعض البؤر | عربي21 | 27–28 أوت 2026 | https://arabi21.com/story/1785040 |

---

## مراجع منهجية

| المعرّف | المرجع |
|---|---|
| ME-01 | Schroeder, W., Oliva, P., Giglio, L., Csiszar, I.A. (2014). *The New VIIRS 375 m active fire detection data product: Algorithm description and initial assessment.* Remote Sensing of Environment 143, 85–96. — الأساس المنهجي لدقة VIIRS 375 م وحدود الكشف. |
| ME-02 | Giglio, L., Schroeder, W., Justice, C.O. (2016). *The Collection 6 MODIS active fire detection algorithm and fire products.* Remote Sensing of Environment 178, 31–41. |
| ME-03 | Key, C.H. & Benson, N.C. (2006). *Landscape Assessment (LA): Sampling and Analysis Methods.* USDA Forest Service RMRS-GTR-164-CD. — عتبات تصنيف dNBR المستعملة في هذا التقرير. |
| ME-04 | NASA FIRMS — *FAQ / Attribute definitions* (تعريف confidence، FRP، scan، track، daynight). https://www.earthdata.nasa.gov/data/tools/firms/faq |

---

## مصادر جرى البحث عنها ولم يتيسّر الوصول إليها

هذه ثغرات معلنة صراحةً، وهي تحدّ من قوة بعض الاستنتاجات:

| المصدر | الغرض المقصود | النتيجة |
|---|---|---|
| Blitzortung.org (أرشيف الصواعق) | تحديد مواقع الصواعق وأزمنتها قرب بؤر الاشتعال | `api.blitzortung.org` لم يستجب؛ الأرشيف التفصيلي غير متاح دون حساب |
| WWLLN (World Wide Lightning Location Network) | المصدر نفسه | يتطلّب اتفاقية بحثية ولا يُتاح علناً |
| Météorage | شبكة صواعق تجارية تغطي غرب المتوسط | خدمة تجارية مغلقة |
| EUMETSAT MTG-LI (Lightning Imager) | كشف البرق من المدار الثابت فوق إفريقيا | يتطلّب حساب EUMETSAT Data Store |
| Open-Meteo `lightning_potential` | مؤشر نموذجي للبرق | الحقل مُعرَّف لكن **لا يُخدَم لشمال إفريقيا**: 0 قيمة غير فارغة من أصل 168 ساعة |
| المديرية العامة للغابات (DGF) — بلاغات يومية | إحصاء رسمي للمساحات المحروقة لكل بلدية | لم يُعثر على بلاغ منشور يغطي هذه الفترة أثناء إعداد التقرير |
| EFFIS / GWIS (Copernicus) | مساحات محروقة رسمية أوروبية-متوسطية | لم يتيسّر الوصول إلى واجهة تحميل مفتوحة خلال فترة الإعداد؛ استُعيض عنها بحساب dNBR مباشرة من Sentinel-2 |
| تسجيلات كاميرات المراقبة، محاضر الشرطة والدرك، سجلات أعطال الشبكة الكهربائية (سونلغاز) | تحديد سبب الاشتعال | غير عامة بطبيعتها |

---

## ملاحظة على استعمال وسائل التواصل الاجتماعي

لم يُستند في هذا التقرير إلى أي منشور من وسائل التواصل الاجتماعي كدليل. المنشورات المتداولة خلال الحدث لم يتيسّر التحقق من موقعها أو زمن تصويرها بدقة كافية (تمييز زمن النشر عن زمن التسجيل، وتحديد معالم أرضية قابلة للمطابقة)، ولذلك استُبعدت. أي شهادات عيان وردت في المصادر الإعلامية أعلاه عُوملت بوصفها **روايات شهود منقولة صحفياً**، لا وقائع مثبتة.
