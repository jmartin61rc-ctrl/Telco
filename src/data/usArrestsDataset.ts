import { TelcoRecord } from '../types/segmentation';

/**
 * Case 3: Classic USArrests benchmark dataset (R datasets package)
 * 50 US States with crime statistics:
 * Murder (tasa por 100k), Assault, UrbanPop (% población urbana), Rape.
 * Mapped to the common structure to demonstrate universal clustering compatibility.
 */
export const usArrestsDataRaw = [
  { state: "Alabama", Murder: 13.2, Assault: 236, UrbanPop: 58, Rape: 21.2 },
  { state: "Alaska", Murder: 10.0, Assault: 263, UrbanPop: 48, Rape: 44.5 },
  { state: "Arizona", Murder: 8.1, Assault: 294, UrbanPop: 80, Rape: 31.0 },
  { state: "Arkansas", Murder: 8.8, Assault: 190, UrbanPop: 50, Rape: 19.5 },
  { state: "California", Murder: 9.0, Assault: 276, UrbanPop: 91, Rape: 40.6 },
  { state: "Colorado", Murder: 7.9, Assault: 204, UrbanPop: 78, Rape: 38.7 },
  { state: "Connecticut", Murder: 3.3, Assault: 110, UrbanPop: 77, Rape: 11.1 },
  { state: "Delaware", Murder: 5.9, Assault: 238, UrbanPop: 72, Rape: 15.8 },
  { state: "Florida", Murder: 15.4, Assault: 335, UrbanPop: 80, Rape: 31.9 },
  { state: "Georgia", Murder: 17.4, Assault: 211, UrbanPop: 60, Rape: 25.8 },
  { state: "Hawaii", Murder: 5.3, Assault: 46, UrbanPop: 83, Rape: 20.2 },
  { state: "Idaho", Murder: 2.6, Assault: 120, UrbanPop: 54, Rape: 14.2 },
  { state: "Illinois", Murder: 10.4, Assault: 249, UrbanPop: 83, Rape: 24.0 },
  { state: "Indiana", Murder: 7.2, Assault: 113, UrbanPop: 65, Rape: 21.0 },
  { state: "Iowa", Murder: 2.2, Assault: 56, UrbanPop: 57, Rape: 11.3 },
  { state: "Kansas", Murder: 6.0, Assault: 115, UrbanPop: 66, Rape: 18.0 },
  { state: "Kentucky", Murder: 9.7, Assault: 109, UrbanPop: 52, Rape: 16.3 },
  { state: "Louisiana", Murder: 15.4, Assault: 249, UrbanPop: 66, Rape: 22.2 },
  { state: "Maine", Murder: 2.1, Assault: 83, UrbanPop: 51, Rape: 7.8 },
  { state: "Maryland", Murder: 11.3, Assault: 300, UrbanPop: 67, Rape: 27.8 },
  { state: "Massachusetts", Murder: 4.4, Assault: 149, UrbanPop: 85, Rape: 16.3 },
  { state: "Michigan", Murder: 12.1, Assault: 255, UrbanPop: 74, Rape: 35.1 },
  { state: "Minnesota", Murder: 2.7, Assault: 72, UrbanPop: 66, Rape: 14.9 },
  { state: "Mississippi", Murder: 16.1, Assault: 259, UrbanPop: 44, Rape: 17.1 },
  { state: "Missouri", Murder: 9.0, Assault: 178, UrbanPop: 70, Rape: 28.2 },
  { state: "Montana", Murder: 6.0, Assault: 109, UrbanPop: 53, Rape: 16.4 },
  { state: "Nebraska", Murder: 4.3, Assault: 102, UrbanPop: 62, Rape: 16.5 },
  { state: "Nevada", Murder: 12.2, Assault: 252, UrbanPop: 81, Rape: 46.0 },
  { state: "New Hampshire", Murder: 2.1, Assault: 57, UrbanPop: 56, Rape: 9.5 },
  { state: "New Jersey", Murder: 7.4, Assault: 159, UrbanPop: 89, Rape: 18.8 },
  { state: "New Mexico", Murder: 11.4, Assault: 285, UrbanPop: 70, Rape: 32.1 },
  { state: "New York", Murder: 11.1, Assault: 254, UrbanPop: 86, Rape: 26.1 },
  { state: "North Carolina", Murder: 13.0, Assault: 337, UrbanPop: 45, Rape: 16.1 },
  { state: "North Dakota", Murder: 0.8, Assault: 45, UrbanPop: 44, Rape: 7.3 },
  { state: "Ohio", Murder: 7.3, Assault: 120, UrbanPop: 75, Rape: 21.4 },
  { state: "Oklahoma", Murder: 6.6, Assault: 151, UrbanPop: 68, Rape: 20.0 },
  { state: "Oregon", Murder: 4.9, Assault: 159, UrbanPop: 67, Rape: 29.3 },
  { state: "Pennsylvania", Murder: 6.3, Assault: 106, UrbanPop: 72, Rape: 14.9 },
  { state: "Rhode Island", Murder: 3.4, Assault: 174, UrbanPop: 87, Rape: 8.3 },
  { state: "South Carolina", Murder: 14.4, Assault: 279, UrbanPop: 48, Rape: 22.5 },
  { state: "South Dakota", Murder: 3.8, Assault: 86, UrbanPop: 45, Rape: 12.8 },
  { state: "Tennessee", Murder: 13.2, Assault: 188, UrbanPop: 59, Rape: 26.9 },
  { state: "Texas", Murder: 12.7, Assault: 201, UrbanPop: 80, Rape: 25.5 },
  { state: "Utah", Murder: 3.2, Assault: 120, UrbanPop: 80, Rape: 22.9 },
  { state: "Vermont", Murder: 2.2, Assault: 48, UrbanPop: 32, Rape: 11.2 },
  { state: "Virginia", Murder: 8.5, Assault: 156, UrbanPop: 63, Rape: 20.7 },
  { state: "Washington", Murder: 4.0, Assault: 145, UrbanPop: 73, Rape: 26.2 },
  { state: "West Virginia", Murder: 5.7, Assault: 81, UrbanPop: 39, Rape: 9.3 },
  { state: "Wisconsin", Murder: 2.6, Assault: 53, UrbanPop: 66, Rape: 10.8 },
  { state: "Wyoming", Murder: 6.8, Assault: 161, UrbanPop: 60, Rape: 15.6 }
];

export function getUSArrestsAsTelco(): TelcoRecord[] {
  return usArrestsDataRaw.map((row, idx) => ({
    id: idx + 1,
    region: Math.floor(row.UrbanPop / 25) + 1,
    edad: Math.round(row.UrbanPop), // Urban pop mapped to edad
    estadocivil: row.Murder > 10 ? 1 : 0,
    jubilado: 0,
    genero: idx % 2 === 0 ? 1 : 0,
    fijo: row.Assault > 150 ? 1 : 0,
    largadistancia: row.Rape > 20 ? 1 : 0,
    internetcasa: row.UrbanPop > 60 ? 1 : 0,
    numoculto: row.Murder > 8 ? 1 : 0,
    minutos_preferido: Math.round(row.Assault * 3),
    minutos_no_preferido: Math.round(row.Rape * 10),
    adicionales: Math.round(row.Murder * 5),
    internet_gigas: Math.round(row.UrbanPop / 2),
    equipo_dolares: Math.round(row.Assault * 4),
    ingresos: Math.round(row.UrbanPop * 1.5),
    servicios: (row.Assault > 150 ? 1 : 0) + (row.Rape > 20 ? 1 : 0) + (row.UrbanPop > 60 ? 1 : 0) + (row.Murder > 8 ? 1 : 0),
    stateName: row.state,
    Murder: row.Murder,
    Assault: row.Assault,
    UrbanPop: row.UrbanPop,
    Rape: row.Rape,
  }));
}
