// Export functions from the original compute.ts file
// These functions will be used in our React application

/** Compute the excentricity of an ellipsis */
export const computeExcentricity = (a: number, b: number) => Math.sqrt(a ** 2 - b ** 2);

/** Compute the area of an ellipsis */
export const computeEllipsisArea = (a: number, b: number) => Math.PI * a * b;

/** Compute the partial area of an ellipsis */
export const computePartialEllipsisArea = (a: number, b: number, h: number) =>
  a * b * (Math.acos(h / a) - (h / a ** 2) * Math.sqrt(a ** 2 - h ** 2));

/** Compute the period */
export const computePeriod = (t: number, S: number, eps: number) => (t * S) / eps;

/** Convert AU to parsecs */
export const convertAuToParsecs = (au: number) => au / 206265;

/** Compute the large semi-axis */
export const velkaPoloosa = (T: number, M1: number, M2: number) => ((M1 + M2) * T ** 2) ** (1 / 3);

/** Compute the distance */
export const distance = (a: number, uhol: number) => {
  const x = (2 * Math.PI) / (360 * 3600); // prepocet uhlovych sekund na radiany = 1/205265
  return a / (uhol * x);
};

/** Compute the absolute magnitude */
export const computeAbsoluteMagnitude = (m: number, d: number) => m + 5 - 5 * Math.log10(d);

/** Compute the luminosity */
export const computeLuminosity = (M: number) => {
  const ABS_MAG_SUN = 4.83; // absolutna magnitude
  const LUMINOSITY_SUN = 3.83e26; // luminosita 3.83 x 10^26 [W]
  return 10 ** ((M - ABS_MAG_SUN) / -2.5) * LUMINOSITY_SUN;
};

/** Compute the weight */
export const computeWeight = (L: number) => {
  const LUMINOSITY_SUN = 3.83e26; // luminosita 3.83 x 10^26 [W]
  return (L / LUMINOSITY_SUN) ** (1 / 3.5);
};

/** Iterate to find the solution */
export const iterate = (
  i: number,
  T: number,
  ASSUMED_M1: number,
  ASSUMED_M2: number,
  m1: number,
  m2: number,
  A: number,
  wantedAccuracy = 1,
): any => {
  const a = velkaPoloosa(T, ASSUMED_M1, ASSUMED_M2);
  const d = convertAuToParsecs(distance(a, A)); // v parsecoch

  const MAG1 = computeAbsoluteMagnitude(m1, d);
  const MAG2 = computeAbsoluteMagnitude(m2, d);

  const L1 = computeLuminosity(MAG1);
  const L2 = computeLuminosity(MAG2);

  const M1 = computeWeight(L1);
  const M2 = computeWeight(L2);

  /* rozdiel v percentach */
  const diff = ((ASSUMED_M1 + ASSUMED_M2 - (M1 + M2)) / (ASSUMED_M1 + ASSUMED_M2)) * 100;

  const iterationResult = { iteracia: i, a, d, MAG1, MAG2, L1, L2, M1, M2, diff };

  if (diff < wantedAccuracy) {
    return {
      iterationResult,
      finalResult: { MAG1, MAG2, L1, L2, M1, M2, d, T },
      message: `Required accuracy ${wantedAccuracy}% reached after ${i} iterations!`,
    };
  }

  return iterate(i + 1, T, M1, M2, m1, m2, A, wantedAccuracy);
};

/** Run the computation */
export const runComputation = (
  m1: number,
  m2: number,
  A: number,
  B: number,
  t: number,
  wantedAccuracy: number,
) => {
  const h = computeExcentricity(A, B);
  const S = computeEllipsisArea(A, B);
  const eps = computePartialEllipsisArea(A, B, h);
  const T = computePeriod(t, S, eps);

  const results = [];
  let finalResult;
  let message;

  try {
    // Non-recursive approach to collect all iterations
    let currentIteration = 1;
    let ASSUMED_M1 = 1;
    let ASSUMED_M2 = 1;
    let done = false;

    while (!done && currentIteration <= 100) {
      // Limit to prevent infinite loops
      const a = velkaPoloosa(T, ASSUMED_M1, ASSUMED_M2);
      const d = convertAuToParsecs(distance(a, A)); // v parsecoch

      const MAG1 = computeAbsoluteMagnitude(m1, d);
      const MAG2 = computeAbsoluteMagnitude(m2, d);

      const L1 = computeLuminosity(MAG1);
      const L2 = computeLuminosity(MAG2);

      const M1 = computeWeight(L1);
      const M2 = computeWeight(L2);

      /* rozdiel v percentach */
      const diff =
        (Math.abs(ASSUMED_M1 + ASSUMED_M2 - (M1 + M2)) / (ASSUMED_M1 + ASSUMED_M2)) * 100;

      const iterationResult = {
        iteracia: currentIteration,
        a,
        d,
        MAG1,
        MAG2,
        L1,
        L2,
        M1,
        M2,
        diff,
      };
      results.push(iterationResult);

      if (diff < wantedAccuracy) {
        finalResult = { MAG1, MAG2, L1, L2, M1, M2, d, T };
        message = `Required accuracy ${wantedAccuracy}% reached after ${currentIteration} iterations!`;
        done = true;
      } else {
        ASSUMED_M1 = M1;
        ASSUMED_M2 = M2;
        currentIteration++;
      }
    }

    if (!done) {
      message = `Maximum iterations (100) reached without achieving required accuracy.`;
    }
  } catch (error) {
    console.error('Error during computation:', error);
  }

  return {
    initialValues: { h, S, eps, T },
    iterationResults: results,
    finalResult,
    message,
  };
};
