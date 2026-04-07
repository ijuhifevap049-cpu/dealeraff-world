/**
 * Generated static offers data
 * Total: 1969 offers
 * - 46 offers: $10.00 - $15.00
 * - 1923 offers: $15.01 - $400.00
 * IDs start from 10001
 * Randomly shuffled and fixed with a seed.
 */

const seed = 890305; // Using a fixed seed for "permanently fixed" randomness
let currentSeed = seed;

function seededRandom() {
  currentSeed = (currentSeed * 16807) % 2147483647;
  return (currentSeed - 1) / 2147483646;
}

function getRandomPrice(min: number, max: number) {
  const price = seededRandom() * (max - min) + min;
  return `$${price.toFixed(2)}`;
}

const countriesPool = ['us', 'kr', 'tw', 'hk', 'gb', 'ca', 'au', 'de', 'fr', 'jp', 'sg'];
const namesPool = [
  '(Web/Wap) #H{ID} V2 (Biweekly) - High Value Campaign - Global - CC Submit',
  '(Mobile) #M{ID} Premium Subscription - Tier 1 Traffic - Direct Offer',
  '(Desktop) #D{ID} Software Download - Global Bundle - High Conversion',
  '(Web) #W{ID} Survey Completion - Multi-Country - Instant Payout',
  '(Wap) #A{ID} App Install - Android/iOS - Incentive Allowed',
  '(Global) #G{ID} E-commerce Voucher - Sweepstakes - CC Submit'
];

function generateOffers() {
  const offers: any[] = [];
  let currentId = 10001;

  // 1. Generate 46 offers between $10 and $15
  for (let i = 0; i < 46; i++) {
    const nameTemplate = namesPool[Math.floor(seededRandom() * namesPool.length)];
    offers.push({
      id: currentId.toString(),
      name: nameTemplate.replace('{ID}', currentId.toString()),
      payout: getRandomPrice(10, 15),
      countries: Array.from({ length: 4 }, () => countriesPool[Math.floor(seededRandom() * countriesPool.length)])
    });
    currentId++;
  }

  // 2. Generate 1923 offers between $15 and $400
  for (let i = 0; i < 1923; i++) {
    const nameTemplate = namesPool[Math.floor(seededRandom() * namesPool.length)];
    offers.push({
      id: currentId.toString(),
      name: nameTemplate.replace('{ID}', currentId.toString()),
      payout: getRandomPrice(15.01, 400),
      countries: Array.from({ length: 4 }, () => countriesPool[Math.floor(seededRandom() * countriesPool.length)])
    });
    currentId++;
  }

  // 3. Seeded Shuffle
  for (let i = offers.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [offers[i], offers[j]] = [offers[j], offers[i]];
  }

  return offers;
}

export const OFFERS = generateOffers();
