import { Section } from "@astryxdesign/core/Section";
import { VStack } from "@astryxdesign/core/Stack";
import { Heading, Text } from "@astryxdesign/core/Text";
import { Divider } from "@astryxdesign/core/Divider";

/**
 * فاتحة قسم في الملف: تسمية علوية، عنوان، فقرة تمهيدية، ثم ملاحظة عن مصدر
 * المحتوى. تُملأ الأقسام لاحقاً من ملفات التحقيق المتحقّقة.
 */
export function PlaceholderPage({
  eyebrow,
  title,
  description,
  note = "يُبنى هذا القسم من ملفات التحقيق المتحقّقة، ويعرض المصدر ودرجة الثقة والقيود بجانب كل نتيجة حسّاسة.",
}: {
  eyebrow: string;
  title: string;
  description: string;
  note?: string;
}) {
  return (
    <Section padding={0} width="100%">
      <VStack gap={8} padding={6} paddingBlockStart={10} maxWidth={880}>
        <VStack gap={4} className="border-s-2 border-accent ps-6">
          <Text type="supporting" color="accent" weight="medium">
            {eyebrow}
          </Text>
          <Heading level={1}>{title}</Heading>
          <Text type="large" color="secondary">
            {description}
          </Text>
        </VStack>

        <Divider />

        <VStack maxWidth={620}>
          <Text type="supporting">{note}</Text>
        </VStack>
      </VStack>
    </Section>
  );
}
