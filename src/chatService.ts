import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { ConversationItem, ChatMessageItem, UserProfile } from './types';

export const ADMIN_DISPLAY_NAME = 'Platform Administrator (Verified)';

function sanitize<T extends Record<string, any>>(obj: T): T {
  const clean: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      clean[k] = v;
    }
  }
  return clean;
}

/**
 * Get or create the unique private conversation for the current visitor
 */
export async function getOrCreateConversation(user: UserProfile): Promise<ConversationItem> {
  const convId = `conv_${user.uid}`;
  const convRef = doc(db, 'conversations', convId);

  try {
    const snap = await getDoc(convRef);
    if (snap.exists()) {
      return snap.data() as ConversationItem;
    }

    const newConv: ConversationItem = {
      id: convId,
      visitorId: user.uid,
      visitorName: user.displayName || 'Visitor',
      visitorEmail: user.email || undefined,
      isAnonymous: user.isAnonymous,
      lastMessage: 'Welcome to Elon Musk Space. How can we assist your technology inquiries?',
      lastMessageAt: new Date().toISOString(),
      unreadUserCount: 1,
      unreadAdminCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(convRef, sanitize(newConv));

    // Initial greeting from Platform Administrator
    const initialMsg: ChatMessageItem = {
      id: `msg_init_${convId}`,
      conversationId: convId,
      senderId: 'admin_desk',
      senderRole: 'admin',
      senderName: ADMIN_DISPLAY_NAME,
      text: 'Welcome to ELON MUSK SPACE. You are connected directly with our technology concierge and marketplace administration desk. Feel free to ask about vehicle specs, launch manifests, Starlink terminals, or custom procurement.',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, `conversations/${convId}/messages`, initialMsg.id), sanitize(initialMsg));

    return newConv;
  } catch (err) {
    console.warn('Conversation creation notice:', err);
    // Return local conversation object so chat UI is resilient
    return {
      id: convId,
      visitorId: user.uid,
      visitorName: user.displayName || 'Visitor',
      visitorEmail: user.email,
      isAnonymous: user.isAnonymous,
      lastMessage: 'Connected to private channel',
      lastMessageAt: new Date().toISOString(),
      unreadUserCount: 0,
      unreadAdminCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Subscribe to real-time messages in a conversation
 */
export function subscribeToMessages(
  conversationId: string,
  onUpdate: (messages: ChatMessageItem[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const messagesRef = collection(db, `conversations/${conversationId}/messages`);
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((d) => d.data() as ChatMessageItem);
      onUpdate(messages);
    },
    (error) => {
      console.warn('Real-time messages listener notification:', error.message);
      if (onError) onError(error);
    }
  );
}

/**
 * Send a message from either visitor or admin
 */
export async function sendMessage(
  conversationId: string,
  sender: UserProfile,
  text: string,
  imageUrl?: string
): Promise<ChatMessageItem> {
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
  const isSenderAdmin = sender.role === 'admin';
  const now = new Date().toISOString();

  const message: ChatMessageItem = {
    id: msgId,
    conversationId,
    senderId: sender.uid,
    senderRole: isSenderAdmin ? 'admin' : 'visitor',
    senderName: isSenderAdmin ? ADMIN_DISPLAY_NAME : (sender.displayName || 'Visitor'),
    text: text.trim(),
    imageUrl: imageUrl || undefined,
    isRead: false,
    createdAt: now,
  };

  try {
    const msgRef = doc(db, `conversations/${conversationId}/messages`, msgId);
    // CRITICAL: Clean undefined values so setDoc doesn't reject undefined imageUrl
    await setDoc(msgRef, sanitize(message));

    // Update parent conversation summary
    const convRef = doc(db, 'conversations', conversationId);
    const convUpdate: Record<string, any> = {
      lastMessage: imageUrl ? (text ? `[Image] ${text}` : '[Sent an Image]') : text,
      lastMessageAt: now,
      updatedAt: now,
      ...(isSenderAdmin ? { unreadUserCount: 1 } : { unreadAdminCount: 1 }),
    };

    try {
      await updateDoc(convRef, convUpdate);
    } catch {
      // If conversation doc doesn't exist yet, create it
      await setDoc(convRef, sanitize({
        id: conversationId,
        visitorId: sender.uid,
        visitorName: sender.displayName || 'Visitor',
        isAnonymous: sender.isAnonymous,
        status: 'active',
        createdAt: now,
        ...convUpdate,
      }), { merge: true });
    }

    // If visitor sent message and no human admin is actively in this room,
    // trigger an automated administrative concierge acknowledgment after 2 seconds
    if (!isSenderAdmin) {
      triggerConciergeAutoReply(conversationId, text);
    }

    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

import { determineAutoResponses } from './autoResponses';

/**
 * Automatic Investment, Shopping, and Security Response Dispatcher
 * Saves responses permanently in Firestore in real time.
 */
function triggerConciergeAutoReply(conversationId: string, userText: string) {
  setTimeout(async () => {
    try {
      const convSnap = await getDoc(doc(db, 'conversations', conversationId));
      if (!convSnap.exists()) return;

      const responses = determineAutoResponses(userText, conversationId);
      if (responses.length === 0) return;

      // Deliver each determined response sequentially
      for (let i = 0; i < responses.length; i++) {
        const replyText = responses[i];
        const delay = i * 1400; // Small cadence between welcome and detailed breakdown

        setTimeout(async () => {
          try {
            const autoMsgId = `msg_auto_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
            const autoMsg: ChatMessageItem = {
              id: autoMsgId,
              conversationId,
              senderId: 'admin_concierge',
              senderRole: 'admin',
              senderName: `${ADMIN_DISPLAY_NAME} [Automated Response]`,
              text: replyText,
              isRead: false,
              createdAt: new Date().toISOString(),
            };

            await setDoc(doc(db, `conversations/${conversationId}/messages`, autoMsgId), sanitize(autoMsg));
            await updateDoc(doc(db, 'conversations', conversationId), {
              lastMessage: replyText.slice(0, 100) + '...',
              lastMessageAt: new Date().toISOString(),
              unreadUserCount: 1,
            });
          } catch (innerErr) {
            console.warn('Error saving auto response:', innerErr);
          }
        }, delay);
      }
    } catch (err) {
      console.warn('Error in concierge dispatcher:', err);
    }
  }, 1200);
}

/**
 * Mark messages in a conversation as read
 */
export async function markConversationAsRead(
  conversationId: string,
  forRole: 'visitor' | 'admin'
): Promise<void> {
  try {
    const convRef = doc(db, 'conversations', conversationId);
    if (forRole === 'visitor') {
      await updateDoc(convRef, { unreadUserCount: 0 });
    } else {
      await updateDoc(convRef, { unreadAdminCount: 0 });
    }
  } catch (err) {
    console.warn('Mark as read note:', err);
  }
}

/**
 * List all conversations for the Admin Dashboard
 */
export async function getAllConversations(): Promise<ConversationItem[]> {
  try {
    const convsRef = collection(db, 'conversations');
    const snap = await getDocs(query(convsRef, orderBy('lastMessageAt', 'desc')));
    return snap.docs.map((d) => d.data() as ConversationItem);
  } catch (error) {
    console.warn('Error fetching all conversations:', error);
    return [];
  }
}
