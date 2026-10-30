import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Image as ImageIcon,
  Smile,
  Shield,
  ShieldAlert,
  RotateCw,
  Check,
  CheckCheck,
  Sparkles,
  Lock,
  Flag,
  Loader2,
  Paperclip,
} from 'lucide-react';
import { UserProfile, ChatMessageItem, ConversationItem } from '../types';
import {
  getOrCreateConversation,
  subscribeToMessages,
  sendMessage,
  markConversationAsRead,
  ADMIN_DISPLAY_NAME,
} from '../chatService';
import { uploadImage } from '../storage';
import { submitReport } from '../database';

interface ChatElonMuskModalProps {
  currentUser: UserProfile | null;
  onClose: () => void;
  initialInquiry?: string;
}

const COMMON_EMOJIS = ['🚀', '⚡', '🛰️', '🤖', '🧠', '🔥', '💬', '👍', '🌌', '🚘'];

export const ChatElonMuskModal: React.FC<ChatElonMuskModalProps> = ({
  currentUser,
  onClose,
  initialInquiry,
}) => {
  const [conversation, setConversation] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState(initialInquiry || '');
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, imagePreview]);

  // Initialize private conversation and real-time Firestore onSnapshot listener
  useEffect(() => {
    if (!currentUser) return;

    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      try {
        const conv = await getOrCreateConversation(currentUser);
        setConversation(conv);
        await markConversationAsRead(conv.id, 'visitor');

        unsubscribe = subscribeToMessages(
          conv.id,
          (updatedMessages) => {
            setMessages(updatedMessages);
          },
          (err) => {
            console.warn('Chat subscription update error:', err);
          }
        );
      } catch (err) {
        console.error('Failed to init conversation:', err);
      }
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  // Handle image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please choose an image file.');
        return;
      }
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser || !conversation) return;
    if (!inputText.trim() && !selectedImageFile) return;

    const textToSend = inputText.trim();
    setIsSending(true);
    setFailedMessage(null);

    try {
      let imageUrl: string | undefined;

      if (selectedImageFile) {
        setUploadProgress(10);
        imageUrl = await uploadImage(selectedImageFile, 'chat', (pct) => {
          setUploadProgress(pct);
        });
        setUploadProgress(null);
        setSelectedImageFile(null);
        setImagePreview(null);
      }

      setInputText('');
      await sendMessage(conversation.id, currentUser, textToSend, imageUrl);

      // Simulate admin typing response state
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 2400);
    } catch (err) {
      console.error('Error sending message:', err);
      setFailedMessage(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleRetryFailed = () => {
    if (failedMessage) {
      setInputText(failedMessage);
      setFailedMessage(null);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !conversation || !reportReason.trim()) return;
    try {
      await submitReport(currentUser.uid, conversation.id, reportReason.trim());
      setReportSubmitted(true);
      setTimeout(() => {
        setShowReportDialog(false);
        setReportSubmitted(false);
        setReportReason('');
      }, 2000);
    } catch (err) {
      console.error('Error submitting report:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="relative bg-white w-full max-w-2xl h-[90vh] max-h-[750px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Chat Header */}
        <div className="px-5 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-mono font-black text-sm shadow-md">
                EM
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-sm tracking-wide text-white">
                  CHAT ELON MUSK
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  PRIVATE CHANNEL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Shield className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>Recipient: {ADMIN_DISPLAY_NAME}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReportDialog(!showReportDialog)}
              title="Report or flag conversation"
              className="p-2 text-slate-400 hover:text-amber-400 transition-colors rounded-lg"
            >
              <Flag className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Channel Encryption & Recipient Transparency Notice */}
        <div className="bg-slate-900 text-slate-400 px-4 py-2 text-[11px] flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-1.5 truncate">
            <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">
              Direct 1-to-1 Firestore stream. Recipient is the authorized platform administration desk.
            </span>
          </div>
          <span className="font-mono text-[10px] text-cyan-400 shrink-0">
            CID: {conversation ? conversation.id.slice(-6).toUpperCase() : 'CONNECTING'}
          </span>
        </div>

        {/* Report Dialog Overlay */}
        {showReportDialog && (
          <div className="p-4 bg-amber-50 border-b border-amber-200">
            {reportSubmitted ? (
              <p className="text-xs font-bold text-emerald-700">
                Report logged in database. Administration will audit this thread.
              </p>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-2">
                <p className="text-xs font-bold text-amber-900 font-mono uppercase">
                  Flag Conversation for Administrative Review
                </p>
                <input
                  type="text"
                  placeholder="Reason for report..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-amber-300 focus:outline-none"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReportDialog(false)}
                    className="px-2 py-1 text-xs text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-amber-600 text-white rounded text-xs font-bold"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70">
          {messages.map((msg) => {
            const isMe = msg.senderRole === 'visitor';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Sender Tag */}
                <div className="text-[10px] font-mono font-semibold text-slate-400 mb-1 px-1">
                  {isMe ? 'You' : msg.senderName || ADMIN_DISPLAY_NAME}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm space-y-2 ${
                    isMe
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  {/* Attached Image */}
                  {msg.imageUrl && (
                    <div className="rounded-xl overflow-hidden max-h-60 bg-slate-950">
                      <img
                        src={msg.imageUrl}
                        alt="Attachment"
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                        onClick={() => window.open(msg.imageUrl, '_blank')}
                      />
                    </div>
                  )}

                  {/* Message Text */}
                  {msg.text && (
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  )}

                  {/* Time & Receipt status */}
                  <div
                    className={`flex items-center justify-end gap-1 text-[10px] ${
                      isMe ? 'text-cyan-100' : 'text-slate-400'
                    }`}
                  >
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-cyan-200" />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-2xl w-fit shadow-sm animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" />
              <span>Platform Administration desk is typing...</span>
            </div>
          )}

          {/* Upload Progress Bar */}
          {uploadProgress !== null && (
            <div className="bg-white p-3 rounded-xl border border-cyan-200 shadow-sm space-y-1">
              <div className="flex justify-between text-xs font-mono text-cyan-800">
                <span>Uploading Image to Firebase Storage...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-600 h-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Failed Message Retry Notification */}
          {failedMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
              <span>Message delivery interrupted by network.</span>
              <button
                onClick={handleRetryFailed}
                className="font-bold underline flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Image Attachment Preview */}
        {imagePreview && (
          <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
              <span className="text-xs text-slate-600 truncate max-w-[200px]">
                {selectedImageFile?.name}
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedImageFile(null);
                setImagePreview(null);
              }}
              className="p-1 text-slate-500 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Topic Chips for Instant Smart Responses */}
        <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Quick Inquiries:
          </span>
          {[
            { label: 'What can I buy?', query: 'What can I buy?' },
            { label: 'How can I invest?', query: 'How can I invest?' },
            { label: 'Tesla Products', query: 'What Tesla products do you sell?' },
            { label: 'Is it secure?', query: 'Is the website secure?' },
            { label: 'Government Approval?', query: 'Is this website US government approved?' },
          ].map((topic) => (
            <button
              key={topic.label}
              type="button"
              onClick={() => setInputText(topic.query)}
              className="text-[11px] font-medium font-mono px-2.5 py-1 rounded-full bg-white hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 border border-slate-200 shadow-sm shrink-0 transition-all active:scale-95"
            >
              {topic.label}
            </button>
          ))}
        </div>

        {/* Quick Emoji Bar */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setInputText((prev) => prev + emoji)}
              className="text-base hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          {/* File input button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach Image"
            className="p-2.5 rounded-full text-slate-500 hover:text-cyan-600 hover:bg-slate-100 transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder="Type your message to platform concierge..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            className="flex-1 bg-slate-100 text-slate-900 px-4 py-2.5 rounded-full text-sm border border-slate-200 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all placeholder:text-slate-400"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedImageFile) || isSending}
            className="p-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow transition-all active:scale-95"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
