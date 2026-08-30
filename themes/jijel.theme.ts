/**
 * سمة "جيجل" — مشتقة من سمة Neutral.
 *
 * تحتفظ بلوحة Neutral الرمادية الدافئة وتفاصيل مكوّناتها، وتضيف:
 *   - لهجة لونية جمرية هادئة (accent) للروابط وحالة التنقل المختارة والخطوط الفاصلة.
 *   - خطّي Noto العربيين: Noto Kufi Arabic للعناوين وNoto Sans Arabic للنص،
 *     محمّلين عبر next/font ومربوطين هنا بمتغيّرات CSS.
 *
 * تُبنى عبر:  npx astryx theme build themes/jijel.theme.ts
 * وتنتج: themes/jijel.css و themes/jijel.js و themes/jijel.d.ts
 */

import {defineTheme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral';

const arabicFallback = '"Segoe UI", Tahoma, system-ui, sans-serif';

export const jijelTheme = defineTheme({
  name: 'jijel',
  extends: neutralTheme,

  // جمرة هادئة: طوب محروق في الوضع الفاتح، وهج فحمي أفتح في الداكن.
  // تمرير الزوج [فاتح، داكن] يجعل النظام يشتق --color-on-accent
  // و--color-*-accent مع ضمان التباين لكل وضع.
  color: {
    accent: ['#B23A16', '#E8875A'],
  },

  typography: {
    scale: {base: 16, ratio: 1.2},
    // العائلة اسم واحد فقط (متغيّر next/font)؛ البدائل في fallbacks.
    body: {
      family: 'var(--font-noto-sans-arabic)',
      fallbacks: arabicFallback,
    },
    heading: {
      family: 'var(--font-noto-kufi-arabic)',
      fallbacks: arabicFallback,
      weights: {1: 'bold', 2: 'bold', 3: 'bold', 4: 'bold'},
    },
    code: {
      family: 'ui-monospace',
      fallbacks: '"SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    },
  },

  // هدوء بصري: انتقالات لا تلفت النظر في واجهة تحقيق نصّية.
  motion: {fast: 140, medium: 320, slow: 640, ratio: 0.8},

  // لوحة "دفتر ميداني": ورق دافئ خفيف في الفاتح، فحم دافئ في الداكن.
  // نثبّت الأسطح والنص الأساسي بأنفسنا كي لا يميل المولّد إلى لون خوخي،
  // ونُبقي بقية عمل Neutral (الحالات، الألوان التصنيفية، المكوّنات).
  tokens: {
    '--color-background-body': ['#F3F1ED', '#181510'],
    '--color-background-surface': ['#FBFAF7', '#221E18'],
    '--color-background-card': ['#FBFAF7', '#1C1913'],
    '--color-background-popover': ['#FBFAF7', '#221E18'],
    '--color-background-muted': ['#ECE9E3', '#211D17'],
    '--color-text-primary': ['#211C17', '#F1EBE4'],
    '--color-text-secondary': ['#5B534B', '#A9A097'],
    '--color-border': ['#1c140b1f', '#FFFFFF24'],
    '--color-border-emphasized': ['#D3CCC1', '#4A443C'],
  },
});

export default jijelTheme;
