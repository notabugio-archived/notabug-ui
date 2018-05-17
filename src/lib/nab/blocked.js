export const blockedSouls = [
];

export const blockedMap = blockedSouls.reduce((souls, soul) => ({ ...souls, [soul]: true }), {});
