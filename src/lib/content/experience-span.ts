import type { Experience } from './types';

/**
 * Años de experiencia técnica, calculados desde las fechas.
 *
 * Suma la **unión** de los períodos, no sus duraciones. Tres puestos vigentes a
 * la vez son un tramo de tiempo, no tres: sumarlos por separado daría el triple
 * de lo que corresponde, y es el error que hace que un CV declare más años que
 * los que la persona lleva viva.
 *
 * Sólo entran las experiencias marcadas como técnicas. La carrera gastronómica
 * es parte del CV y aporta a la historia, pero contarla acá sería falso.
 *
 * Se redondea hacia abajo: declarar cuatro años teniendo cuatro y medio es
 * conservador, y al revés es una afirmación que no se sostiene.
 */
export function computeYearsOfExperience(experiences: Experience[], now = new Date()): number {
  const currentMonth = now.getUTCFullYear() * 12 + now.getUTCMonth();

  // `YYYY-MM` a un índice de mes absoluto, para poder ordenar y comparar sin
  // aritmética de fechas.
  const toMonths = (value: string | null): number | null => {
    if (!value) return null;

    const [year, month] = value.split('-').map(Number);

    return Number.isFinite(year) && Number.isFinite(month) ? year * 12 + (month - 1) : null;
  };

  const spans: Array<[number, number]> = [];

  for (const experience of experiences) {
    if (experience.countsAsExperience === false) continue;

    // Un puesto interrumpido declara sus tramos reales; sin ellos vale el
    // intervalo completo.
    const ranges = experience.periods?.length
      ? experience.periods.map(p => [p.startDate, p.endDate] as const)
      : [[experience.startDate, experience.endDate] as const];

    for (const [rawStart, rawEnd] of ranges) {
      const start = toMonths(rawStart);

      if (start === null) continue;

      const end = toMonths(rawEnd) ?? currentMonth;

      if (end >= start) spans.push([start, end]);
    }
  }

  if (spans.length === 0) return 0;

  spans.sort((a, b) => a[0] - b[0]);

  let months = 0;
  let [, coveredUntil] = spans[0];

  months = spans[0][1] - spans[0][0];

  for (const [start, end] of spans.slice(1)) {
    if (start > coveredUntil) {
      months += end - start;
      coveredUntil = end;
    } else if (end > coveredUntil) {
      months += end - coveredUntil;
      coveredUntil = end;
    }
  }

  return Math.floor(months / 12);
}
