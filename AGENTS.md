<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# منصة حرائق جيجل - خطة التنفيذ المرحلية

## قواعد العمل

- ابدأ كل جلسة بقراءة هذه الخطة وفحص `git status` وآخر الالتزامات.
- نفّذ أول مرحلة غير مكتملة فقط، إلا إذا طلب المالك متابعة أكثر من مرحلة.
- لا تغيّر البيانات الخام أو النتائج العلمية إلا مع توثيق سبب التغيير والتحقق منه.
- شغّل فحوص المرحلة، ثم غيّر مربعها إلى `[x]` في الالتزام نفسه.
- راجع الملفات المرحلية قبل كل التزام، ولا تضمّن إعدادات محلية أو أسراراً أو ملفات مؤقتة.
- استخدم رسائل الالتزام المحددة أدناه من دون إشارات إلى أدوات إنشاء الكود.

## مراحل التنفيذ

- [x] **1. خطة العمل ونظافة المستودع** - إبقاء هذا الملف مرجعاً للاستئناف، واستبعاد بيانات الأدوات المحلية والبيئات والمواد الخام الثقيلة. الالتزام: `chore: establish project roadmap and repository hygiene`
- [ ] **2. إصلاح أصول التحقيق العربية** - تثبيت بيئة Python، اعتماد خطوط عربية قابلة للنقل، إصلاح تشكيل واتجاه النص، وإعادة توليد الخرائط والرسوم والتقرير مع فحص بصري. الالتزام: `fix: restore Arabic rendering in investigation assets`
- [ ] **3. نظام التصميم والهيكل العربي** - تهيئة shadcn، وضبط RTL والخطوط والسمات والتنقل المتجاوب والمكونات الأساسية. الالتزام: `feat: establish the Arabic interface foundation`
- [ ] **4. خط إعداد المحتوى والبيانات** - التحقق من CSV/JSON/Markdown، وتوليد GeoJSON وبيان التنزيلات والأصول المحسنة وملفات MapLibre. الالتزام: `feat: prepare validated investigation data`
- [ ] **5. الملخص والتقرير الكامل** - بناء الصفحة الرئيسية وصفحتي التحقيق والتقرير، وربط الادعاءات بدرجات الثقة والمصادر. الالتزام: `feat: publish the investigation narrative`
- [ ] **6. الخريطة التفاعلية** - إضافة طبقات الرصد والمنشأ والبلديات وشدة الاحتراق، والمرشح الزمني، ودعم RTL والبديل الثابت. الالتزام: `feat: add the interactive fire map`
- [ ] **7. الرسوم ومستكشف البيانات** - إضافة الرسوم التفاعلية والجداول المصفاة والتنزيلات الفردية والمجمعة. الالتزام: `feat: add the investigation data explorer`
- [ ] **8. المنهجية وسجل المصادر** - نشر المنهجية وكل سجلات DS/OF/MD/ME وحالات المصادر غير المتاحة وروابطها. الالتزام: `feat: document methodology and sources`
- [ ] **9. الجودة والنشر** - إضافة metadata وsitemap وrobots والبيانات المنظمة والاختبارات وفحص البناء على Vercel. الالتزام: `chore: prepare the platform for public release`

## بنية المنتج المقبولة

- `/` ملخص تنفيذي، أرقام رئيسية، تسلسل زمني، نتائج وحدود، ومقارنة Sentinel-2.
- `/investigation` شرح مبسط للمنشأ والانتشار والطقس والتضاريس والفرضيات.
- `/map` خريطة تفاعلية للرصد والمنشأ والبلديات وشدة الاحتراق من دون اختراع هندسات غير متاحة.
- `/data` رسوم وجداول وتنزيلات البيانات المعالجة.
- `/report` نسخة ويب كاملة من التقرير العربي.
- `/methodology` سلسلة المعالجة والمفاهيم والقيود ومستويات الثقة.
- `/sources` سجل المصادر الكامل القابل للبحث مع روابط خارجية آمنة.

## ثوابت المحتوى والاختبار

- المنصة عربية وRTL؛ تعرض الإحداثيات ومعرّفات المصادر والاختصارات العلمية باتجاه LTR.
- التحليل مستقل وليس تحقيقاً رسمياً، ولا يثبت مسؤولية جنائية أو إضراماً متعمداً.
- لا تنشر البيانات الخام الثقيلة؛ انشر البيانات المعالجة والأصول المحسنة والتقرير المضغوط.
- يجب أن يوقف إعداد البيانات البناء إذا اختلفت القيم المرجعية: 9,100 رصد، 4,451 خلية، 12 منشأً مرشحاً، و17 ندبة.
- اختبر أحجام 360 و768 و1440 بكسل، لوحة المفاتيح والتباين وتقليل الحركة، وحالة تعطل WebGL أو مزود الخريطة.
- لا تُعدّ المرحلة مكتملة قبل نجاح lint وtypecheck والاختبارات الملائمة و`next build`.
