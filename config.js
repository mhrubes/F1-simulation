/**
 * Výchozí herní přepínače (přebírá Next při buildu, pokud v .env není NEXT_PUBLIC_*).
 * Pro přepsání v prostředí použijte např. NEXT_PUBLIC_FIRST_RACER_FAST=true v .env.local
 * @type {{ firstRacerFast: boolean }}
 */
module.exports = {
  /** true = jezdec č. 1 na roštu jede zhruba ~500 km/h; false = stejná fyzika jako ostatní */
  firstRacerFast: false,
};
