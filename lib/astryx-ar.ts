/**
 * تعريب سلاسل Astryx الظاهرة على السطح.
 *
 * Astryx يشحن الإنجليزية فقط حتى الآن، والمفاتيح غير المعرّبة ترجع إليها.
 * نغطّي هنا ما يظهر فعلاً للمستخدم (تخطّي المحتوى، قائمة الهاتف، الروابط
 * الخارجية، إغلاق الطبقات)؛ يوسَّع السجل مع كل مكوّن جديد يعرض نصاً.
 */
export const astryxArabicOverrides: Record<string, string> = {
  "@astryx.appShell.skipToContent": "تخطَّ إلى المحتوى",
  "@astryx.appShell.mobileNavigation": "التنقل على الهاتف",
  "@astryx.mobileNav.navigation": "التنقل",
  "@astryx.mobileNav.toggle.open": "افتح قائمة التنقل",
  "@astryx.mobileNav.closeNavigation": "أغلق قائمة التنقل",
  "@astryx.topNav.landmarkLabel": "التنقل الرئيسي",
  "@astryx.topNav.heading.openMenu": "افتح القائمة",
  "@astryx.topNav.heading.dialogLabel": "قائمة التنقل",
  "@astryx.sideNav.label": "التنقل الجانبي",
  "@astryx.link.newTab": "(يفتح في تبويب جديد)",
  "@astryx.dialog.close": "إغلاق",
  "@astryx.popover.close": "إغلاق النافذة",
  "@astryx.lightbox.close": "إغلاق",
  "@astryx.dropdownMenu.label": "قائمة",
  "@astryx.moreMenu.label": "خيارات إضافية",
};
