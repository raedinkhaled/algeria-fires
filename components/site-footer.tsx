import { Section } from "@astryxdesign/core/Section";
import { VStack, HStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Link } from "@astryxdesign/core/Link";
import { Divider } from "@astryxdesign/core/Divider";

const colophonLinks = [
  { href: "/methodology", label: "المنهجية" },
  { href: "/sources", label: "سجل المصادر" },
  { href: "/data", label: "تنزيل البيانات" },
];

export function SiteFooter() {
  return (
    <Section
      role="contentinfo"
      variant="muted"
      padding={0}
      dividers={["top"]}
      width="100%"
    >
      <VStack gap={5} padding={6} maxWidth={1180}>
        <VStack gap={2} maxWidth={640}>
          <Text weight="semibold">حرائق جيجل — إعادة بناء بالبيانات المفتوحة</Text>
          <Text type="supporting">
            تحليل توثيقي مستقل يعتمد بيانات مفتوحة. لا يحدّد مسؤولية جنائية ولا
            يثبت إضراماً متعمداً، ولا يغني عن التحقيق الميداني الرسمي.
          </Text>
        </VStack>

        <HStack gap={5} wrap="wrap">
          {colophonLinks.map((link) => (
            <Link key={link.href} href={link.href} color="secondary">
              {link.label}
            </Link>
          ))}
        </HStack>

        <Divider />

        <HStack gap={3} wrap="wrap" vAlign="center">
          <Text type="supporting">
            الأرقام بالصيغة الغربية 0–9 لتسهيل القراءة والنسخ والمراجعة.
          </Text>
          <Text type="supporting" className="ltr-embed">
            ولاية جيجل · 36.72°N · 5.95°E
          </Text>
        </HStack>
      </VStack>
    </Section>
  );
}
