// lib/mockData.js
export const mockEvents = [
  {
    id: 1,
    type: 'Prediction',
    title: 'Vainqueur Ligue des Champions 2025',
    subtitle: 'Prédisez le champion',
    seasonalType: 'ChampionsLeague',
    outcomes: ['Real Madrid', 'Manchester City', 'Bayern Munich'],
    chzPot: 5000,
    usdcPot: 2000,
    entryFeeCHZ: 10,
    insuranceFee: 20,
    minFanTokens: 2000,
    freeInsuranceThreshold: 5000,
    deadline: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 semaine
    participants: 120,
    protectionTriggered: false,
    isResolved: false,
    rewardMultiplier: 2.4,
  },
  {
    id: 0,
    type: 'Raffle',
    title: 'Maillot Signé NFT',
    subtitle: 'Partenaire Exclusif',
    requiredFanTokens: 1000,
    requiredPoints: 500,
    tier: 'Premium',
    deadline: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 jours
    isResolved: false,
  },
  {
    id: 0,
    type: 'Duel',
    title: 'PSG vs. Bayern',
    subtitle: 'Match de Football',
    outcomes: ['PSG Gagne', 'Bayern Gagne', 'Match Nul'],
    potTotal: 1000,
    deadline: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 jours
    isResolved: false,
    isCanceled: false,
    arenaEligible: true,
  },
];

export const mockUserProfile = {
  address: '0x123...456',
  fanTokens: 5000,
  points: 1000,
  chzBalance: 1000,
  usdcBalance: 1000,
  achievements: ['Survivant de la Volatilité', 'Premier Pari'],
  seasonalRank: 'Diamant',
  totalWinnings: 500,
  protectionTriggered: 1,
  winStreak: 3,
};
