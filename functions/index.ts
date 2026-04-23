
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const validateAndSyncStats = functions.https.onCall(async (data, context) => {
  // 1. Auth Check
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }

  const uid = context.auth.uid;
  const { sessionCoinsEarned, starsEarned, levelCompleted } = data;

  // 2. Validation
  // Max possible coins per level is ~1500 (1000 puzzle + 500 bonus)
  if (typeof sessionCoinsEarned !== "number" || sessionCoinsEarned < 0 || sessionCoinsEarned > 1500) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid sessionCoinsEarned value.");
  }

  if (typeof starsEarned !== "number" || starsEarned < 0 || starsEarned > 3) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid starsEarned value.");
  }

  if (typeof levelCompleted !== "boolean") {
    throw new functions.https.HttpsError("invalid-argument", "Invalid levelCompleted format.");
  }

  const db = admin.firestore();
  const userRef = db.collection("users").doc(uid);
  const leaderRef = db.collection("leaderboard").doc(uid);

  try {
    return await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new functions.https.HttpsError("not-found", "User document does not exist.");
      }

      const userData = userDoc.data()!;
      const newCoins = userData.coins + sessionCoinsEarned;
      const newLevel = levelCompleted ? userData.level + 1 : userData.level;
      
      // Stars logic: only add if current level stars is improved (simple version for brevity)
      // In a real app we'd track stars per level
      const newStars = userData.stars + starsEarned; 

      const updateData = {
        coins: newCoins,
        level: newLevel,
        stars: newStars,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      transaction.update(userRef, updateData);

      // Sync Leaderboard
      const score = (newLevel * 1000) + (newStars * 50) + Math.floor(newCoins / 10);
      transaction.set(leaderRef, {
        score: score,
        level: newLevel,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      return { success: true, newStats: updateData };
    });
  } catch (error) {
    console.error("Transaction failed: ", error);
    throw new functions.https.HttpsError("internal", "Failed to sync stats.");
  }
});
