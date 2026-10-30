import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Star,
  MessageSquare,
  FileText,
  Upload,
  Shield,
  ShieldAlert,
  Users,
  Activity,
  CheckCircle2,
  Lock,
  Loader2,
  Send,
  Flag,
} from 'lucide-react';
import {
  ProductItem,
  ArticleItem,
  ConversationItem,
  ChatMessageItem,
  UserProfile,
  SectionId,
  ReportRecord,
  AdminAuditRecord,
} from '../types';
import { SECTIONS } from '../defaultData';
import {
  saveProduct,
  deleteProduct,
  toggleProductFeatured,
  saveArticle,
  deleteArticle,
  getReports,
  updateReportStatus,
  getAuditLogs,
  getAllUsers,
} from '../adminService';
import { getAllConversations, subscribeToMessages, sendMessage } from '../chatService';
import { uploadImage } from '../storage';
import { ADMIN_EMAIL } from '../auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface AdminDashboardProps {
  currentUser: UserProfile | null;
  products: ProductItem[];
  articles: ArticleItem[];
  onRefreshData: () => void;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  products,
  articles,
  onRefreshData,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    'products' | 'articles' | 'chats' | 'reports' | 'users' | 'audit'
  >('products');

  // Admin access gate: checks if current user is admin OR developer email
  const isAdminUser =
    currentUser?.role === 'admin' ||
    currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const [adminPasscode, setAdminPasscode] = useState('');
  const [passcodeUnlocked, setPasscodeUnlocked] = useState(isAdminUser);

  // Product Form State
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodTitle, setProdTitle] = useState('');
  const [prodSection, setProdSection] = useState<SectionId>('tesla');
  const [prodSubcategory, setProdSubcategory] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(0);
  const [prodPriceFormatted, setProdPriceFormatted] = useState('');
  const [prodSummary, setProdSummary] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodInStock, setProdInStock] = useState(true);
  const [prodStockStatus, setProdStockStatus] = useState('In Stock');
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [isUploadingProdImage, setIsUploadingProdImage] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);

  // Article Form State
  const [isEditingArticle, setIsEditingArticle] = useState(false);
  const [artTitle, setArtTitle] = useState('');
  const [artSection, setArtSection] = useState<SectionId>('spacex');
  const [artCategory, setArtCategory] = useState('');
  const [artExcerpt, setArtExcerpt] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artAuthor, setArtAuthor] = useState('Platform Engineering Team');
  const [artCoverImage, setArtCoverImage] = useState('');
  const [artReadTime, setArtReadTime] = useState('5 min read');

  // Chats in Admin
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationItem | null>(null);
  const [adminMessages, setAdminMessages] = useState<ChatMessageItem[]>([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [sendingAdminReply, setSendingAdminReply] = useState(false);

  // Reports, Users, Logs
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditRecord[]>([]);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    if (passcodeUnlocked) {
      loadAdminData();
    }
  }, [passcodeUnlocked, activeTab]);

  const loadAdminData = async () => {
    if (activeTab === 'chats') {
      const convs = await getAllConversations();
      setConversations(convs);
    } else if (activeTab === 'reports') {
      const reps = await getReports();
      setReports(reps);
    } else if (activeTab === 'users') {
      const u = await getAllUsers();
      setUsersList(u);
    } else if (activeTab === 'audit') {
      const logs = await getAuditLogs();
      setAuditLogs(logs);
    }
  };

  // Subscribe to selected conversation in admin
  useEffect(() => {
    if (!selectedConv) return;
    const unsubscribe = subscribeToMessages(selectedConv.id, (msgs) => {
      setAdminMessages(msgs);
    });
    return () => unsubscribe();
  }, [selectedConv]);

  // Handle Passcode Unlock for testing if not already admin
  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode.trim() === 'elon2026' || adminPasscode.trim() === 'admin123') {
      if (currentUser) {
        try {
          await setDoc(doc(db, 'admins', currentUser.uid), {
            role: 'superadmin',
            passcode: 'elon2026',
            grantedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (err) {
          console.warn('Note on admin doc setup:', err);
        }
      }
      setPasscodeUnlocked(true);
    } else {
      alert('Invalid administrator authorization key.');
    }
  };

  // Image upload to Firebase Storage
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingProdImage(true);
    try {
      const url = await uploadImage(file, 'products', (pct) => setUploadPercent(pct));
      setProdImages([...prodImages, url]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      alert(`Upload note: ${message}`);
    } finally {
      setIsUploadingProdImage(false);
      setUploadPercent(0);
    }
  };

  // Save product to Firestore
  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle.trim()) return;

    setLoadingAction(true);
    try {
      const prodId = editingProductId || `prod_${prodSection}_${Date.now()}`;
      const item: ProductItem = {
        id: prodId,
        title: prodTitle.trim(),
        sectionId: prodSection,
        subcategory: prodSubcategory.trim() || 'General',
        price: prodPrice || 0,
        currency: 'USD',
        priceFormatted: prodPriceFormatted || `$${prodPrice.toLocaleString()}`,
        summary: prodSummary.trim(),
        description: prodDescription.trim(),
        images:
          prodImages.length > 0
            ? prodImages
            : ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=800'],
        specs: {
          'System Status': 'Verified Operational',
          'Sector Classification': prodSection.toUpperCase(),
        },
        inStock: prodInStock,
        stockStatus: prodStockStatus || (prodInStock ? 'In Stock' : 'Pre-Order'),
        isFeatured: prodIsFeatured,
        createdAt: new Date().toISOString(),
      };

      await saveProduct(item);
      onRefreshData();
      setIsEditingProduct(false);
      resetProductForm();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product to Firestore.');
    } finally {
      setLoadingAction(false);
    }
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProdTitle('');
    setProdSubcategory('');
    setProdPrice(0);
    setProdPriceFormatted('');
    setProdSummary('');
    setProdDescription('');
    setProdImages([]);
    setProdInStock(true);
    setProdStockStatus('In Stock');
    setProdIsFeatured(false);
  };

  const handleEditProductClick = (prod: ProductItem) => {
    setEditingProductId(prod.id);
    setProdTitle(prod.title);
    setProdSection(prod.sectionId);
    setProdSubcategory(prod.subcategory);
    setProdPrice(prod.price);
    setProdPriceFormatted(prod.priceFormatted || `$${prod.price.toLocaleString()}`);
    setProdSummary(prod.summary);
    setProdDescription(prod.description);
    setProdImages(prod.images || []);
    setProdInStock(prod.inStock);
    setProdStockStatus(prod.stockStatus);
    setProdIsFeatured(!!prod.isFeatured);
    setIsEditingProduct(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      await deleteProduct(id);
      onRefreshData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Article Publish
  const handleSaveArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle.trim()) return;

    setLoadingAction(true);
    try {
      const artId = `art_${artSection}_${Date.now()}`;
      const item: ArticleItem = {
        id: artId,
        title: artTitle.trim(),
        sectionId: artSection,
        category: artCategory.trim() || 'Technical Dispatch',
        excerpt: artExcerpt.trim(),
        content: artContent.trim(),
        author: artAuthor.trim(),
        coverImage:
          artCoverImage.trim() ||
          'https://images.unsplash.com/photo-1517976487502-5f65f126c888?q=80&w=1000',
        readTime: artReadTime.trim() || '5 min read',
        isFeatured: true,
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await saveArticle(item);
      onRefreshData();
      setIsEditingArticle(false);
      setArtTitle('');
      setArtExcerpt('');
      setArtContent('');
    } catch (err) {
      console.error('Error saving article:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  // Admin reply to visitor
  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || !adminReplyText.trim() || !currentUser) return;
    setSendingAdminReply(true);
    try {
      await sendMessage(
        selectedConv.id,
        { ...currentUser, role: 'admin' },
        adminReplyText.trim()
      );
      setAdminReplyText('');
    } catch (err) {
      console.error('Failed to send admin reply:', err);
    } finally {
      setSendingAdminReply(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-4 flex flex-col min-h-[85vh] max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black font-mono tracking-tight text-white uppercase">
                  ADMINISTRATIVE CONTROL PANEL
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 font-bold">
                  SECURE PORTAL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Operator: {currentUser?.email || currentUser?.displayName || 'Authorized Admin'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Gate Overlay if not unlocked */}
        {!passcodeUnlocked ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 text-cyan-400 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-mono text-slate-950">
                Administrator Authentication
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your administrative key or sign in with your verified administrator account ({ADMIN_EMAIL}).
              </p>

              <form onSubmit={handlePasscodeSubmit} className="space-y-3">
                <input
                  type="password"
                  placeholder="Master Admin Passcode (e.g. elon2026)"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-center focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-950 text-white font-mono font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
                >
                  AUTHENTICATE ADMINISTRATOR
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Main Admin Interface */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-60 bg-slate-900 text-slate-300 p-4 border-r border-slate-800 flex md:flex-col gap-1.5 overflow-x-auto shrink-0">
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-left transition-colors ${
                  activeTab === 'products'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Products & Hardware</span>
              </button>

              <button
                onClick={() => setActiveTab('articles')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-left transition-colors ${
                  activeTab === 'articles'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Articles & Whitepapers</span>
              </button>

              <button
                onClick={() => setActiveTab('chats')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-left transition-colors ${
                  activeTab === 'chats'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>All Visitor Chats</span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-left transition-colors ${
                  activeTab === 'reports'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Flag className="w-4 h-4" />
                <span>Reports & Flags</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-left transition-colors ${
                  activeTab === 'users'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Active Users Roster</span>
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-left transition-colors ${
                  activeTab === 'audit'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Audit Trail Logs</span>
              </button>
            </div>

            {/* Tab Content Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              {/* TAB 1: PRODUCTS MANAGEMENT */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold font-mono text-slate-950">
                        Marketplace Hardware Management
                      </h3>
                      <p className="text-xs text-slate-500">
                        Publish items across all 9 sections directly to Cloud Firestore.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        resetProductForm();
                        setIsEditingProduct(!isEditingProduct);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-mono font-bold hover:bg-slate-800 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-cyan-400" />
                      <span>{isEditingProduct ? 'Close Editor' : 'Post New Product'}</span>
                    </button>
                  </div>

                  {/* Create / Edit Product Form */}
                  {isEditingProduct && (
                    <form
                      onSubmit={handleSaveProductSubmit}
                      className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md space-y-4"
                    >
                      <h4 className="text-sm font-bold font-mono text-cyan-700 uppercase">
                        {editingProductId ? 'Edit Product Details' : 'Post New Hardware Specifications'}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold font-mono text-slate-600">
                            Product Title *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Starlink Aviation Aero Terminal"
                            value={prodTitle}
                            onChange={(e) => setProdTitle(e.target.value)}
                            className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold font-mono text-slate-600">
                            Section Division *
                          </label>
                          <select
                            value={prodSection}
                            onChange={(e) => setProdSection(e.target.value as SectionId)}
                            className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-cyan-500 font-mono"
                          >
                            {SECTIONS.map((sec) => (
                              <option key={sec.id} value={sec.id}>
                                {sec.number}. {sec.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold font-mono text-slate-600">
                            Subcategory Tag
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Equipment, Model S, Optimus"
                            value={prodSubcategory}
                            onChange={(e) => setProdSubcategory(e.target.value)}
                            className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold font-mono text-slate-600">
                            Price (USD) & Display Format
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="Price (e.g. 599)"
                              value={prodPrice}
                              onChange={(e) => setProdPrice(parseFloat(e.target.value) || 0)}
                              className="w-1/2 mt-1 p-2.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:border-cyan-500"
                            />
                            <input
                              type="text"
                              placeholder="Formatted (e.g. $599 / unit)"
                              value={prodPriceFormatted}
                              onChange={(e) => setProdPriceFormatted(e.target.value)}
                              className="w-1/2 mt-1 p-2.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold font-mono text-slate-600">
                          Short Summary
                        </label>
                        <input
                          type="text"
                          placeholder="Brief technical summary (1-2 sentences)"
                          value={prodSummary}
                          onChange={(e) => setProdSummary(e.target.value)}
                          className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold font-mono text-slate-600">
                          Comprehensive Technical Description
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Full specifications, engineering materials, powertrain..."
                          value={prodDescription}
                          onChange={(e) => setProdDescription(e.target.value)}
                          className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      {/* Image Upload Area to Firebase Storage */}
                      <div>
                        <label className="text-xs font-bold font-mono text-slate-600 block mb-1">
                          Product Images (Upload to Firebase Storage)
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-mono font-bold border border-slate-300 flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-cyan-600" />
                            <span>Choose Image File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProductImageUpload}
                              className="hidden"
                            />
                          </label>

                          {isUploadingProdImage && (
                            <span className="text-xs font-mono text-cyan-600 animate-pulse">
                              Uploading ({uploadPercent}%)...
                            </span>
                          )}
                        </div>

                        {/* Thumbnail gallery */}
                        {prodImages.length > 0 && (
                          <div className="flex gap-2 mt-3 overflow-x-auto py-1">
                            {prodImages.map((imgUrl, i) => (
                              <div key={i} className="relative w-16 h-12 rounded border overflow-hidden shrink-0">
                                <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setProdImages(prodImages.filter((_, idx) => idx !== i))}
                                  className="absolute top-0 right-0 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Featured & Stock Controls */}
                      <div className="flex items-center gap-6 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                          <input
                            type="checkbox"
                            checked={prodIsFeatured}
                            onChange={(e) => setProdIsFeatured(e.target.checked)}
                            className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          <span className="font-bold">Highlight on Homepage as Featured</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                          <input
                            type="checkbox"
                            checked={prodInStock}
                            onChange={(e) => setProdInStock(e.target.checked)}
                            className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          <span className="font-bold">In Stock / Available for Order</span>
                        </label>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsEditingProduct(false)}
                          className="px-4 py-2 text-xs font-mono font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loadingAction}
                          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-mono font-bold rounded-lg hover:from-blue-700 hover:to-cyan-700 shadow"
                        >
                          {loadingAction ? 'Saving to Firestore...' : 'Publish to Marketplace'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Products Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase text-slate-500">
                        Existing Products ({products.length})
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                      {products.map((prod) => (
                        <div
                          key={prod.id}
                          className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.images[0] || ''}
                              alt=""
                              className="w-12 h-12 object-cover rounded-xl bg-slate-100 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900 font-mono">
                                  {prod.title}
                                </span>
                                {prod.isFeatured && (
                                  <span className="text-[10px] bg-cyan-100 text-cyan-800 font-mono px-1.5 py-0.5 rounded font-bold">
                                    FEATURED
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 font-mono">
                                Sector: {prod.sectionId.toUpperCase()} • Price: {prod.priceFormatted || `$${prod.price}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleProductFeatured(prod.id, !prod.isFeatured)}
                              title="Toggle Featured"
                              className={`p-2 rounded-lg border transition-colors ${
                                prod.isFeatured
                                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                                  : 'text-slate-400 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <Star className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditProductClick(prod)}
                              className="p-2 text-slate-600 hover:text-cyan-600 border border-slate-200 rounded-lg hover:bg-slate-100"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-2 text-red-500 hover:bg-red-50 border border-slate-200 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ARTICLES MANAGEMENT */}
              {activeTab === 'articles' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold font-mono text-slate-950">
                        Technical Articles & Whitepapers
                      </h3>
                      <p className="text-xs text-slate-500">
                        Publish engineering breakdowns and official announcements.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsEditingArticle(!isEditingArticle)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-mono font-bold hover:bg-slate-800 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-cyan-400" />
                      <span>{isEditingArticle ? 'Cancel' : 'Publish Article'}</span>
                    </button>
                  </div>

                  {isEditingArticle && (
                    <form
                      onSubmit={handleSaveArticleSubmit}
                      className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold font-mono text-slate-600">
                            Article Title *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Starship Hot-Staging Dynamics"
                            value={artTitle}
                            onChange={(e) => setArtTitle(e.target.value)}
                            className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold font-mono text-slate-600">
                            Section Division *
                          </label>
                          <select
                            value={artSection}
                            onChange={(e) => setArtSection(e.target.value as SectionId)}
                            className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-cyan-500 font-mono"
                          >
                            {SECTIONS.map((sec) => (
                              <option key={sec.id} value={sec.id}>
                                {sec.number}. {sec.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold font-mono text-slate-600">
                          Short Abstract / Excerpt
                        </label>
                        <input
                          type="text"
                          placeholder="Short summary excerpt"
                          value={artExcerpt}
                          onChange={(e) => setArtExcerpt(e.target.value)}
                          className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold font-mono text-slate-600">
                          Full Article Content (Markdown or Text)
                        </label>
                        <textarea
                          rows={6}
                          placeholder="Comprehensive article content..."
                          value={artContent}
                          onChange={(e) => setArtContent(e.target.value)}
                          className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-mono font-bold rounded-lg"
                      >
                        Publish to Firestore
                      </button>
                    </form>
                  )}

                  <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
                    {articles.map((art) => (
                      <div key={art.id} className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 font-mono">{art.title}</h4>
                          <p className="text-xs text-slate-400 font-mono">
                            Section: {art.sectionId.toUpperCase()} • {art.readTime}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            if (confirm('Delete article?')) {
                              await deleteArticle(art.id);
                              onRefreshData();
                            }
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 border border-slate-200 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: VISITOR CHATS & DIRECT REPLIES */}
              {activeTab === 'chats' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
                  {/* Left Column: Conversations List */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-y-auto divide-y divide-slate-100">
                    <div className="p-3 bg-slate-100 border-b border-slate-200">
                      <span className="text-xs font-mono font-bold uppercase text-slate-600">
                        Active Channels ({conversations.length})
                      </span>
                    </div>

                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConv(conv)}
                        className={`p-3.5 cursor-pointer transition-colors ${
                          selectedConv?.id === conv.id
                            ? 'bg-cyan-50 border-l-4 border-cyan-600'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 font-mono truncate max-w-[140px]">
                            {conv.visitorName || 'Space Visitor'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-1">{conv.lastMessage}</p>
                      </div>
                    ))}
                  </div>

                  {/* Right Column: Chat Stream and Direct Reply */}
                  <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 flex flex-col justify-between overflow-hidden">
                    {selectedConv ? (
                      <>
                        <div className="p-3 bg-slate-950 text-white flex items-center justify-between">
                          <div>
                            <span className="text-xs font-mono font-bold">
                              Thread: {selectedConv.visitorName}
                            </span>
                            <p className="text-[10px] text-slate-400">
                              UID: {selectedConv.visitorId}
                            </p>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                          {adminMessages.map((msg) => {
                            const isMe = msg.senderRole === 'admin';
                            return (
                              <div
                                key={msg.id}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                              >
                                <span className="text-[10px] font-mono text-slate-400 mb-0.5">
                                  {isMe ? 'You (Admin)' : selectedConv.visitorName}
                                </span>
                                <div
                                  className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                                    isMe
                                      ? 'bg-purple-600 text-white rounded-tr-none'
                                      : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                                  }`}
                                >
                                  {msg.imageUrl && (
                                    <img
                                      src={msg.imageUrl}
                                      alt=""
                                      className="rounded-lg mb-2 max-h-48 object-cover"
                                    />
                                  )}
                                  <p>{msg.text}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <form
                          onSubmit={handleSendAdminReply}
                          className="p-3 border-t border-slate-200 flex gap-2"
                        >
                          <input
                            type="text"
                            placeholder="Type verified administrator reply..."
                            value={adminReplyText}
                            onChange={(e) => setAdminReplyText(e.target.value)}
                            className="flex-1 px-4 py-2 text-xs rounded-full border border-slate-300 focus:outline-none focus:border-cyan-500"
                          />
                          <button
                            type="submit"
                            disabled={!adminReplyText.trim() || sendingAdminReply}
                            className="p-2.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-40"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-xs font-mono text-slate-400">
                        Select a visitor conversation on the left to read and reply in real time.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: REPORTS */}
              {activeTab === 'reports' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold font-mono text-slate-950">
                    Flagged Reports & Content Moderation
                  </h3>
                  <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
                    {reports.length === 0 ? (
                      <p className="p-6 text-center text-xs font-mono text-slate-400">
                        No active reports or flagged inquiries.
                      </p>
                    ) : (
                      reports.map((rep) => (
                        <div key={rep.id} className="p-4 flex items-center justify-between">
                          <div>
                            <span className="font-mono text-xs font-bold text-red-600">
                              Report #{rep.id.slice(-6)}
                            </span>
                            <p className="text-xs text-slate-700 mt-1">{rep.reason}</p>
                            <span className="text-[10px] font-mono text-slate-400">
                              Status: {rep.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateReportStatus(rep.id, 'reviewed')}
                              className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-mono font-bold rounded"
                            >
                              Mark Reviewed
                            </button>
                            <button
                              onClick={() => updateReportStatus(rep.id, 'dismissed')}
                              className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-mono rounded"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: USERS ROSTER */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold font-mono text-slate-950">
                    Registered & Anonymous Visitors
                  </h3>
                  <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
                    {usersList.map((u) => (
                      <div key={u.uid} className="p-3.5 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-xs font-mono text-slate-900">
                            {u.displayName}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {u.email || 'Anonymous Guest'} • UID: {u.uid}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: AUDIT TRAIL LOGS */}
              {activeTab === 'audit' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold font-mono text-slate-950">
                    Security & Admin Audit Logs
                  </h3>
                  <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 font-mono text-xs">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-3 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-cyan-700">{log.action}</span>
                          <p className="text-slate-600 mt-0.5">{log.details}</p>
                          <span className="text-[10px] text-slate-400">By: {log.adminEmail}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
