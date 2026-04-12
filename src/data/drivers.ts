import type { DriverDef } from "@/lib/types";

/** Minimálně 50 jezdců – reálné stáje + vymyšlené */
export const DRIVERS: DriverDef[] = [
  { id: "d1", firstName: "Max", lastName: "Verstappen", teamKey: "team.redbull" },
  { id: "d2", firstName: "Sergio", lastName: "Pérez", teamKey: "team.redbull" },
  { id: "d3", firstName: "Charles", lastName: "Leclerc", teamKey: "team.ferrari" },
  { id: "d4", firstName: "Carlos", lastName: "Sainz", teamKey: "team.ferrari" },
  { id: "d5", firstName: "Lewis", lastName: "Hamilton", teamKey: "team.mercedes" },
  { id: "d6", firstName: "George", lastName: "Russell", teamKey: "team.mercedes" },
  { id: "d7", firstName: "Lando", lastName: "Norris", teamKey: "team.mclaren" },
  { id: "d8", firstName: "Oscar", lastName: "Piastri", teamKey: "team.mclaren" },
  { id: "d9", firstName: "Fernando", lastName: "Alonso", teamKey: "team.aston" },
  { id: "d10", firstName: "Lance", lastName: "Stroll", teamKey: "team.aston" },
  { id: "d11", firstName: "Esteban", lastName: "Ocon", teamKey: "team.alpine" },
  { id: "d12", firstName: "Pierre", lastName: "Gasly", teamKey: "team.alpine" },
  { id: "d13", firstName: "Alexander", lastName: "Albon", teamKey: "team.williams" },
  { id: "d14", firstName: "Logan", lastName: "Sargeant", teamKey: "team.williams" },
  { id: "d15", firstName: "Yuki", lastName: "Tsunoda", teamKey: "team.rb" },
  { id: "d16", firstName: "Daniel", lastName: "Ricciardo", teamKey: "team.rb" },
  { id: "d17", firstName: "Kevin", lastName: "Magnussen", teamKey: "team.haas" },
  { id: "d18", firstName: "Nico", lastName: "Hülkenberg", teamKey: "team.haas" },
  { id: "d19", firstName: "Valtteri", lastName: "Bottas", teamKey: "team.sauber" },
  { id: "d20", firstName: "Zhou", lastName: "Guanyu", teamKey: "team.sauber" },
  { id: "d21", firstName: "Liam", lastName: "Lawson", teamKey: "team.rb" },
  { id: "d22", firstName: "Oliver", lastName: "Bearman", teamKey: "team.ferrari" },
  { id: "d23", firstName: "Andrea", lastName: "Kimi", teamKey: "team.sauber" },
  { id: "d24", firstName: "Gabriel", lastName: "Bortoleto", teamKey: "team.sauber" },
  { id: "d25", firstName: "Isack", lastName: "Hadjar", teamKey: "team.rb" },
  { id: "d26", firstName: "Jack", lastName: "Doohan", teamKey: "team.alpine" },
  { id: "d27", firstName: "Franco", lastName: "Colapinto", teamKey: "team.alpine" },
  { id: "d28", firstName: "Nikita", lastName: "Mazepin", teamKey: "team.haas" },
  { id: "d29", firstName: "Mick", lastName: "Schumacher", teamKey: "team.mercedes" },
  { id: "d30", firstName: "Nyck", lastName: "de Vries", teamKey: "team.williams" },
  { id: "d31", firstName: "Antonín", lastName: "Novák", teamKey: "team.phoenix" },
  { id: "d32", firstName: "Eliška", lastName: "Dvořáková", teamKey: "team.phoenix" },
  { id: "d33", firstName: "Jonas", lastName: "Kováč", teamKey: "team.nitro" },
  { id: "d34", firstName: "Marek", lastName: "Horváth", teamKey: "team.nitro" },
  { id: "d35", firstName: "Sofia", lastName: "Rossi", teamKey: "team.vortex" },
  { id: "d36", firstName: "Luca", lastName: "Bianchi", teamKey: "team.vortex" },
  { id: "d37", firstName: "Noah", lastName: "Petrov", teamKey: "team.polar" },
  { id: "d38", firstName: "Emma", lastName: "Larsen", teamKey: "team.polar" },
  { id: "d39", firstName: "Kai", lastName: "Tanaka", teamKey: "team.crimson" },
  { id: "d40", firstName: "Yara", lastName: "Silva", teamKey: "team.crimson" },
  { id: "d41", firstName: "Felix", lastName: "Weber", teamKey: "team.apex" },
  { id: "d42", firstName: "Nina", lastName: "Keller", teamKey: "team.apex" },
  { id: "d43", firstName: "Mateo", lastName: "Ortega", teamKey: "team.storm" },
  { id: "d44", firstName: "Ivy", lastName: "Chen", teamKey: "team.storm" },
  { id: "d45", firstName: "Oskar", lastName: "Lindberg", teamKey: "team.phoenix" },
  { id: "d46", firstName: "Tereza", lastName: "Malá", teamKey: "team.nitro" },
  { id: "d47", firstName: "Henrik", lastName: "Berg", teamKey: "team.vortex" },
  { id: "d48", firstName: "Amélie", lastName: "Dubois", teamKey: "team.polar" },
  { id: "d49", firstName: "Ravi", lastName: "Patel", teamKey: "team.crimson" },
  { id: "d50", firstName: "Zoe", lastName: "Martinez", teamKey: "team.apex" },
  { id: "d51", firstName: "Tomáš", lastName: "Svoboda", teamKey: "team.storm" },
  { id: "d52", firstName: "Klára", lastName: "Procházková", teamKey: "team.phoenix" },
];

export function pickRandomDrivers(count: number): DriverDef[] {
  const pool = [...DRIVERS];
  const out: DriverDef[] = [];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

export function uniqueCarNumbers(count: number): number[] {
  const set = new Set<number>();
  while (set.size < count) {
    set.add(2 + Math.floor(Math.random() * 98));
  }
  return Array.from(set);
}
