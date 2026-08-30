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
- اكتب رسائل الالتزام بصياغة قصيرة وطبيعية كما يكتبها مطوّر، مع وصف مباشر للتغيير ومن دون الإشارة إلى طريقة إنجازه.
- استخدم الأرقام الغربية `0-9` في الواجهة العربية، مع إبقاء الإحداثيات والمعرّفات والاختصارات العلمية باتجاه LTR.
- استخدم Astryx وحده لنظام الواجهة والمكوّنات؛ لا تضف shadcn ولا تستورد أي مكوّن منه، واتبع كتلة تعليمات Astryx في نهاية هذا الملف.
- يجب أن يدعم كل سطح ومكوّن الوضعين الفاتح والداكن من خلال سمة Astryx، من دون ألوان ثابتة داخل الصفحات.
- تجنّب الواجهة النمطية المبنية من بطاقات متشابهة؛ أعطِ السرد والبيانات تسلسلاً بصرياً واضحاً واستخدم أضعف حاوية مناسبة للمحتوى.

## مراحل التنفيذ

- [x] **1. خطة العمل ونظافة المستودع** - إبقاء هذا الملف مرجعاً للاستئناف، واستبعاد بيانات الأدوات المحلية والبيئات والمواد الخام الثقيلة. الالتزام: `chore: establish project roadmap and repository hygiene`
- [x] **2. إصلاح أصول التحقيق العربية** - تثبيت بيئة Python، اعتماد خطوط عربية قابلة للنقل، إصلاح تشكيل واتجاه النص، وإعادة توليد الخرائط والرسوم والتقرير مع فحص بصري. الالتزام: `fix: restore Arabic rendering in investigation assets`
- [x] **3. نظام التصميم والهيكل العربي** - اعتماد Astryx، وضبط RTL والخطوط والوضعين الفاتح والداكن والتنقل المتجاوب والمكونات الأساسية. الالتزام: `feat: build the Arabic site shell`
- [ ] **4. خط إعداد المحتوى والبيانات** - التحقق من CSV/JSON/Markdown، وتوليد GeoJSON وبيان التنزيلات والأصول المحسنة وملفات MapLibre. الالتزام: `feat: generate validated site data`
- [ ] **5. الملخص والتقرير الكامل** - بناء الصفحة الرئيسية وصفحتي التحقيق والتقرير، وربط الادعاءات بدرجات الثقة والمصادر. الالتزام: `feat: publish the investigation story`
- [ ] **6. الخريطة التفاعلية** - إضافة طبقات الرصد والمنشأ والبلديات وشدة الاحتراق، والمرشح الزمني، ودعم RTL والبديل الثابت. الالتزام: `feat: build the interactive fire map`
- [ ] **7. الرسوم ومستكشف البيانات** - إضافة الرسوم التفاعلية والجداول المصفاة والتنزيلات الفردية والمجمعة. الالتزام: `feat: build the data explorer`
- [ ] **8. المنهجية وسجل المصادر** - نشر المنهجية وكل سجلات DS/OF/MD/ME وحالات المصادر غير المتاحة وروابطها. الالتزام: `feat: publish methodology and sources`
- [ ] **9. الجودة والنشر** - إضافة metadata وsitemap وrobots والبيانات المنظمة والاختبارات وفحص البناء على Vercel. الالتزام: `chore: ready the site for release`

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

## حالة الاستئناف الحالية

- المراحل 1 و2 و3 مكتملة. المرحلة 3 في هذا الالتزام: هيكل الموقع العربي.
- المرحلة التالية هي **4 — خط إعداد المحتوى والبيانات**. ابدأ بقراءة هذه الخطة و`git status` وآخر الالتزامات.

### ما استقر في المرحلة 3 (لا تعِد بناءه)

- **السمة**: `themes/jijel.theme.ts` مصدرٌ يمتد `neutralTheme` بلهجة جمرية (accent) وخطّي Noto وأسطح "ورق دافئ/فحم". أعِد البناء بعد أي تعديل: `npx astryx theme build themes/jijel.theme.ts` (ينتج `jijel.css/js/d.ts` المُلتزَمة). لا تحرّر المخرجات يدوياً.
- **الطبقات**: `app/layers.css` يعلن ترتيب طبقات CSS ويُستورد أولاً في `app/globals.css`، ثم Tailwind (theme/preflight/utilities) + `reset.css` + `astryx.css` + `themes/jijel.css` + جسر `tailwind-theme.css`. الخلفية/النص/الخط مطليّة على `<html>/<body>` لأن `<Theme>` يستخدم `display:contents`.
- **المزودات**: `components/providers.tsx` = `InternationalizationProvider(ar-DZ, dir=rtl, overrides=lib/astryx-ar.ts)` ← `Theme(jijelTheme, mode)` ← `LinkProvider(next/link)` ← سياق وضع اللون. حالة وضع اللون في `lib/color-mode-store.ts` عبر `useSyncExternalStore` (لا `useEffect`)؛ سكربت مضمّن في `<body>` يضبط `data-theme` قبل الرسم. `<html>` ثابت: `lang="ar-DZ" dir="rtl" data-astryx-theme="jijel"`.
- **الإطار**: `components/site-chrome.tsx` = `AppShell(height=auto, variant=section, contentPadding=0)` + `TopNav` (شعار `site-mark.tsx` SVG + عناصر من `lib/site-navigation.ts` + `theme-toggle.tsx`). التذييل `components/site-footer.tsx` شقيقٌ للـ`AppShell` داخل `VStack minHeight=100dvh` ليثبت أسفل الصفحة. درج الهاتف يأتي تلقائياً من `startContent` في `TopNav`.
- **الصفحات**: `app/page.tsx` هي الملخّص (ترويسة + سجل أرقام + فهرس مسارات) — بلا شبكة بطاقات. الأقسام الستة الأخرى تستخدم `components/placeholder-page.tsx` بانتظار مراحلها.
- **قواعد الأسلوب**: مكوّنات Astryx أولاً؛ لا `<div>` ولا `style={{}}` ولا StyleX مؤلَّف يدوياً (لا مُحوِّل SWC). المخرج الوحيد للتخصيص: أدوات Tailwind المدعومة بالوسوم (`bg-muted`، `border-accent`، `ps-6`…). صنف `.ltr-embed` للإحداثيات والمعرّفات.
- **الحزم**: حُذف shadcn و`@base-ui/react` و`recharts` و`class-variance-authority` و`clsx` و`tailwind-merge` و`tw-animate-css`. `@astryxdesign/cli` و`theme-neutral` صارا devDependencies. أعِد `recharts` في المرحلة 7.
- **الفحوص المارّة**: `tsc --noEmit` و`eslint` و`next build` (8 مسارات ثابتة). عاينت 360 و1440 في الوضعين وتبديل السمة. **لم يُعاين بعد**: 768 بكسل، وفتح درج الهاتف فعلياً — تحقق سريعاً في المرحلة 4.
- خادم `next dev` خارجي يعمل مسبقاً على المنفذ 3000 (PID يتغيّر)؛ لا تشغّل ثانياً، استخدم القائم.

### للمرحلة 4

- بيانات المصدر في `Fires/` (خط Python). انشر المعالَج فقط تحت `public/generated/` و`public/maplibre/` (كلاهما في `.gitignore` حالياً — راجع ما يجب نشره فعلاً).
- يجب أن يوقف السكربت البناء إذا اختلفت القيم المرجعية: 9,100 رصد، 4,451 خلية، 12 منشأً، 17 ندبة (هي مثبّتة نصّياً في `app/page.tsx`).
- عند نجاح المرحلة، غيّر مربعها إلى `[x]`، راجع الملفات، والتزم `feat: generate validated site data`.

<!-- ASTRYX:START -->
Astryx v0.5.1 · 163 components
CLI: run every command as `npx astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in your app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — discover, don't guess. Before writing UI:
1. `astryx build "<idea>"` — START HERE: returns a kit (closest [page] + [block]s + [component]s). No args = full playbook.
2. `astryx template <name> [--skeleton]` — scaffold the [page]/[block]s it named, or study their layout. Templates are reference code.
3. `astryx component <Name>` — props + examples for every component you use.

RULES:
- No <div> — components do all layout/spacing, page frame included.
- Frame first: read `astryx docs layout` before writing any page or screen — page frame, region widths, breakpoint behavior.
- Dense data = rows (Table, List/Item), never Card-wrapped list items; Card is for standalone widgets. Status = StatusDot/Token; Badge = counts only.
- Custom styling: component props first; else Tailwind utilities backed by tokens (bg-surface, text-primary, rounded-lg) via tailwind-theme.css. No raw hex/px.
- Tokens for every value (`astryx docs tokens`). Brand/accent belongs in the theme (`astryx theme list` / `theme add <slug>`, or `astryx theme template` for a custom one) — never override --color-* in :root.
- SELF-CHECK before you finish: re-read the file and replace any style={{…}}, raw <div>/<span> layout, imported .css/@apply, or hardcoded/arbitrary value (e.g. bg-[#fff], p-[13px]) with the component or a token-backed utility. If unsure a component/prop exists, run `astryx component <Name>` / `astryx search "<thing>"`; don't hand-roll CSS.

MORE CLI:
  search "<query>"   find any component / hook / doc / template / block
  component --list   163 components by category
  template --list    page + block recipes
  docs <topic>       browser-support, cli-integrations, color, elevation, getting-started, icons, illustrations, internationalization, layout, migration, motion, principles, shape, spacing, styling-libraries, styling, theme, tokens, typography, working-with-ai
  swizzle <Name>     eject component source for deep customization
  upgrade --apply    run after any @astryxdesign/core bump
<!-- ASTRYX:END -->
