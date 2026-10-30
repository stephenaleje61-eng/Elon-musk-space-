import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  ProductItem,
  ArticleItem,
  AdminAuditRecord,
  ReportRecord,
  UserProfile,
} from './types';
import { handleFirestoreError, OperationType } from './database';

/**
 * Log administrative operations for compliance and security audit trail
 */
export async function logAdminAction(
  action: string,
  targetId?: string,
  details: string = ''
): Promise<void> {
  const adminUser = auth.currentUser;
  const logId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  try {
    const record: AdminAuditRecord = {
      id: logId,
      adminId: adminUser?.uid || 'system_admin',
      adminEmail: adminUser?.email || 'admin@elonmuskspace.internal',
      action,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    };
    await setDoc(doc(db, 'adminAuditLogs', logId), record);
  } catch (err) {
    console.warn('Audit logging note:', err);
  }
}

/**
 * Create or update a product in Firestore
 */
export async function saveProduct(product: ProductItem): Promise<ProductItem> {
  const path = `products/${product.id}`;
  try {
    const dataToSave = {
      ...product,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'products', product.id), dataToSave, { merge: true });
    await logAdminAction('SAVE_PRODUCT', product.id, `Saved product: ${product.title}`);
    return dataToSave;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
    await logAdminAction('DELETE_PRODUCT', productId, `Deleted product ${productId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Toggle featured state of a product
 */
export async function toggleProductFeatured(productId: string, isFeatured: boolean): Promise<void> {
  const path = `products/${productId}`;
  try {
    await updateDoc(doc(db, 'products', productId), {
      isFeatured,
      updatedAt: new Date().toISOString(),
    });
    await logAdminAction(
      'TOGGLE_FEATURED',
      productId,
      `Product featured status changed to ${isFeatured}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Create or update an article in Firestore
 */
export async function saveArticle(article: ArticleItem): Promise<ArticleItem> {
  const path = `articles/${article.id}`;
  try {
    const dataToSave = {
      ...article,
      createdAt: article.createdAt || new Date().toISOString(),
    };
    await setDoc(doc(db, 'articles', article.id), dataToSave, { merge: true });
    await logAdminAction('SAVE_ARTICLE', article.id, `Saved article: ${article.title}`);
    return dataToSave;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete an article
 */
export async function deleteArticle(articleId: string): Promise<void> {
  const path = `articles/${articleId}`;
  try {
    await deleteDoc(doc(db, 'articles', articleId));
    await logAdminAction('DELETE_ARTICLE', articleId, `Deleted article ${articleId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Get reports list
 */
export async function getReports(): Promise<ReportRecord[]> {
  try {
    const snap = await getDocs(query(collection(db, 'reports'), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => d.data() as ReportRecord);
  } catch (error) {
    console.warn('Error fetching reports:', error);
    return [];
  }
}

/**
 * Update report status
 */
export async function updateReportStatus(
  reportId: string,
  status: 'pending' | 'reviewed' | 'dismissed'
): Promise<void> {
  try {
    await updateDoc(doc(db, 'reports', reportId), { status });
    await logAdminAction('UPDATE_REPORT', reportId, `Report status updated to ${status}`);
  } catch (err) {
    console.warn('Report update note:', err);
  }
}

/**
 * Get recent audit logs
 */
export async function getAuditLogs(): Promise<AdminAuditRecord[]> {
  try {
    const snap = await getDocs(
      query(collection(db, 'adminAuditLogs'), orderBy('timestamp', 'desc'), limit(50))
    );
    return snap.docs.map((d) => d.data() as AdminAuditRecord);
  } catch (error) {
    console.warn('Error fetching audit logs:', error);
    return [];
  }
}

/**
 * Get all registered / anonymous visitors for analytics
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(query(collection(db, 'users'), limit(50)));
    return snap.docs.map((d) => d.data() as UserProfile);
  } catch (error) {
    console.warn('Error fetching users:', error);
    return [];
  }
}
