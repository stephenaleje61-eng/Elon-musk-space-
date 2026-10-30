export type SectionId =
  | 'tesla'
  | 'robotics'
  | 'spacex'
  | 'starlink'
  | 'ai'
  | 'neuralink'
  | 'boring'
  | 'x'
  | 'investment';

export interface SectionMeta {
  id: SectionId;
  number: number;
  title: string;
  shortTitle: string;
  tagline: string;
  iconName: string;
  bannerImage: string;
  subcategories: string[];
  description: string;
}

export interface ProductItem {
  id: string;
  title: string;
  sectionId: SectionId;
  subcategory: string;
  price: number;
  currency: string;
  priceFormatted?: string;
  summary: string;
  description: string;
  images: string[];
  specs: Record<string, string>;
  inStock: boolean;
  stockStatus: string;
  isFeatured?: boolean;
  deliveryTime?: string;
  orderType?: 'instant' | 'custom_order' | 'quote' | 'reserve';
  officialLink?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  sectionId: SectionId;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  coverImage: string;
  readTime: string;
  isFeatured?: boolean;
  publishedAt: string;
  createdAt: string;
  keyTakeaways?: string[];
}

export interface ConversationItem {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorEmail?: string;
  isAnonymous: boolean;
  lastMessage: string;
  lastMessageAt: string;
  unreadUserCount: number;
  unreadAdminCount: number;
  status: 'active' | 'blocked' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'visitor' | 'admin';
  senderName?: string;
  text: string;
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;
  failed?: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  isAnonymous: boolean;
  role: 'user' | 'admin';
  createdAt: string;
  photoURL?: string;
}

export interface SavedItemRecord {
  id: string;
  userId: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImage: string;
  sectionId: SectionId;
  createdAt: string;
}

export interface WatchlistRecord {
  id: string;
  userId: string;
  symbol: string;
  companyName: string;
  targetPrice?: number;
  notes?: string;
  createdAt: string;
}

export interface ReportRecord {
  id: string;
  reporterId: string;
  conversationId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
}

export interface AdminAuditRecord {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetId?: string;
  details: string;
  timestamp: string;
}
