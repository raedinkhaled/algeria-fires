/*
 * رسوم علمية بسيطة تُبنى بـ SVG بدل النص وحده.
 * نص SVG لا يرث ضبط الاتجاه من `.ltr-embed`، لذا تُغلَّف كل قيمة رقمية
 * بمحرفَي عزل (U+2066…U+2069) لتبقى بترتيب LTR داخل السياق العربي RTL.
 */
const LRI = "⁦";
const PDI = "⁩";
const ltr = (value: string) => `${LRI}${value}${PDI}`;

export function ChekfaTexennaDiagram() {
  return (
    <div className="overflow-x-auto bg-card">
    <svg
      viewBox="0 0 720 300"
      role="img"
      aria-labelledby="chekfa-texenna-title chekfa-texenna-description"
      className="h-auto w-full min-w-[38rem] bg-card"
    >
      <title id="chekfa-texenna-title">استقلال حريقي الشقفة وتاكسنة</title>
      <desc id="chekfa-texenna-description">
        مخطط يبيّن أن اتجاه تاكسنة من الشقفة يعاكس اتجاه دفع الريح بفارق 132
        درجة، مع مسافة 19.52 كيلومتراً وفجوة غير محترقة طولها 22.78 كيلومتراً.
      </desc>

      <g fill="none" stroke="var(--border)" strokeWidth="1">
        <path d="M70 70H650M70 150H650M70 230H650" />
        <path d="M150 38V262M360 38V262M570 38V262" strokeDasharray="3 5" />
      </g>

      <g fontFamily="var(--font-sans)" fill="var(--foreground)">
        <circle cx="560" cy="155" r="11" fill="var(--foreground)" />
        <text x="560" y="130" textAnchor="middle" fontSize="15" fontWeight="600">
          الشقفة
        </text>
        <text
          x="560"
          y="190"
          textAnchor="middle"
          fontSize="11"
          fill="var(--muted-foreground)"
        >
          {ltr("25 أوت")}
        </text>

        <circle cx="165" cy="196" r="11" fill="var(--support)" />
        <text x="165" y="171" textAnchor="middle" fontSize="15" fontWeight="600">
          تاكسنة
        </text>
        <text
          x="165"
          y="231"
          textAnchor="middle"
          fontSize="11"
          fill="var(--muted-foreground)"
        >
          {ltr("26 أوت")}
        </text>
      </g>

      <g fill="none" strokeLinecap="square">
        <path d="M535 160L191 193" stroke="var(--foreground)" strokeWidth="2" />
        <path d="M205 184L190 193L207 199" stroke="var(--foreground)" strokeWidth="2" />
        <path
          d="M505 215L610 105"
          stroke="var(--info)"
          strokeWidth="4"
          strokeDasharray="9 6"
        />
        <path d="M598 109L610 105L606 118" stroke="var(--info)" strokeWidth="3" />
      </g>

      <g fontFamily="var(--font-mono)" fontSize="12" fill="var(--foreground)">
        <rect x="300" y="151" width="146" height="31" fill="var(--card)" stroke="var(--border)" />
        <text x="373" y="171" textAnchor="middle">{ltr("19.52 km · 262°")}</text>
      </g>

      <g fontFamily="var(--font-sans)" fontSize="12" fill="var(--info)">
        <rect x="470" y="222" width="150" height="31" fill="var(--card)" stroke="var(--border)" />
        <text x="545" y="242" textAnchor="middle">
          اتجاه الريح {ltr("33°-35°")}
        </text>
      </g>

      <g fontFamily="var(--font-sans)" fontSize="12" fill="var(--muted-foreground)">
        <text x="360" y="276" textAnchor="middle">
          فجوة غير محترقة على المسار {ltr("22.78 كم")}
        </text>
        <text x="360" y="25" textAnchor="middle">
          فرق الاتجاه بين المسار والريح {ltr("132°")}
        </text>
      </g>
    </svg>
    </div>
  );
}
