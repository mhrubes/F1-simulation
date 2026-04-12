/**
 * Klient i simulace čtou NEXT_PUBLIC_FIRST_RACER_FAST (inlinuje se při buildu).
 * Výchozí hodnotu bez .env nastavuje kořenový config.js přes next.config.ts → env.
 */
export const firstRacerFast =
  process.env.NEXT_PUBLIC_FIRST_RACER_FAST === "true";
