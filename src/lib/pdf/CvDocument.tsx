import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { CvData } from '@/lib/cv-schema';
import { AUTHOR_EMAIL, SITE_NAME, SITE_URL, SOCIAL_LINKS } from '@/lib/seo';

/**
 * El CV en PDF, generado desde los mismos datos que el resto del sitio.
 *
 * Deliberadamente sobrio, y no un intento de imitar la web. Un CV se lee en
 * treinta segundos, a veces impreso y a menudo después de pasar por un parser
 * que descarta el color: lo que ayuda es la jerarquía tipográfica, no el
 * diseño. Además evita el problema real de tener dos maquetas del mismo
 * contenido — al no perseguirse, no pueden divergir.
 *
 * Sin fuentes externas: las tres estándar de PDF no se descargan, no se pueden
 * romper en un build sin red y pesan cero.
 */

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    lineHeight: 1.45,
    color: '#1a1a1a'
  },
  name: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  headline: { fontSize: 11, color: '#444', marginBottom: 6 },
  contact: { fontSize: 8.5, color: '#555' },
  // La regla superior separa el encabezado del cuerpo sin gastar una línea.
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.2,
    marginTop: 16,
    marginBottom: 6,
    paddingTop: 6,
    borderTopWidth: 0.75,
    borderTopColor: '#bbb',
    textTransform: 'uppercase'
  },
  summary: { color: '#333' },
  // `wrap={false}` en cada entrada evita que un puesto quede partido entre dos
  // páginas, que es lo que más ensucia un CV impreso.
  entry: { marginBottom: 9 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  role: { fontFamily: 'Helvetica-Bold', fontSize: 10 },
  dates: { fontSize: 8.5, color: '#666' },
  org: { fontSize: 9, color: '#444', marginBottom: 2 },
  body: { color: '#333' },
  techs: { fontSize: 8.5, color: '#666', marginTop: 2 },
  skillRow: { flexDirection: 'row', marginBottom: 3 },
  skillLabel: { fontFamily: 'Helvetica-Bold', width: 96 },
  skillList: { flex: 1, color: '#333' },
  certRow: { marginBottom: 2.5 },
  link: { color: '#555' },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    fontSize: 7.5,
    color: '#888',
    textAlign: 'center'
  }
});

type Labels = {
  summary: string;
  experience: string;
  education: string;
  skills: string;
  certifications: string;
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const CvDocument = ({ cv, locale, labels }: { cv: CvData; locale: string; labels: Labels }) => (
  <Document
    // Los metadatos del documento: Google Docs no los escribía y muchos ATS y
    // gestores de archivos los leen antes que el contenido.
    title={`${SITE_NAME} — ${cv.jobTitle}`}
    author={SITE_NAME}
    subject={cv.jobTitle}
    keywords={cv.technicalSkills.join(', ')}
    creator={SITE_URL}
    language={locale}
  >
    <Page size="A4" style={styles.page}>
      <View>
        <Text style={styles.name}>{SITE_NAME}</Text>
        <Text style={styles.headline}>{cv.jobTitle}</Text>
        <Text style={styles.contact}>
          {AUTHOR_EMAIL} · {SITE_URL.replace('https://', '')} · {SOCIAL_LINKS.map(l => l.replace(/^https:\/\/(www\.)?/, '')).join(' · ')}
        </Text>
      </View>

      <Section title={labels.summary}>
        <Text style={styles.summary}>{cv.summary}</Text>
      </Section>

      <Section title={labels.skills}>
        {cv.skillCategories.map(category => (
          <View key={category.id} style={styles.skillRow}>
            <Text style={styles.skillLabel}>{category.label}</Text>
            <Text style={styles.skillList}>{category.skills.map(s => s.name).join(', ')}</Text>
          </View>
        ))}
      </Section>

      <Section title={labels.experience}>
        {cv.experiences.map(job => (
          <View key={job.id} style={styles.entry} wrap={false}>
            <View style={styles.entryHeader}>
              <Text style={styles.role}>{job.role}</Text>
              <Text style={styles.dates}>{job.dateLabel}</Text>
            </View>
            <Text style={styles.org}>
              {job.company}
              {job.location ? ` · ${job.location}` : ''}
            </Text>
            <Text style={styles.body}>{job.description}</Text>
            {job.techs.length > 0 && <Text style={styles.techs}>{job.techs.join(' · ')}</Text>}
          </View>
        ))}
      </Section>

      <Section title={labels.education}>
        {cv.education.map(item => (
          <View key={item.id} style={styles.entry} wrap={false}>
            <View style={styles.entryHeader}>
              <Text style={styles.role}>{item.degree}</Text>
              <Text style={styles.dates}>{item.dateLabel}</Text>
            </View>
            <Text style={styles.org}>
              {item.institution}
              {item.location ? ` · ${item.location}` : ''}
            </Text>
          </View>
        ))}
      </Section>

      <Section title={labels.certifications}>
        {cv.certifications.map(cert => (
          <View key={cert.id} style={styles.certRow}>
            <Text>
              {cert.name} — {cert.issuer}
              {cert.year ? ` (${cert.year})` : ''}
            </Text>
          </View>
        ))}
      </Section>

      <Text
        style={styles.footer}
        render={({ pageNumber, totalPages }) => `${SITE_URL} — ${pageNumber}/${totalPages}`}
        fixed
      />
    </Page>
  </Document>
);

export default CvDocument;
