import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';

export interface SavedResearchNote {
  id: string;
  userId: string;
  companyTicker: string;
  companyName: string;
  question: string;
  response: string;
  sourceCitations?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedCustomScenario {
  id: string;
  userId: string;
  companyTicker: string;
  scenarioName: string;
  revenueGrowthChange: number;
  operatingMarginChange: number;
  interestExpenseChange: number;
  taxRateChange: number;
  capexChange: number;
  impliedSharePrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistRecord {
  companyTicker: string;
  companyName: string;
  targetPrice?: number;
  notes?: string;
  addedAt: string;
}

// 1. Research Notes
export async function saveResearchNote(userId: string, note: Omit<SavedResearchNote, 'userId'>): Promise<void> {
  const path = `users/${userId}/research_notes/${note.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'research_notes', note.id);
    await setDoc(docRef, {
      ...note,
      userId,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getResearchNotes(userId: string): Promise<SavedResearchNote[]> {
  const path = `users/${userId}/research_notes`;
  try {
    const colRef = collection(db, 'users', userId, 'research_notes');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => doc.data() as SavedResearchNote);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// 2. Custom Scenarios
export async function saveCustomScenario(userId: string, scenario: Omit<SavedCustomScenario, 'userId'>): Promise<void> {
  const path = `users/${userId}/custom_scenarios/${scenario.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'custom_scenarios', scenario.id);
    await setDoc(docRef, {
      ...scenario,
      userId,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getCustomScenarios(userId: string): Promise<SavedCustomScenario[]> {
  const path = `users/${userId}/custom_scenarios`;
  try {
    const colRef = collection(db, 'users', userId, 'custom_scenarios');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => doc.data() as SavedCustomScenario);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// 3. Watchlist
export async function saveWatchlistItem(userId: string, item: WatchlistRecord): Promise<void> {
  const path = `users/${userId}/watchlist/${item.companyTicker}`;
  try {
    const docRef = doc(db, 'users', userId, 'watchlist', item.companyTicker);
    await setDoc(docRef, item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteWatchlistItem(userId: string, ticker: string): Promise<void> {
  const path = `users/${userId}/watchlist/${ticker}`;
  try {
    const docRef = doc(db, 'users', userId, 'watchlist', ticker);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getWatchlist(userId: string): Promise<WatchlistRecord[]> {
  const path = `users/${userId}/watchlist`;
  try {
    const colRef = collection(db, 'users', userId, 'watchlist');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => doc.data() as WatchlistRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}
