import { Section } from "@astryxdesign/core/Section";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Heading, Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { Divider } from "@astryxdesign/core/Divider";
import { List, ListItem } from "@astryxdesign/core/List";

import { siteSections } from "@/lib/site-navigation";

const keyFigures = [
  {
    value: "9,100",
    metric: "رصد حراري",
    note: "نقاط VIIRS وMODIS ضمن نافذة الحدث",
  },
  {
    value: "4,451",
    metric: "خلية شبكة محترقة",
    note: "خلايا 375 م تجاوز فيها مؤشر dNBR العتبة",
  },
  {
    value: "12",
    metric: "منشأ حريق مرشّح",
    note: "مواقع بدء مستنتَجة من أوائل الرصد الحراري",
  },
  {
    value: "17",
    metric: "ندبة حريق مؤكدة",
    note: "محيطات مرسومة يدوياً من صور Sentinel-2 بعد الحدث",
  },
];

export default function Home() {
  return (
    <Section padding={0} width="100%">
      <VStack
        gap={10}
        padding={6}
        paddingBlockStart={10}
        paddingBlockEnd={10}
        maxWidth={1180}
      >
        <VStack gap={5} maxWidth={880}>
          <HStack gap={3} wrap="wrap" vAlign="center">
            <Text type="supporting" color="accent" weight="medium">
              تحقيق مستقل قائم على بيانات مفتوحة
            </Text>
            <Text type="supporting">أوت 2026</Text>
            <Text type="supporting" className="ltr-embed">
              ولاية جيجل · 36.72°N · 5.95°E
            </Text>
          </HStack>

          <Heading level={1}>
            حرائق جيجل: إعادة بناء التسلسل من الأقمار الصناعية والطقس
          </Heading>

          <Text type="large" color="secondary">
            منصة عربية تشرح ما حدث في حرائق أوت 2026 بولاية جيجل، وكيف تقاطعت
            إشارات النشاط الحراري وحالة الطقس والتضاريس للوصول إلى نتائج قابلة
            للمراجعة، مع فصل واضح بين ما تثبته البيانات وما يبقى فرضية.
          </Text>

          <HStack gap={3} wrap="wrap">
            <Button
              label="ابدأ بالتحقيق"
              variant="primary"
              size="lg"
              href="/investigation"
            />
            <Button
              label="اقرأ المنهجية"
              variant="secondary"
              size="lg"
              href="/methodology"
            />
          </HStack>
        </VStack>

        <VStack gap={4}>
          <Heading level={2}>أرقام أساسية</Heading>
          <Divider variant="strong" />
          <List hasDividers>
            {keyFigures.map((figure) => (
              <ListItem
                key={figure.metric}
                startContent={
                  <Text
                    size="2xl"
                    weight="bold"
                    hasTabularNumbers
                    className="ltr-embed"
                  >
                    {figure.value}
                  </Text>
                }
                label={figure.metric}
                description={<Text type="supporting">{figure.note}</Text>}
              />
            ))}
          </List>
          <Text type="supporting">
            قيم مرجعية ثابتة؛ يتوقّف بناء بيانات الموقع إذا اختلفت عنها.
          </Text>
        </VStack>

        <VStack gap={4}>
          <VStack gap={2} maxWidth={680}>
            <Heading level={2}>مسارات القراءة</Heading>
            <Text color="secondary">
              ابدأ بالسرد ثم راجع الأدلة بنفسك؛ كل قسم يقف وحده ويصلح مدخلاً.
            </Text>
          </VStack>
          <List hasDividers>
            {siteSections.map((section, index) => (
              <ListItem
                key={section.href}
                href={section.href}
                startContent={
                  <Text type="code" color="secondary" className="ltr-embed">
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                }
                label={section.title}
                description={<Text type="supporting">{section.summary}</Text>}
              />
            ))}
          </List>
        </VStack>

        <VStack gap={3} maxWidth={720} className="border-s-2 border-accent ps-6">
          <Heading level={2}>نطاق هذا العمل</Heading>
          <Text color="secondary">
            تحليل توثيقي مستقل يعتمد بيانات مفتوحة ومتاحة للتحقق. لا يحدّد مسؤولية
            جنائية ولا يثبت إضراماً متعمداً، ولا يمثّل تحقيقاً رسمياً أو بديلاً
            عنه.
          </Text>
        </VStack>
      </VStack>
    </Section>
  );
}
