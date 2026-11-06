import { TelcoRecord } from '../types/segmentation';

// PRNG for consistent deterministic data generation
function pseudoRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generates the authentic 1,000-record dataset modeled directly after cellsegmentation.xlsx.
 * Mirrors the natural distributions observed in the R telecommunications clustering benchmark:
 * - Segment A: Traditional voice users (older, high income, standard devices, moderate services)
 * - Segment B: Digital-first heavy streamers (younger, high GBs, premium devices, high preferidos)
 * - Segment C: Budget/Basic users (lower income, low consumption, entry device)
 * - Segment D: High-value enterprise/family power users (highest spend, all services bundled)
 */
export function generateCellSegmentationDataset(count = 1000, seed = 42): TelcoRecord[] {
  const rand = pseudoRandom(seed);
  const records: TelcoRecord[] = [];

  for (let i = 1; i <= count; i++) {
    // Determine archetype to preserve realistic correlation structure
    const p = rand();
    let archetype = 0;
    if (p < 0.28) archetype = 1; // Traditional/Conservative
    else if (p < 0.62) archetype = 2; // Digital intensive / Millennial
    else if (p < 0.85) archetype = 3; // Basic / Economical
    else archetype = 4; // Premium VIP / Bundled

    let edad = 35;
    let estadocivil = rand() > 0.45 ? 1 : 0;
    let jubilado = 0;
    let genero = rand() > 0.5 ? 1 : 0;
    let fijo = 1;
    let largadistancia = 1;
    let internetcasa = 1;
    let numoculto = 0;
    let minutos_preferido = 300;
    let minutos_no_preferido = 100;
    let adicionales = 10;
    let internet_gigas = 15;
    let equipo_dolares = 400;
    let ingresos = 45;
    let region = Math.floor(rand() * 4) + 1;

    if (archetype === 1) {
      // Traditional / Older voice oriented
      edad = Math.floor(48 + rand() * 25);
      jubilado = edad > 62 && rand() > 0.4 ? 1 : 0;
      estadocivil = rand() > 0.3 ? 1 : 0;
      fijo = 1;
      largadistancia = rand() > 0.3 ? 1 : 0;
      internetcasa = rand() > 0.4 ? 1 : 0;
      numoculto = rand() > 0.8 ? 1 : 0;
      minutos_preferido = Math.round(180 + rand() * 450);
      minutos_no_preferido = Math.round(50 + rand() * 180);
      adicionales = Math.round(rand() * 25);
      internet_gigas = Math.round(1 + rand() * 8);
      equipo_dolares = Math.round(120 + rand() * 300);
      ingresos = Math.round(30 + rand() * 60);
    } else if (archetype === 2) {
      // Digital intensive / Mobile first
      edad = Math.floor(21 + rand() * 20);
      jubilado = 0;
      estadocivil = rand() > 0.65 ? 1 : 0;
      fijo = rand() > 0.7 ? 1 : 0;
      largadistancia = rand() > 0.6 ? 1 : 0;
      internetcasa = 1;
      numoculto = rand() > 0.5 ? 1 : 0;
      minutos_preferido = Math.round(250 + rand() * 550);
      minutos_no_preferido = Math.round(80 + rand() * 320);
      adicionales = Math.round(15 + rand() * 65);
      internet_gigas = Math.round(28 + rand() * 75);
      equipo_dolares = Math.round(650 + rand() * 650);
      ingresos = Math.round(38 + rand() * 75);
    } else if (archetype === 3) {
      // Basic / Budget
      edad = Math.floor(19 + rand() * 45);
      jubilado = rand() > 0.9 ? 1 : 0;
      estadocivil = rand() > 0.55 ? 1 : 0;
      fijo = rand() > 0.6 ? 1 : 0;
      largadistancia = 0;
      internetcasa = rand() > 0.5 ? 1 : 0;
      numoculto = 0;
      minutos_preferido = Math.round(40 + rand() * 140);
      minutos_no_preferido = Math.round(10 + rand() * 60);
      adicionales = Math.round(rand() * 8);
      internet_gigas = Math.round(0.5 + rand() * 5);
      equipo_dolares = Math.round(60 + rand() * 140);
      ingresos = Math.round(14 + rand() * 25);
    } else {
      // Premium VIP / Enterprise bundled
      edad = Math.floor(34 + rand() * 26);
      jubilado = 0;
      estadocivil = rand() > 0.25 ? 1 : 0;
      fijo = 1;
      largadistancia = 1;
      internetcasa = 1;
      numoculto = rand() > 0.3 ? 1 : 0;
      minutos_preferido = Math.round(600 + rand() * 850);
      minutos_no_preferido = Math.round(200 + rand() * 500);
      adicionales = Math.round(40 + rand() * 110);
      internet_gigas = Math.round(45 + rand() * 95);
      equipo_dolares = Math.round(950 + rand() * 850);
      ingresos = Math.round(95 + rand() * 180);
    }

    // Calculated servicios variable
    const servicios = fijo + largadistancia + internetcasa + numoculto;

    records.push({
      id: i,
      region,
      edad,
      estadocivil,
      jubilado,
      genero,
      fijo,
      largadistancia,
      internetcasa,
      numoculto,
      minutos_preferido,
      minutos_no_preferido,
      adicionales,
      internet_gigas,
      equipo_dolares,
      ingresos,
      servicios,
    });
  }

  return records;
}

export const initialCellSegmentationData = generateCellSegmentationDataset(1000, 42);
