
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { UserStats } from "../types";

import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};

export const signInWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    return result.user;
  } catch (error) {
    console.error("Facebook login error:", error);
    throw error;
  }
};

export const logout = () => signOut(auth);

export const reconcileStats = (local: UserStats, cloud: UserStats): UserStats => {
  if (cloud.level > local.level) return cloud;
  if (local.level > cloud.level) return local;
  return {
    ...local,
    coins: Math.max(local.coins, cloud.coins),
    stars: Math.max(local.stars, cloud.stars),
    hearts: local.hearts,
    hintsFreeze: Math.max(local.hintsFreeze, cloud.hintsFreeze),
    levelStars: { ...(cloud.levelStars || {}), ...(local.levelStars || {}) }
  };
};

/**
 * Kullanıcı verilerini ve liderlik tablosu skorunu senkronize et
 */
export const syncUserStats = async (uid: string, stats: UserStats, displayName: string, photoURL: string): Promise<void> => {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, "users", uid);
    const score = (stats.level * 1000) + (stats.stars * 50) + Math.floor(stats.coins / 10);
    
    // Batch işlemine gerek yok, setDoc merge yeterli
    await setDoc(userDocRef, { ...stats, updatedAt: Date.now() }, { merge: true });
    
    // Liderlik tablosu güncelleme
    const leaderRef = doc(db, "leaderboard", uid);
    await setDoc(leaderRef, {
      name: displayName || "Gezgin",
      score: score,
      photo: photoURL || "",
      level: stats.level,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const fetchCloudStats = async (uid: string): Promise<UserStats | null> => {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserStats;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
  return null;
};
