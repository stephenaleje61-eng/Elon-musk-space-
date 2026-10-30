/**
 * AUTOMATIC INVESTMENT AND SHOPPING RESPONSE SYSTEM
 * Professional, transparent, verified responses for Elon Musk Space.
 */

export const WELCOME_SECURITY_MESSAGE = `Welcome to Elon Musk Space!

Thank you for your interest in our platform.

Our website is designed to provide access to technology information, available products, and investment-related information.

We take website security and the protection of user information seriously. Please use only verified purchasing channels and check product details before making any purchase.

Explore our available products and services to discover what you can purchase.

IMPORTANT: Investment involves financial risks. Always verify investment opportunities, company information, and official documentation before sending money. No investment returns are guaranteed.

How can we help you today?`;

export const WHAT_CAN_I_BUY_RESPONSE = `Here are the verified products, hardware, and services currently listed on Elon Musk Space across our 9 sectors:

1. Tesla & Clean Energy:
   • Tesla Cybertruck Cyberbeast ($99,990)
   • Tesla Model S Plaid ($89,990)
   • Tesla Powerwall 3 Integrated Battery System ($11,500)
   • Solar Roof & Commercial Megapack utility storage
   • All-Weather Cyber Mat accessories & Wall Connectors

2. Robots & Robotics:
   • Tesla Optimus Gen 2 Humanoid Robot ($25,000 target commercial price)
   • Industrial Harmonic Drive Actuator Module ($4,200/pair)

3. Space & Rockets:
   • SpaceX Falcon 9 SmallSat Rideshare Slot ($325,000 for 200 kg to Sun-Synchronous Orbit)
   • Starship 100-ton Orbital Cargo Allocation inquiries

4. Starlink Satellite Internet:
   • Starlink Standard Residential Kit Gen 3 ($599)
   • Starlink Mini Nomad Backpack Terminal ($499)
   • High-Performance Enterprise, Maritime, and Aviation terminals

5. Artificial Intelligence:
   • xAI Grok 3 Enterprise Reasoning API Access ($2,500/month)
   • Memphis Colossus 100k H100 GPU computing cluster tiers

6. Neuralink:
   • Telepathy N1 Clinical Research Suite ($75,000 partner accreditation)

7. The Boring Company:
   • Vegas Loop Annual VIP Transit Network Pass ($365/year)

8. X & Digital Communication:
   • X Premium+ Lifetime Creator Tier ($499)

You can explore full technical specifications, real-time availability, and detailed image galleries in our marketplace catalog.`;

export const INVESTING_RESPONSE = `For verified investment and market information, please visit Section 9 (Investment Information):

• Interactive TSLA Market Terminal: Real-time NASDAQ tracking with 1D, 1W, 1M, 1Y, 5Y, and ALL timeframes.
• Official SEC Filings: Summaries of Tesla Form 10-K annual reports, Q3 Shareholder balance sheets, automotive gross margins, and record Megapack energy storage deployments (6.9 GWh).
• Personal Investment Watchlists: Track stock symbols, set target price alerts, and record private notes stored directly in your secure Firestore account.

CRITICAL INVESTMENT NOTICE:
Elon Musk Space provides public equity education, official SEC filing references, and market research. We do not sell unregistered private company shares, promise guaranteed returns, or solicit personal investment funds. Always execute trades through licensed brokerage accounts.`;

export const TESLA_RESPONSE = `Here is the available Tesla information and products on Elon Musk Space:

• Tesla Cybertruck Cyberbeast ($99,990): Tri-motor AWD, 0-60 mph in 2.6s, 320-mile range, shatter-resistant armor glass, and 30X cold-rolled stainless steel exoskeleton.
• Tesla Model S Plaid ($89,990): 1,020 hp tri-motor powertrain, carbon-sleeved rotors, 0-60 mph in 1.99s, 359-mile EPA range, and 17" cinematic display.
• Tesla Powerwall 3 ($11,500): Integrated 6-input solar inverter, 13.5 kWh capacity, 11.5 kW continuous backup power.
• Solar Roof & Commercial Megapacks: High-efficiency solar capture and utility-scale grid power.
• Accessories: Floor liners, mobile charging bundles, and wall connectors.

Select Sector 01 (Tesla Cars & Clean Energy) from the navigation bar to browse full specs and configurations.`;

export const SECURITY_MEASURES_RESPONSE = `Here are the verified security measures implemented on Elon Musk Space:

1. Attribute-Based Access Control (ABAC): Cloud Firestore security rules strictly isolate visitor conversations. No visitor can view or access another visitor's private messages or watchlists.
2. Server-Enforced Administration: Administrator operations require verified document authentication in the database ('admins/{uid}'). Frontend-only permission escalation is strictly forbidden.
3. Secure File Uploads: Image attachments and product pictures are verified via Firebase Storage with MIME-type guards and a 10MB size threshold.
4. Transport Encryption: All communications and data streams use TLS 1.3 / HTTPS encryption in transit.
5. Immutable Audit Logging: All changes to products, articles, or moderation reports are recorded in the 'adminAuditLogs' Firestore collection with timestamps and admin IDs.
6. Privacy by Design: Browsing the marketplace does not require entering an email, password, or phone number.`;

export const GOVERNMENT_REGULATORY_RESPONSE = `Official Regulatory & Affiliation Disclosure:

• Independent Platform: Elon Musk Space is an independent technology catalog, hardware marketplace, and educational research portal.
• No Government Approval: This website is NOT approved, endorsed, licensed, or sponsored by the United States Government, the Securities and Exchange Commission (SEC), FINRA, or any federal or state agency. We make no claims of official governmental sanction.
• No Corporate Affiliation: This platform is not officially operated, owned, or endorsed by Elon Musk, Tesla, Inc., SpaceX, Starlink, xAI, Neuralink Corp., or The Boring Company.
• Regulatory Compliance: All financial filings in Section 9 are curated directly from publicly accessible US SEC EDGAR regulatory archives (Forms 10-K and 10-Q). We do not provide licensed broker-dealer or investment advisory services.`;

// In-memory cache to prevent duplicate automatic responses within a 20-second window
const recentRepliesCache = new Map<string, { lastText: string; timestamp: number }>();
// Track if conversation has already received the main Welcome & Security message
const welcomedConversations = new Set<string>();

/**
 * Determine which automated responses should be triggered based on user input
 */
export function determineAutoResponses(
  userText: string,
  conversationId: string
): string[] {
  const lower = userText.toLowerCase().trim();
  const responses: string[] = [];

  // Check duplicate debounce (prevent identical response within 15 seconds)
  const cached = recentRepliesCache.get(conversationId);
  const now = Date.now();
  const isDuplicate = cached && cached.lastText === lower && now - cached.timestamp < 15000;
  if (isDuplicate) {
    return [];
  }
  recentRepliesCache.set(conversationId, { lastText: lower, timestamp: now });

  // 1. Check Section 1 Triggers (Welcome and Security Message)
  const welcomeTriggers = [
    'investment',
    'invest',
    'what can i buy',
    'i want to buy',
    'purchase',
    'tesla',
    'products',
    'how can i invest',
    'what do you sell',
    'i want to invest money',
    'what is for sale',
    'buy',
  ];

  const matchesWelcomeTrigger = welcomeTriggers.some((t) => lower.includes(t));

  // If this conversation hasn't received the Welcome & Security message yet and matched a trigger:
  const shouldSendWelcome = matchesWelcomeTrigger && !welcomedConversations.has(conversationId);
  if (shouldSendWelcome) {
    welcomedConversations.add(conversationId);
    responses.push(WELCOME_SECURITY_MESSAGE);
  }

  // 2. Check Specific Smart Responses (Section 2)
  // A. Government / Approval / SEC license
  if (
    lower.includes('government') ||
    lower.includes('approved') ||
    lower.includes('sec approved') ||
    lower.includes('license') ||
    lower.includes('official') ||
    lower.includes('endorsement') ||
    lower.includes('us government') ||
    lower.includes('legit')
  ) {
    responses.push(GOVERNMENT_REGULATORY_RESPONSE);
  }
  // B. Security / Secure / Safe
  else if (
    lower.includes('secure') ||
    lower.includes('security') ||
    lower.includes('safe') ||
    lower.includes('protect') ||
    lower.includes('privacy') ||
    lower.includes('encrypted')
  ) {
    responses.push(SECURITY_MEASURES_RESPONSE);
  }
  // C. What can I buy / What do you sell / Available products
  else if (
    lower.includes('what can i buy') ||
    lower.includes('what do you sell') ||
    lower.includes('available products') ||
    lower.includes('what is for sale') ||
    lower.includes('what products') ||
    lower.includes('catalog')
  ) {
    responses.push(WHAT_CAN_I_BUY_RESPONSE);
  }
  // D. How can I invest / Investing / Investment
  else if (
    lower.includes('how can i invest') ||
    lower.includes('how to invest') ||
    lower.includes('want to invest') ||
    lower.includes('invest money') ||
    lower.includes('investing') ||
    lower.includes('stock') ||
    lower.includes('shares') ||
    lower.includes('tsla')
  ) {
    responses.push(INVESTING_RESPONSE);
  }
  // E. Tesla specific
  else if (
    lower.includes('tesla') ||
    lower.includes('cybertruck') ||
    lower.includes('model s') ||
    lower.includes('powerwall')
  ) {
    responses.push(TESLA_RESPONSE);
  } else if (!shouldSendWelcome) {
    // Default fallback acknowledgment if no specific trigger matched
    responses.push(
      "Thank you for contacting the Elon Musk Space desk. An administrator has logged your inquiry. You can ask about available hardware across all 9 sectors, investment data in Section 9, platform security, or order assistance."
    );
  }

  return responses;
}
