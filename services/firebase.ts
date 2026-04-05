
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser, Auth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  Firestore,
  initializeFirestore, 
  persistentLocalCache,
  updateDoc 
} from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { Project, SavedStory, NovelSettings } from '../types.ts';

const firebaseConfig = {
  apiKey: "AIzaSyA6LdNrWRS_-75LYtJDx8Br-TEYaujGVcM", 
  authDomain: "ainovel-ec773.firebaseapp.com",
  projectId: "ainovel-ec773",
  storageBucket: "ainovel-ec773.firebasestorage.app",
  messagingSenderId: "785236614672",
  appId: "1:785236614672:web:d6529080979fb5bbfc3495",
  measurementId: "G-HEN9Y0M48E"
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: undefined })
    });

    if (typeof window !== 'undefined') {
        getAnalytics(app);
    }
} catch (error) {
    console.error("Firebase initialization error", error);
}

// --- Error Handling Spec for Firestore Operations ---
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

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  
  // Check for resource-exhausted error (Quota exceeded)
  if (errInfo.error.includes('resource-exhausted') || errInfo.error.includes('Quota exceeded')) {
    if (quotaExceededCallback) quotaExceededCallback();
  }
  
  throw new Error(JSON.stringify(errInfo));
};

// --- Quota / Error Handling ---
let quotaExceededCallback: (() => void) | null = null;
export const setQuotaExceededCallback = (cb: () => void) => {
  quotaExceededCallback = cb;
};

// Helper to remove undefined values which Firestore rejects
const sanitizeData = <T>(data: T): T => {
  return JSON.parse(JSON.stringify(data));
};

// --- Auth Functions ---
export const signInWithGoogle = async () => {
  if (!auth) return;
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error signing in", error);
    throw error;
  }
};

export const signOut = async () => {
  if (!auth) return;
  try {
      await firebaseSignOut(auth);
  } catch (error) {
      console.error("Error signing out", error);
      throw error;
  }
};

export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
  if (!auth) {
      callback(null);
      return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// --- Firestore Functions ---
export const saveProjectToFirestore = async (userId: string, project: Project) => {
  if (!db) return;
  const path = `users/${userId}/projects/${project.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'projects', project.id), sanitizeData(project));
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
};

export const deleteProjectFromFirestore = async (userId: string, projectId: string) => {
  if (!db) return;
  const path = `users/${userId}/projects/${projectId}`;
  try {
    await updateDoc(doc(db, 'users', userId, 'projects', projectId), { deletedAt: Date.now() });
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, path);
  }
};

export const restoreProjectToFirestore = async (userId: string, projectId: string) => {
  if (!db) return;
  const path = `users/${userId}/projects/${projectId}`;
  try {
    await updateDoc(doc(db, 'users', userId, 'projects', projectId), { deletedAt: null });
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, path);
  }
};

export const permanentDeleteProjectFromFirestore = async (userId: string, projectId: string) => {
  if (!db) return;
  const path = `users/${userId}/projects/${projectId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'projects', projectId));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
};

export const saveStoryToFirestore = async (userId: string, story: SavedStory) => {
  if (!db) return;
  const path = `users/${userId}/stories/${story.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'stories', story.id), sanitizeData(story));
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
};

export const deleteStoryFromFirestore = async (userId: string, storyId: string) => {
  if (!db) return;
  const path = `users/${userId}/stories/${storyId}`;
  try {
    await updateDoc(doc(db, 'users', userId, 'stories', storyId), { deletedAt: Date.now() });
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, path);
  }
};

export const restoreStoryToFirestore = async (userId: string, storyId: string) => {
  if (!db) return;
  const path = `users/${userId}/stories/${storyId}`;
  try {
    await updateDoc(doc(db, 'users', userId, 'stories', storyId), { deletedAt: null });
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, path);
  }
};

export const permanentDeleteStoryFromFirestore = async (userId: string, storyId: string) => {
  if (!db) return;
  const path = `users/${userId}/stories/${storyId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'stories', storyId));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
};

export const subscribeToUserData = (
  userId: string, 
  onProjectsUpdate: (projects: Project[]) => void,
  onStoriesUpdate: (stories: SavedStory[]) => void
) => {
  if (!db) return () => {};

  const qProjects = query(collection(db, 'users', userId, 'projects'), orderBy('createdAt', 'desc'));
  const unsubProjects = onSnapshot(qProjects, (snapshot) => {
    const projects = snapshot.docs.map(doc => doc.data() as Project);
    onProjectsUpdate(projects);
  }, (e) => handleFirestoreError(e, OperationType.GET, `users/${userId}/projects`));

  const qStories = query(collection(db, 'users', userId, 'stories'), orderBy('createdAt', 'desc'));
  const unsubStories = onSnapshot(qStories, (snapshot) => {
    const stories = snapshot.docs.map(doc => doc.data() as SavedStory);
    onStoriesUpdate(stories);
  }, (e) => handleFirestoreError(e, OperationType.GET, `users/${userId}/stories`));

  return () => {
    unsubProjects();
    unsubStories();
  };
};

export const saveUserGlobalSettings = async (userId: string, settings: NovelSettings) => {
  if (!db) return;
  const path = `users/${userId}/settings/global`;
  try {
    await setDoc(doc(db, 'users', userId, 'settings', 'global'), sanitizeData(settings));
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
};

export const subscribeToGlobalSettings = (
  userId: string,
  onUpdate: (settings: NovelSettings) => void
) => {
  if (!db) return () => {};
  return onSnapshot(doc(db, 'users', userId, 'settings', 'global'), (doc) => {
    if (doc.exists()) {
      onUpdate(doc.data() as NovelSettings);
    }
  }, (e) => handleFirestoreError(e, OperationType.GET, `users/${userId}/settings/global`));
};

export type { FirebaseUser as User };
