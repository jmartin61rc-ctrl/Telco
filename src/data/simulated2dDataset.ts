import { TelcoRecord } from '../types/segmentation';

/**
 * Case 2: Datos simulados bidimensionales
 * 300 points divided cleanly into 3 natural Gaussian clusters in 2D space
 * Designed for intuitive geometry visualization and algorithmic benchmarking.
 */
export function generate2DSimulatedData(seed = 123): TelcoRecord[] {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const randNorm = (mean = 0, std = 1) => {
    const u1 = Math.max(1e-7, rand());
    const u2 = rand();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z * std;
  };

  const records: TelcoRecord[] = [];
  const centers = [
    { x: 25, y: 30, pref: 150, nonPref: 40, serv: 1, eq: 200, gb: 5 },
    { x: 75, y: 85, pref: 650, nonPref: 280, serv: 4, eq: 1100, gb: 65 },
    { x: 30, y: 80, pref: 400, nonPref: 120, serv: 2, eq: 600, gb: 35 },
  ];

  for (let c = 0; c < centers.length; c++) {
    const center = centers[c];
    for (let i = 0; i < 100; i++) {
      const id = c * 100 + i + 1;
      const age = Math.round(Math.max(18, randNorm(center.x, 8)));
      const income = Math.round(Math.max(10, randNorm(center.y, 10)));
      const pref = Math.round(Math.max(10, randNorm(center.pref, 40)));
      const nonPref = Math.round(Math.max(5, randNorm(center.nonPref, 25)));
      const gb = Math.round(Math.max(0.5, randNorm(center.gb, 6)));
      const eq = Math.round(Math.max(50, randNorm(center.eq, 100)));
      const serv = Math.max(1, Math.min(4, Math.round(randNorm(center.serv, 0.6))));

      records.push({
        id,
        region: c + 1,
        edad: age,
        estadocivil: rand() > 0.5 ? 1 : 0,
        jubilado: age > 65 ? 1 : 0,
        genero: rand() > 0.5 ? 1 : 0,
        fijo: serv >= 1 ? 1 : 0,
        largadistancia: serv >= 2 ? 1 : 0,
        internetcasa: serv >= 3 ? 1 : 0,
        numoculto: serv >= 4 ? 1 : 0,
        minutos_preferido: pref,
        minutos_no_preferido: nonPref,
        adicionales: Math.round(Math.max(0, randNorm(c * 15, 5))),
        internet_gigas: gb,
        equipo_dolares: eq,
        ingresos: income,
        servicios: serv,
      });
    }
  }

  return records;
}
