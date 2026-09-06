import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { CvData } from '@/lib/cv-schema';
import { AUTHOR_EMAIL, SITE_NAME, SITE_URL, SOCIAL_LINKS } from '@/lib/seo';

/**
 * El CV en PDF, generado desde los mismos datos que el resto del sitio.
 *
 * Sobrio a propósito, y no un intento de imitar la web: un CV se lee en treinta
 * segundos, a veces impreso y a menudo después de pasar por un parser que
 * descarta el color. Lo que ayuda es la jerarquía tipográfica.
 *
 * El ámbar de la marca aparece sólo en los títulos de sección y en la regla del
 * encabezado. Es suficiente para que el ojo salte entre bloques sin leer, y
 * poco como para que el documento siga siendo legible en blanco y negro.
 *
 * Sin fuentes externas: las estándar de PDF no se descargan, no rompen un build
 * sin red y pesan cero.
 */

/**
 * La foto, leída del disco y no por URL.
 *
 * react-pdf no entiende WebP —el formato del sitio— así que se sirve un JPEG
 * generado aparte. Por ruta local y no por HTTP para que el render no dependa
 * de que el propio servidor esté respondiendo mientras se genera el documento.
 */
const PHOTO = {
  // Buffer y no ruta: pasarle un string, react-pdf lo resolvía en silencio a
  // nada y el documento salía sin foto, sin error en ningún lado.
  data: readFileSync(path.join(process.cwd(), 'public', 'profile-cv.jpg')),
  format: 'jpg' as const
};

const ACCENT = '#B45309'; // Ámbar de la marca, oscurecido para contraste sobre papel.
const INK = '#18181b';
const MUTED = '#52525b';
const FAINT = '#a1a1aa';

const styles = StyleSheet.create({
  page: {
    paddingTop: 38,
    paddingBottom: 44,
    paddingHorizontal: 46,
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.5,
    color: INK
  },

  // `lineHeight` explícito y sin letterSpacing: react-pdf calculaba mal el alto
  // de la línea y el titular terminaba dibujado encima del nombre.
  // El encabezado pasa a dos columnas para dejar lugar a la foto.
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  headerText: { flex: 1, paddingRight: 14 },
  photo: { width: 74, height: 74, borderRadius: 37, objectFit: 'cover' },
  name: { fontSize: 22, lineHeight: 1.3, fontFamily: 'Helvetica-Bold' },
  headline: { fontSize: 10.5, lineHeight: 1.3, color: ACCENT, fontFamily: 'Helvetica-Bold' },
  contact: { fontSize: 8, color: MUTED, marginTop: 5 },
  headerRule: { borderBottomWidth: 2, borderBottomColor: ACCENT, marginTop: 10, marginBottom: 4 },

  // La separación entre secciones se reparte entre el margen del título y el
  // del último elemento de la sección anterior. Igualar los de abajo —entrada y
  // celda de skills— es lo que hace que todas las secciones respiren igual: sin
  // eso el hueco variaba entre 27 y 38 puntos según qué las precediera.
  sectionTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    letterSpacing: 1.4,
    marginTop: 15,
    marginBottom: 6
  },

  // Mismo margen inferior que una entrada, para que todas las secciones
  // arranquen a la misma distancia de lo que las precede.
  summary: { color: MUTED, marginBottom: 7 },

  // `wrap={false}` en cada entrada evita que un puesto quede partido entre dos
  // páginas, que es lo que más ensucia un CV impreso.
  entry: { marginBottom: 7 },
  entryTop: { flexDirection: 'row', justifyContent: 'space-between' },
  role: { fontFamily: 'Helvetica-Bold', fontSize: 10, flex: 1 },
  // `paddingTop` compensa la diferencia de línea base entre 8pt y 10pt:
  // react-pdf alinea las cajas por arriba y `alignItems: 'baseline'` no tiene
  // efecto, así que sin esto la fecha queda flotando sobre el título.
  dates: { fontSize: 8, color: FAINT, marginLeft: 8, paddingTop: 1.8 },
  org: { fontSize: 8.5, color: MUTED, marginBottom: 2.5 },
  description: { color: MUTED },
  techs: { fontSize: 7.5, color: FAINT, marginTop: 2.5 },

  // Los puestos hijos van indentados contra una regla: se leen como detalle de
  // la entrada de arriba y no como experiencias sueltas.
  childRole: { marginTop: 6, marginLeft: 10, paddingLeft: 8, borderLeftWidth: 0.75, borderLeftColor: '#e4e4e7' },
  roleTitle: { fontFamily: 'Helvetica-Bold', fontSize: 8.5, flex: 1 },
  roleOrg: { fontSize: 8, color: FAINT },
  roleBody: { fontSize: 8, color: MUTED, marginTop: 1 },

  // Dos columnas: las categorías son cortas y apiladas desperdician media
  // página que después falta para la experiencia.
  skillGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  skillCell: { width: '50%', paddingRight: 12, marginBottom: 7 },
  skillLabel: { fontFamily: 'Helvetica-Bold', fontSize: 8.5, marginBottom: 0.5 },
  skillList: { fontSize: 8.5, color: MUTED },

  certRow: { flexDirection: 'row', marginBottom: 2 },
  certBullet: { color: ACCENT, width: 8 },
  certText: { flex: 1, color: MUTED },

  footer: {
    position: 'absolute',
    bottom: 22,
    left: 46,
    right: 46,
    fontSize: 7,
    color: FAINT,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});

type Labels = {
  summary: string;
  experience: string;
  education: string;
  skills: string;
  certifications: string;
};

/**
 * Empresa y ubicación en una sola cadena.
 *
 * Dos motivos. Con varios hijos dentro de un `Text`, react-pdf ubica el segundo
 * en un offset que no corresponde al ancho real del primero y los superpone.
 * Y algunas entradas ya traen la ubicación dentro del nombre visible de la
 * empresa —"Freelance - Corrientes, Argentina"— así que repetirla la duplicaba.
 */
const orgLine = (org: string, location: string | null) => {
  if (!location) return org;

  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

  return normalize(org).includes(normalize(location)) ? org : `${org}  ·  ${location}`;
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  // Reserva lo justo para que el título no quede solo al pie con su contenido
  // en la página siguiente. Cuarenta puntos alcanzan para el título más una
  // primera línea; con sesenta empujaba una sección entera y el documento se
  // iba de dos páginas a tres.
  <View minPresenceAhead={40}>
    <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
    {children}
  </View>
);

const CvDocument = ({
  cv,
  locale,
  labels,
  extended = false
}: {
  cv: CvData;
  locale: string;
  labels: Labels;
  /**
   * Despliega los puestos de las experiencias agrupadas.
   *
   * Es el mismo documento con más detalle y no otro distinto: un CV extendido
   * que difiera en algo más que el nivel de detalle son dos documentos que hay
   * que mantener, y el segundo siempre queda viejo.
   */
  extended?: boolean;
}) => (
  <Document
    // Google Docs no escribía metadatos y muchos ATS los leen antes que el
    // contenido.
    title={`${SITE_NAME} — ${cv.jobTitle}`}
    author={SITE_NAME}
    subject={cv.jobTitle}
    keywords={cv.technicalSkills.join(', ')}
    creator={SITE_URL}
    language={locale}
  >
    <Page size="A4" style={styles.page}>
      <View>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.name}>{SITE_NAME}</Text>
            <Text style={styles.headline}>{cv.jobTitle}</Text>
            <Text style={styles.contact}>
              {[
                AUTHOR_EMAIL,
                SITE_URL.replace('https://', ''),
                ...SOCIAL_LINKS.map(link => link.replace(/^https:\/\/(www\.)?/, ''))
              ].join('   ·   ')}
            </Text>
          </View>
          {/* El `Image` de react-pdf no acepta `alt` —un PDF no tiene ese
              concepto— así que la regla de accesibilidad, pensada para el DOM,
              no aplica acá. */}
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={PHOTO} style={styles.photo} />
        </View>
        <View style={styles.headerRule} />
      </View>

      <Section title={labels.summary}>
        <Text style={styles.summary}>{cv.summary}</Text>
      </Section>

      <Section title={labels.skills}>
        <View style={styles.skillGrid}>
          {cv.skillCategories.map(category => (
            <View key={category.id} style={styles.skillCell}>
              <Text style={styles.skillLabel}>{category.label}</Text>
              <Text style={styles.skillList}>{category.skills.map(s => s.name).join(', ')}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title={labels.experience}>
        {cv.experiences.map(job => (
          <View key={job.id} style={styles.entry} wrap={false}>
            <View style={styles.entryTop}>
              <Text style={styles.role}>{job.role}</Text>
              <Text style={styles.dates}>{job.dateLabel}</Text>
            </View>
            <Text style={styles.org}>{orgLine(job.company, job.location)}</Text>
            <Text style={styles.description}>{job.description}</Text>
            {job.techs.length > 0 && <Text style={styles.techs}>{job.techs.join('  ·  ')}</Text>}

            {extended &&
              job.roles.map(role => (
                <View key={role.id} style={styles.childRole} wrap={false}>
                  <View style={styles.entryTop}>
                    <Text style={styles.roleTitle}>{role.title}</Text>
                    <Text style={styles.dates}>{role.dateLabel}</Text>
                  </View>
                  <Text style={styles.roleOrg}>{orgLine(role.organization, role.location)}</Text>
                  {role.description && <Text style={styles.roleBody}>{role.description}</Text>}
                </View>
              ))}
          </View>
        ))}
      </Section>

      <Section title={labels.education}>
        {cv.education.map(item => (
          <View key={item.id} style={styles.entry} wrap={false}>
            <View style={styles.entryTop}>
              <Text style={styles.role}>{item.degree}</Text>
              <Text style={styles.dates}>{item.dateLabel}</Text>
            </View>
            <Text style={styles.org}>{orgLine(item.institution, item.location)}</Text>
          </View>
        ))}
      </Section>

      <Section title={labels.certifications}>
        {cv.certifications.map(cert => (
          <View key={cert.id} style={styles.certRow} wrap={false}>
            <Text style={styles.certBullet}>•</Text>
            <Text style={styles.certText}>
              {`${cert.name} — ${cert.issuer}${cert.year ? ` (${cert.year})` : ''}`}
            </Text>
          </View>
        ))}
      </Section>

      <View style={styles.footer} fixed>
        <Text>{SITE_URL.replace('https://', '')}</Text>
        <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </View>
    </Page>
  </Document>
);

export default CvDocument;
