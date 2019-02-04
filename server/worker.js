import Queue from "bee-queue";

export const cleric = new Queue("gun-cleric", {
  redis: { db: 1 },
  removeOnSuccess: true,
  removeOnFailure: true
});
