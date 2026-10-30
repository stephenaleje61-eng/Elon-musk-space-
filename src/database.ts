import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  ProductItem,
  ArticleItem,
  SectionId,
  SavedItemRecord,
  WatchlistRecord,
  ReportRecord,
} from './types';
import { INITIAL_PRODUCTS, INITIAL_ARTICLES } from './defaultData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error context:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Memory cache as fallback in case of transient offline state
let cachedProducts: ProductItem[] = [];
let cachedArticles: ArticleItem[] = [];

// Ensure Firestore has initial products & articles seeded permanently
export async function seedInitialFirestoreData(): Promise<void> {
  try {
    const productsRef = collection(db, 'products');
    const snap = await getDocs(query(productsRef, limit(1)));
    if (snap.empty) {
      console.log('Seeding initial marketplace catalog to Firestore...');
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
      for (const art of INITIAL_ARTICLES) {
        await setDoc(doc(db, 'articles', art.id), art);
      }
      console.log('Seeding complete.');
    }
  } catch (err) {
    // If permission or network prevents seeding, we still have memory fallback
    console.warn('Note on Firestore seeding probe:', err);
  }
}

// Fetch all products or filter by section
export async function getProducts(
  sectionId?: SectionId,
  searchQuery?: string
): Promise<ProductItem[]> {
  const path = 'products';
  try {
    const productsRef = collection(db, path);
    let q = query(productsRef);
    if (sectionId) {
      q = query(productsRef, where('sectionId', '==', sectionId));
    }
    const snap = await getDocs(q);
    let items: ProductItem[] = [];
    if (!snap.empty) {
      items = snap.docs.map((d) => d.data() as ProductItem);
    } else {
      items = sectionId
        ? INITIAL_PRODUCTS.filter((p) => p.sectionId === sectionId)
        : [...INITIAL_PRODUCTS];
    }
    cachedProducts = items;

    if (searchQuery && searchQuery.trim().length > 0) {
      const qLower = searchQuery.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(qLower) ||
          p.summary.toLowerCase().includes(qLower) ||
          p.subcategory.toLowerCase().includes(qLower) ||
          p.description.toLowerCase().includes(qLower)
      );
    }
    return items;
  } catch (error) {
    console.warn('Falling back to local data on Firestore getProducts error:', error);
    let items = sectionId
      ? INITIAL_PRODUCTS.filter((p) => p.sectionId === sectionId)
      : [...INITIAL_PRODUCTS];
    if (searchQuery && searchQuery.trim().length > 0) {
      const qLower = searchQuery.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(qLower) ||
          p.summary.toLowerCase().includes(qLower) ||
          p.subcategory.toLowerCase().includes(qLower) ||
          p.description.toLowerCase().includes(qLower)
      );
    }
    return items;
  }
}

// Get single product
export async function getProductById(id: string): Promise<ProductItem | null> {
  const path = `products/${id}`;
  try {
    const snap = await getDoc(doc(db, 'products', id));
    if (snap.exists()) {
      return snap.data() as ProductItem;
    }
    // Check fallback
    return INITIAL_PRODUCTS.find((p) => p.id === id) || null;
  } catch (error) {
    console.warn('Error reading product by id, using fallback:', error);
    return INITIAL_PRODUCTS.find((p) => p.id === id) || null;
  }
}

// Fetch articles
export async function getArticles(sectionId?: SectionId): Promise<ArticleItem[]> {
  const path = 'articles';
  try {
    const articlesRef = collection(db, path);
    let q = query(articlesRef);
    if (sectionId) {
      q = query(articlesRef, where('sectionId', '==', sectionId));
    }
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items = snap.docs.map((d) => d.data() as ArticleItem);
      cachedArticles = items;
      return items;
    }
    return sectionId
      ? INITIAL_ARTICLES.filter((a) => a.sectionId === sectionId)
      : [...INITIAL_ARTICLES];
  } catch (error) {
    console.warn('Error fetching articles, using default articles:', error);
    return sectionId
      ? INITIAL_ARTICLES.filter((a) => a.sectionId === sectionId)
      : [...INITIAL_ARTICLES];
  }
}

// Get single article
export async function getArticleById(id: string): Promise<ArticleItem | null> {
  try {
    const snap = await getDoc(doc(db, 'articles', id));
    if (snap.exists()) {
      return snap.data() as ArticleItem;
    }
    return INITIAL_ARTICLES.find((a) => a.id === id) || null;
  } catch {
    return INITIAL_ARTICLES.find((a) => a.id === id) || null;
  }
}

// Bookmark / Saved items
export async function saveItem(userId: string, product: ProductItem): Promise<void> {
  const saveId = `${userId}_${product.id}`;
  const path = `savedItems/${saveId}`;
  try {
    const record: SavedItemRecord = {
      id: saveId,
      userId,
      productId: product.id,
      productTitle: product.title,
      productPrice: product.price,
      productImage: product.images[0] || '',
      sectionId: product.sectionId,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'savedItems', saveId), record);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeSavedItem(userId: string, productId: string): Promise<void> {
  const saveId = `${userId}_${productId}`;
  const path = `savedItems/${saveId}`;
  try {
    await deleteDoc(doc(db, 'savedItems', saveId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getSavedItems(userId: string): Promise<SavedItemRecord[]> {
  const path = 'savedItems';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SavedItemRecord);
  } catch (error) {
    console.warn('Error fetching saved items:', error);
    return [];
  }
}

// Investment Watchlist
export async function addToWatchlist(
  userId: string,
  symbol: string,
  companyName: string,
  targetPrice?: number,
  notes?: string
): Promise<WatchlistRecord> {
  const watchId = `watch_${userId}_${symbol.toUpperCase()}`;
  const path = `investmentWatchlists/${watchId}`;
  try {
    const record: Record<string, any> = {
      id: watchId,
      userId,
      symbol: symbol.toUpperCase(),
      companyName,
      createdAt: new Date().toISOString(),
    };
    if (typeof targetPrice === 'number' && !isNaN(targetPrice)) {
      record.targetPrice = targetPrice;
    }
    if (notes && notes.trim()) {
      record.notes = notes.trim();
    }
    await setDoc(doc(db, 'investmentWatchlists', watchId), record);
    return record as WatchlistRecord;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getWatchlist(userId: string): Promise<WatchlistRecord[]> {
  const path = 'investmentWatchlists';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as WatchlistRecord);
  } catch (error) {
    console.warn('Error fetching watchlist:', error);
    return [];
  }
}

export async function removeFromWatchlist(watchId: string): Promise<void> {
  const path = `investmentWatchlists/${watchId}`;
  try {
    await deleteDoc(doc(db, 'investmentWatchlists', watchId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Content / Conversation reporting
export async function submitReport(
  reporterId: string,
  conversationId: string,
  reason: string
): Promise<void> {
  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const path = `reports/${reportId}`;
  try {
    const record: ReportRecord = {
      id: reportId,
      reporterId,
      conversationId,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'reports', reportId), record);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
