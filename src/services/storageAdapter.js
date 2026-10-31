/**
 * Resilient Storage & Auth Adapter for Block Blast
 * Transparently supports Cloud Firestore / Firebase Auth, or seamless localStorage fallback.
 */

import {
  auth,
  db,
  isFirebaseAvailable,
  fbSignInAnonymously,
  fbSignInWithEmail,
  fbCreateUserWithEmail,
  fbSignOut,
  fbOnAuthStateChanged,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from './firebase';

const LOCAL_STORAGE_SCORES_KEY = 'block_blast_scores_v1';
const LOCAL_STORAGE_USER_KEY = 'block_blast_demo_user';
const LOCAL_STORAGE_HIGH_SCORE_KEY = 'block_blast_high_score';

/**
 * Returns current high score from localStorage
 * @returns {number}
 */
export function getStoredHighScore() {
  try {
    const val = localStorage.getItem(LOCAL_STORAGE_HIGH_SCORE_KEY);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

/**
 * Updates stored high score in localStorage
 * @param {number} score
 */
export function setStoredHighScore(score) {
  try {
    const current = getStoredHighScore();
    if (score > current) {
      localStorage.setItem(LOCAL_STORAGE_HIGH_SCORE_KEY, String(score));
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to update stored high score', err);
  }
}

/**
 * Signs in anonymously as a guest
 * @returns {Promise<{ uid: string, displayName: string, isAnonymous: boolean }>}
 */
export async function signInGuest() {
  if (isFirebaseAvailable && auth) {
    try {
      const userCred = await fbSignInAnonymously(auth);
      return {
        uid: userCred.user.uid,
        displayName: userCred.user.displayName || `Guest ${userCred.user.uid.slice(0, 5)}`,
        isAnonymous: true,
      };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Firebase guest login failed, falling back to local demo user:', err.message);
    }
  }

  // Local fallback
  let demoUser;
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (cached) {
      demoUser = JSON.parse(cached);
    }
  } catch {
    // ignore
  }

  if (!demoUser) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    demoUser = {
      uid: `guest_${Date.now()}_${randomSuffix}`,
      displayName: `Guest #${randomSuffix}`,
      isAnonymous: true,
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoUser));
    } catch {
      // ignore
    }
  }

  return demoUser;
}

/**
 * Signs in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ uid: string, displayName: string, email: string, isAnonymous: boolean }>}
 */
export async function signInEmail(email, password) {
  if (isFirebaseAvailable && auth) {
    try {
      const userCred = await fbSignInWithEmail(auth, email, password);
      return {
        uid: userCred.user.uid,
        displayName: userCred.user.displayName || email.split('@')[0],
        email: userCred.user.email,
        isAnonymous: false,
      };
    } catch (err) {
      throw new Error(err.message || 'Firebase login failed');
    }
  }

  // Local Demo Authentication
  if (!email || !password || password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const demoUser = {
    uid: `user_${btoa(email).slice(0, 10)}`,
    displayName: email.split('@')[0],
    email,
    isAnonymous: false,
  };

  try {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoUser));
  } catch {
    // ignore
  }

  return demoUser;
}

/**
 * Registers with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ uid: string, displayName: string, email: string, isAnonymous: boolean }>}
 */
export async function signUpEmail(email, password) {
  if (isFirebaseAvailable && auth) {
    try {
      const userCred = await fbCreateUserWithEmail(auth, email, password);
      return {
        uid: userCred.user.uid,
        displayName: email.split('@')[0],
        email: userCred.user.email,
        isAnonymous: false,
      };
    } catch (err) {
      throw new Error(err.message || 'Firebase sign up failed');
    }
  }

  return signInEmail(email, password);
}

/**
 * Signs out active user
 */
export async function signOut() {
  if (isFirebaseAvailable && auth) {
    try {
      await fbSignOut(auth);
    } catch {
      // ignore
    }
  }

  try {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  } catch {
    // ignore
  }
}

/**
 * Attaches auth state change listener
 * @param {(user: any) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function subscribeToAuth(callback) {
  if (isFirebaseAvailable && auth) {
    return fbOnAuthStateChanged(auth, (user) => {
      if (user) {
        callback({
          uid: user.uid,
          displayName: user.displayName || (user.isAnonymous ? `Guest #${user.uid.slice(0, 4)}` : user.email?.split('@')[0]),
          email: user.email,
          isAnonymous: user.isAnonymous,
        });
      } else {
        callback(null);
      }
    });
  }

  // Local storage observer
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (cached) {
      callback(JSON.parse(cached));
    } else {
      callback(null);
    }
  } catch {
    callback(null);
  }

  return () => {};
}

/**
 * Saves game score record to Cloud Firestore and local storage
 * @param {{
 *   userId: string,
 *   userDisplayName: string,
 *   score: number,
 *   maxCombo: number,
 *   linesCleared: number,
 *   piecesPlaced: number
 * }} scoreData
 * @returns {Promise<string>}
 */
export async function saveScore(scoreData) {
  const record = {
    ...scoreData,
    createdAt: Date.now(),
    id: `score_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  };

  // Always update local high score
  setStoredHighScore(record.score);

  // Update local scores list
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SCORES_KEY) || '[]');
    existing.push(record);
    existing.sort((a, b) => b.score - a.score);
    localStorage.setItem(LOCAL_STORAGE_SCORES_KEY, JSON.stringify(existing.slice(0, 50)));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to write score to localStorage:', err);
  }

  // Attempt Cloud Firestore save if available
  if (isFirebaseAvailable && db) {
    try {
      const docRef = await addDoc(collection(db, 'block_blast_scores'), record);
      return docRef.id;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Firestore score write fallback to local storage:', err.message);
    }
  }

  return record.id;
}

/**
 * Fetches top high scores for the leaderboard
 * @param {number} limitCount
 * @returns {Promise<Array<any>>}
 */
export async function fetchTopScores(limitCount = 10) {
  if (isFirebaseAvailable && db) {
    try {
      const scoresQuery = query(
        collection(db, 'block_blast_scores'),
        orderBy('score', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(scoresQuery);
      const cloudScores = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      if (cloudScores.length > 0) {
        return cloudScores;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Firestore score fetch failed, returning local leaderboard:', err.message);
    }
  }

  // Fallback to local storage
  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SCORES_KEY) || '[]');
    return local.slice(0, limitCount);
  } catch {
    return [];
  }
}
