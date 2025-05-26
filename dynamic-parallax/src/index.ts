// noinspection SpellCheckingInspection

/**
 * Konstanty
 */

// SLNKO:
const ABS_MAG_SUN = 4.83                             // absolutna magnitude
const LUMINOSITY_SUN = 3.83e26;                      // luminosita 3.83 x 10^26 [W]


// Zo zadania:
const m1 = 3.9; // relativna magnituda 1
const m2 = 5.3; // relativna magnituda 2
const A = 4.5; // velka poloosa (v uhlovych sekundach)
const B = 3.4; // mala poloosa (v uhlovych sekundach)
const t = 11; // dlzka pozorovania (v rokoch)

const h = Math.sqrt(A ** 2 - B ** 2); // = 2.95"
const S = Math.PI * A * B; // uhlove sekundy stvorcove
const eps = A * B * (Math.acos(h/A) - (h/A ** 2) * Math.sqrt(A ** 2 - h ** 2)); // uhlove sekundy stvorcove
const T = (t * S) / eps; // perioda (v rokoch)

const convertAuToParsecs = (au: number) => au / 206265;

/** Krok 1:
 * Z periody T a predpokladanej hmotnosti vypocitame velku poloosu a
 *
 * Vzorecek:
 * a^3/T^2 = M1 + M2
 * @param T perioda
 * @param M1 predpokladana hmotnost prvej hviezdy (v hmotnosti slnka Ms)
 * @param M2 predpokladana hmotnost druhej hviezdy (v hmotnosti slnka Ms)
 * @return number => velka poloosa (v AU)
 */
const velkaPoloosa = (T: number, M1: number, M2: number) => ((M1 + M2) * (T ** 2)) ** (1/3);

/** Krok 2:
 * Z vypocitanej velikosti a pozorovanej uhlovej velkosti a vypocitame odhad vzdialenosti od Zeme
 *
 * Vzorecek:
 * d = a / uholVRadianoch
 * @param a = vypocitana velkost (AU)
 * @param uhol = uhlova velkost na oblohe (")
 * @return d = vzdialenost v (AU)
 */
const distance = (a: number, uhol: number) => {
  const x = 2 * Math.PI / (360 * 3600); // prepocet uhlovych sekund na radiany = 1/205265
  return a / (uhol * x);
}

/** Krok 3a:
 * Vypocet absolutnej magnitudy
 *
 * Vzorecek:
 * M1 = m1 + 5 - 5log d
 * @param m = relativna magnituda
 * @param d = vzdialenost (v pc)
 */
const computeAbsoluteMagnitude = (m: number, d: number) => m + 5 - 5 * Math.log10(d);

/** Krok 3b:
 * Vypocet ziariveho vykonu
 *
 * Vzorecek:
 * M - Ms = -2.5 log (L/Ls)
 *
 * (M - ABS_MAG_SUN) = -2.5 Math.log10(L/Ls)
 * ((M - ABS_MAG_SUN)/-2.5) = Math.log10(L/Ls)
 * 10^((M - ABS_MAG_SUN)/-2.5) = L/Ls
 * 10^((M - ABS_MAG_SUN)/-2.5)*Ls = L
 * @param M = absolutna magnituda
 * @return number = vysledny ziarivy vykon [W]
 */
const computeLuminosity = (M: number) => 10 ** ((M - ABS_MAG_SUN)/-2.5)*LUMINOSITY_SUN;

/** Krok 4:
 * Vypocet hmotnosti:
 *
 * Vzorecek:
 * L ~ M^3.5
 * L/Ls = (M/Ms)^3.5
 * (L/Ls)^(1/3.5) = M/Ms
 * (L/Ls)^(1/3.5) * Ms = M
 * M = (L / LUMINOSITY_SUN) ** (1/3.5) * 1
 * //Ms = 1, vysledok bude v hmotnosti slnka
 *
 * @param L = luminosita hviezdy
 * @return number = vysledna hmotnost v hmotnostiach slnka
 */
const computeWeight = (L: number) => (L / LUMINOSITY_SUN) ** (1/3.5)

/**
 *
 * @param i
 * @param T = [yr]
 * @param ASSUMED_M1 = [Ms]
 * @param ASSUMED_M2 = [Ms]
 * @param wantedAccuracy = [%]
 */
const iterate = (i: number, T: number, ASSUMED_M1: number, ASSUMED_M2: number, wantedAccuracy = 1) => {
  const a = velkaPoloosa(T, ASSUMED_M1, ASSUMED_M2);
  const d = convertAuToParsecs(distance(a, A)); // v parsecoch

  const MAG1 = computeAbsoluteMagnitude(m1, d);
  const MAG2 = computeAbsoluteMagnitude(m2, d);

  const L1 = computeLuminosity(MAG1);
  const L2 = computeLuminosity(MAG2);

  const M1 = computeWeight(L1);
  const M2 = computeWeight(L2);

  /* rozdiel v percentach */
  const diff = ((ASSUMED_M1 + ASSUMED_M2) - (M1 + M2)) / (ASSUMED_M1 + ASSUMED_M2) * 100;

  console.log({iteracia: i, a, d, MAG1, MAG2, L1, L2, M1, M2, diff});
  if (diff < wantedAccuracy) {
    console.log(`Required accuracy ${wantedAccuracy}% reached after ${i} iterations!`)
    return {MAG1, MAG2, L1, L2, M1, M2, d};
  }
  return iterate(i + 1, T, M1, M2);
}

const run = () => {
  const {MAG1, MAG2, L1, L2, M1, M2, d} = iterate(1, T, 1, 1);
  console.log("T: ", T.toFixed(3), "yr");
  console.log("d: ", d.toFixed(3), "pc");
  console.log("STAR 1: Abs. Magnitude: ", MAG1.toFixed(2), " | Weight: ", M1.toFixed(3), "suns");
  console.log("STAR 2: Abs. Magnitude: ", MAG2.toFixed(2), " | Weight: ", M2.toFixed(3), "suns");
}

run();