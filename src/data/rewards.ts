export const loginRewards = [
  { amount: 50, type: "CREDITS" },
  { amount: 100, type: "XP" },
  { amount: 50, type: "CREDITS" },
  { amount: 100, type: "XP" },
  { amount: null, type: "" },
  { amount: 100, type: "XP" },
  { amount: 50, type: "CREDITS" },
];
export const rewardLabels = loginRewards.map((reward) =>
  reward.amount === null ? null : `${reward.amount} ${reward.type}`,
);
