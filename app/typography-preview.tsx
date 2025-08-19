// app/typography-preview.tsx
import { Fonts } from '@/constants/Fonts';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

const pangram = 'Sphinx of black quartz, judge my vow. 1234567890';
const familyLabel =
  Platform.OS === 'ios' ? 'Avenir (iOS system)' : 'Lato (Android / Google Fonts)';

export default function TypographyPreview() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Typography Preview</Text>
      <Text style={styles.subheader}>Current family: {familyLabel}</Text>

      {/* Weight Rows */}
      <Section title="Weights">
        <FontRow label="Light" example={pangram} family={Fonts.avenir.light} />
        <FontRow label="Regular" example={pangram} family={Fonts.avenir.regular} />
        <FontRow label="Medium" example={pangram} family={Fonts.avenir.medium} />
        <FontRow label="Heavy" example={pangram} family={Fonts.avenir.heavy} />
        <FontRow label="Black" example={pangram} family={Fonts.avenir.black} />
      </Section>

      {/* Sizes */}
      <Section title="Sizes">
        <SizeRow sizeLabel="XS" size={Fonts.sizes.xs} family={Fonts.avenir.regular} />
        <SizeRow sizeLabel="SM" size={Fonts.sizes.sm} family={Fonts.avenir.regular} />
        <SizeRow sizeLabel="Base" size={Fonts.sizes.base} family={Fonts.avenir.regular} />
        <SizeRow sizeLabel="LG" size={Fonts.sizes.lg} family={Fonts.avenir.regular} />
        <SizeRow sizeLabel="XL" size={Fonts.sizes.xl} family={Fonts.avenir.regular} />
        <SizeRow sizeLabel="2XL" size={Fonts.sizes['2xl']} family={Fonts.avenir.regular} />
        <SizeRow sizeLabel="3XL" size={Fonts.sizes['3xl']} family={Fonts.avenir.heavy} />
        <SizeRow sizeLabel="4XL" size={Fonts.sizes['4xl']} family={Fonts.avenir.black} />
        <SizeRow sizeLabel="5XL" size={Fonts.sizes['5xl']} family={Fonts.avenir.black} />
      </Section>

      {/* Paragraph/Body checks */}
      <Section title="Body Paragraphs">
        <Text
          style={[
            styles.paragraph,
            {
              fontFamily: Fonts.avenir.regular,
              lineHeight: Fonts.sizes.base * Fonts.lineHeights.normal,
            },
          ]}
        >
          {pangram}
        </Text>
        <Text
          style={[
            styles.paragraph,
            {
              fontFamily: Fonts.avenir.light,
              lineHeight: Fonts.sizes.base * Fonts.lineHeights.relaxed,
              opacity: 0.9,
            },
          ]}
        >
          {pangram}
        </Text>
        <Text
          style={[
            styles.paragraph,
            {
              fontFamily: Fonts.avenir.medium,
              lineHeight: Fonts.sizes.base * Fonts.lineHeights.normal,
            },
          ]}
        >
          {pangram}
        </Text>
      </Section>

      {/* Buttons/Labels preview */}
      <Section title="UI Bits">
        <Text style={[styles.button, { fontFamily: Fonts.avenir.heavy }]}>
          PRIMARY BUTTON
        </Text>
        <Text style={[styles.caption, { fontFamily: Fonts.avenir.light }]}>
          Caption / helper text
        </Text>
        <Text style={[styles.label, { fontFamily: Fonts.avenir.medium }]}>
          Field label
        </Text>
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function FontRow({
  label,
  example,
  family,
}: {
  label: string;
  example: string;
  family: string | undefined;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLabel}>
        <Text style={styles.rowLabelText}>{label}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {family}
        </Text>
      </View>
      <Text style={[styles.rowExample, { fontFamily: family }]}>{example}</Text>
    </View>
  );
}

function SizeRow({
  sizeLabel,
  size,
  family,
}: {
  sizeLabel: string;
  size: number;
  family: string | undefined;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLabel}>
        <Text style={styles.rowLabelText}>{sizeLabel}</Text>
        <Text style={styles.meta}>{size}px</Text>
      </View>
      <Text style={[styles.rowExample, { fontSize: size, fontFamily: family }]}>
        Heading {sizeLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 60,
    gap: 12,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: Fonts.sizes['3xl'],
    fontFamily: Fonts.avenir.heavy,
    color: '#222',
  },
  subheader: {
    marginTop: 4,
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.avenir.regular,
    color: '#666',
  },
  section: {
    marginTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
    paddingTop: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontFamily: Fonts.avenir.medium,
    color: '#333',
    marginBottom: 8,
  },
  row: {
    gap: 6,
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  rowLabelText: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.avenir.medium,
    color: '#333',
  },
  meta: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.avenir.light,
    color: '#999',
  },
  rowExample: {
    fontSize: Fonts.sizes.base,
    color: '#222',
  },
  paragraph: {
    fontSize: Fonts.sizes.base,
    color: '#333',
  },
  button: {
    fontSize: Fonts.sizes.base,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#111',
  },
  caption: {
    fontSize: Fonts.sizes.sm,
    color: '#777',
  },
  label: {
    fontSize: Fonts.sizes.sm,
    color: '#222',
  },
});
