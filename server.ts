import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize GoogleGenAI SDK with user-agent telemetry as instructed
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// HELPER: Extract JSON safely from Gemini output
// -------------------------------------------------------------
function extractJsonFromText(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    }
    throw new Error('Failed to parse JSON response');
  }
}

// -------------------------------------------------------------
// FALLBACK GENERATORS (for offline or unconfigured API keys)
// -------------------------------------------------------------
function generateFallbackHomePlan(budget: number, currency: string, rooms: any[], style: string, platforms: string[]) {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';
  const safePlatforms = platforms.length > 0 ? platforms : ['IKEA', 'Amazon', 'Flipkart', 'Pepperfry'];
  
  const recommendations: any[] = [];
  let totalCost = 0;
  
  const roomCount = rooms.length || 1;
  const budgetPerRoom = budget / roomCount;

  rooms.forEach((room: any, rIdx: number) => {
    const items = room.items && room.items.length > 0 ? room.items : [
      { name: 'Ceiling Fan', quantity: 1 },
      { name: 'Ambient Warm Light Fixtures', quantity: 2 },
      { name: 'Modern Coffee / Side Table', quantity: 1 },
      { name: 'Textured Area Rug', quantity: 1 }
    ];

    const itemBudget = (budgetPerRoom * 0.9) / items.length;

    items.forEach((item: any, iIdx: number) => {
      const qty = item.quantity || 1;
      const unit = Math.round((itemBudget / qty) * (0.8 + Math.random() * 0.35));
      const cost = unit * qty;
      totalCost += cost;

      const plat = safePlatforms[(rIdx + iIdx) % safePlatforms.length];
      recommendations.push({
        id: `rec-home-${rIdx}-${iIdx}`,
        room: room.name || 'Living Room',
        item: item.name,
        quantity: qty,
        platform: plat,
        productName: `${style} Edition ${item.name}`,
        unitPrice: unit,
        totalPrice: cost,
        rating: 4.4 + Math.round(Math.random() * 5) / 10,
        reviewsCount: 180 + Math.floor(Math.random() * 800),
        matchReason: `Hand-selected to harmonize with the ${style} aesthetic while staying within the allocated category cap.`,
        styleTag: style,
        searchQuery: `${plat} ${style} ${item.name}`,
        platformUrl: plat.toLowerCase().includes('amazon') 
          ? `https://www.amazon.in/s?k=${encodeURIComponent(style + ' ' + item.name)}`
          : plat.toLowerCase().includes('ikea')
          ? `https://www.ikea.com/in/en/search/?q=${encodeURIComponent(item.name)}`
          : `https://www.flipkart.com/search?q=${encodeURIComponent(style + ' ' + item.name)}`,
        isBudgetPick: unit < itemBudget / qty,
        alternativeLowerCost: {
          name: `Compact Value ${item.name}`,
          price: Math.round(unit * 0.78),
          platform: 'Amazon'
        }
      });
    });
  });

  const surplus = budget - totalCost;

  return {
    summary: `Curated a balanced ${style} interior plan spanning ${rooms.map((r: any) => r.name).join(', ')} with an estimated spend of ${symbol}${totalCost.toLocaleString()} against your budget of ${symbol}${budget.toLocaleString()}.`,
    totalEstimatedCost: totalCost,
    savingsOrSurplus: surplus,
    budgetBreakdown: [
      { category: 'Core Furniture', allocatedAmount: Math.round(totalCost * 0.52), percentage: 52, explanation: 'Tables, primary seating, and structural room items' },
      { category: 'Lighting & Electricals', allocatedAmount: Math.round(totalCost * 0.22), percentage: 22, explanation: 'Ceiling fans, warm task lights, and accent pendants' },
      { category: 'Decor & Textiles', allocatedAmount: Math.round(totalCost * 0.16), percentage: 16, explanation: 'Area rugs, curtains, and wall accents' },
      { category: 'Contingency / Assembly', allocatedAmount: Math.round(totalCost * 0.10), percentage: 10, explanation: 'Installation, delivery, and hardware fittings' },
    ],
    recommendations,
    proTips: [
      `IKEA flat-pack items provide 20-30% savings on assembly when bundled together.`,
      `Layer lighting with warm 3000K LEDs from Amazon to make compact spaces feel luxurious without expensive rewiring.`,
      `Consider Flipkart's combo deals for ceiling fans and utility fixtures for bulk discount advantages.`
    ],
    tradeOffAnalysis: `Prioritized durable, high-touch furniture pieces while optimizing secondary lighting and decor for maximum aesthetic impact at cost.`
  };
}

function generateFallbackPartyPlan(budget: number, currency: string, guestCount: number, eventType: string, venueType: string) {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';
  const cateringAmt = Math.round(budget * 0.42);
  const decorAmt = Math.round(budget * 0.20);
  const entertainmentAmt = Math.round(budget * 0.16);
  const venueAmt = Math.round(budget * 0.14);
  const contingencyAmt = Math.round(budget * 0.08);

  const totalCost = cateringAmt + decorAmt + entertainmentAmt + venueAmt + contingencyAmt;
  const costPerGuest = Math.round(totalCost / Math.max(1, guestCount));

  return {
    summary: `Structured budget blueprint for a memorable ${eventType} hosting ${guestCount} guests at a ${venueType}. Budget optimized to ${symbol}${costPerGuest} per guest.`,
    costPerGuest,
    totalEstimatedCost: totalCost,
    savingsOrSurplus: budget - totalCost,
    allocation: {
      catering: { amount: cateringAmt, percent: 42, details: 'Starters, Main Course buffet, Beverages & Desserts' },
      decoration: { amount: decorAmt, percent: 20, details: 'Theme backdrop, balloon garland, fairy lights & centerpieces' },
      entertainment: { amount: entertainmentAmt, percent: 16, details: 'Sound system rental, curated playlist / DJ, party games' },
      venueAccommodation: { amount: venueAmt, percent: 14, details: 'Venue booking or OYO guest stay / cleaning fee' },
      contingency: { amount: contingencyAmt, percent: 8, details: 'Emergency supplies, extra ice, last-minute ride-shares' }
    },
    items: [
      {
        id: 'party-1',
        category: 'Catering & Food',
        title: 'Swiggy / Zomato Party Buffet Catering & Gourmet Platters',
        vendorOrPlatform: 'Swiggy',
        cost: cateringAmt,
        quantityOrServings: `${guestCount} portions + 10% buffer`,
        rating: 4.7,
        details: 'Curated mix of 3 appetizers, 2 mains, breads, mocktails and mini dessert tubs.',
        searchQuery: `Swiggy party order catering`,
        platformUrl: `https://www.swiggy.com/search?query=party+catering`,
        budgetTip: 'Pre-book bulk catering 48 hours prior for 15% corporate/party discounts.'
      },
      {
        id: 'party-2',
        category: 'Decoration & Lighting',
        title: 'Theme Decor Kit, Fairy Lights & Photo Booth Backdrop',
        vendorOrPlatform: 'Amazon',
        cost: decorAmt,
        quantityOrServings: '1 Complete Party Setup Kit',
        rating: 4.6,
        details: 'Gold/Black or Pastel themed balloon arch, LED curtain string lights, and metallic banner.',
        searchQuery: `Amazon ${eventType} decoration kit combo`,
        platformUrl: `https://www.amazon.in/s?k=${encodeURIComponent(eventType + ' decoration kit')}`,
        budgetTip: 'Reusable foil curtains and fairy lights can be stored and reused for subsequent events.'
      },
      {
        id: 'party-3',
        category: 'Entertainment & Music',
        title: 'High-Wattage Bluetooth Party Speaker & Karaoke Mic Duo',
        vendorOrPlatform: 'Flipkart',
        cost: entertainmentAmt,
        quantityOrServings: '1 Speaker System / Rental',
        rating: 4.5,
        details: 'Deep bass speaker with wireless microphones for group singing, speeches, and games.',
        searchQuery: `Flipkart party bluetooth speaker with mic`,
        platformUrl: `https://www.flipkart.com/search?q=party+speaker+karaoke`,
        budgetTip: 'Saves ₹5,000+ compared to hiring a live technician or full DJ rig.'
      },
      {
        id: 'party-4',
        category: 'Venue & Stay',
        title: 'OYO Townhouse / Venue Hourly Suite or Space Prep',
        vendorOrPlatform: 'OYO',
        cost: venueAmt,
        quantityOrServings: 'Venue Space / Day Rental',
        rating: 4.4,
        details: 'Spacious air-conditioned party hall / suite with seating, refrigeration, and audio support.',
        searchQuery: `OYO Townhouse event venue`,
        platformUrl: `https://www.oyorooms.com/search?location=nearby`,
        budgetTip: 'Weeknight bookings or afternoon party slots at OYO / partner venues offer 25-35% price drops.'
      }
    ],
    scheduleTimeline: [
      { time: 'T - 3 Hours', activity: 'Venue Access & Decor Setup', notes: 'Hang balloon garlands and plug in ambient fairy lights' },
      { time: 'T - 1 Hour', activity: 'Food Delivery Arrival (Swiggy / Zomato)', notes: 'Verify hot food warmer trays and ice buckets' },
      { time: '00:00', activity: 'Guest Arrival & Welcome Mocktails', notes: 'Background lounge playlist on Spotify' },
      { time: '+ 1.5 Hours', activity: 'Party Games & Cake Cutting', notes: 'High-energy karaoke mic session' },
      { time: '+ 2.5 Hours', activity: 'Buffet Dinner & Dessert', notes: 'Main course service' },
      { time: '+ 4 Hours', activity: 'Wrap Up & OYO Check-out', notes: 'Quick cleanup and favor bags' }
    ],
    proTips: [
      `Order heavy food platters through Swiggy / Zomato Gourmet catering packs instead of individual meals.`,
      `Book an OYO Townhouse or serviced apartment for out-of-town guests to bundle event hosting with accommodation.`,
      `Always keep an 8-10% buffer in cash/UPI for sudden extra beverages and ice replenishment.`
    ]
  };
}

function generateFallbackJewelryPlan(budget: number, currency: string, occasion: string, style: string, outfitDescription: string) {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';
  const neckPrice = Math.round(budget * 0.45);
  const earPrice = Math.round(budget * 0.25);
  const banglePrice = Math.round(budget * 0.18);
  const ringPrice = Math.round(budget * 0.10);
  const totalCost = neckPrice + earPrice + banglePrice + ringPrice;

  return {
    summary: `Stunning ${style} jewelry ensemble specifically coordinated for your ${occasion}${outfitDescription ? ` and outfit (${outfitDescription})` : ''}. Total estimated price: ${symbol}${totalCost.toLocaleString()} within budget of ${symbol}${budget.toLocaleString()}.`,
    outfitAnalysis: {
      colorHarmony: 'Warm metallic tones with rich undertones that complement and elevate the fabric colors.',
      necklineComplement: 'V-neckline or sweetheart profile beautifully framed by a proportional choker or mid-length pendant.',
      recommendedMetals: ['Antique Gold finish', 'High-polish Gold', 'Fine CZ / American Diamond accents'],
      detectedAesthetic: `${style} with graceful celebration accents`
    },
    totalEstimatedCost: totalCost,
    savingsOrSurplus: budget - totalCost,
    pieces: [
      {
        id: 'jewel-1',
        pieceType: 'Necklace',
        name: `Heritage ${style} Statement Choker & Pendant`,
        platform: 'CaratLane',
        price: neckPrice,
        metalAndFinish: '22K Gold Plated / Semi-precious stones',
        stylingRationale: 'Acts as the focal centerpiece, drawing attention upwards and accentuating the collarbone.',
        matchScore: 96,
        searchQuery: `CaratLane ${style} necklace ${occasion}`,
        platformUrl: `https://www.amazon.in/s?k=${encodeURIComponent(style + ' necklace set')}`,
        budgetAlternative: {
          name: `Handcrafted ${style} Choker`,
          price: Math.round(neckPrice * 0.7),
          platform: 'Amazon'
        }
      },
      {
        id: 'jewel-2',
        pieceType: 'Earrings',
        name: `Matching ${style} Jhumkas / Chandbalis`,
        platform: 'Tanishq',
        price: earPrice,
        metalAndFinish: 'Gold-dipped brass with bead drops',
        stylingRationale: 'Designed with lightweight comfort backing for 6+ hours of seamless celebration wear.',
        matchScore: 94,
        searchQuery: `Tanishq ${style} earrings`,
        platformUrl: `https://www.flipkart.com/search?q=${encodeURIComponent(style + ' earrings')}`,
        budgetAlternative: {
          name: `Filigree Chandbali Drops`,
          price: Math.round(earPrice * 0.65),
          platform: 'Myntra'
        }
      },
      {
        id: 'jewel-3',
        pieceType: 'Bangles',
        name: `Openable Kada Bangle Pair with Filigree Carving`,
        platform: 'Amazon',
        price: banglePrice,
        metalAndFinish: 'Micro-plated Antique Gold',
        stylingRationale: 'Adds graceful wrist movement without overpowering rings or outfit sleeve borders.',
        matchScore: 92,
        searchQuery: `Amazon ${style} bangles set`,
        platformUrl: `https://www.amazon.in/s?k=${encodeURIComponent(style + ' bangles pair')}`,
      },
      {
        id: 'jewel-4',
        pieceType: 'Rings',
        name: `Adjustable Statement Cocktail Ring`,
        platform: 'Flipkart',
        price: ringPrice,
        metalAndFinish: 'CZ studded with pearl edge',
        stylingRationale: 'A delicate conversation starter that completes the hand accessories.',
        matchScore: 90,
        searchQuery: `Flipkart cocktail ring ${style}`,
        platformUrl: `https://www.flipkart.com/search?q=${encodeURIComponent(style + ' statement ring')}`,
      }
    ],
    curatedSets: [
      {
        title: `The Royal Signature ${occasion} Set`,
        totalPrice: totalCost,
        description: 'Complete 4-piece coordinated set matching from choker to finger ring.',
        includes: ['Statement Necklace', 'Jhumkas', 'Bangles Pair', 'Cocktail Ring']
      },
      {
        title: `Minimalist Chic Edit`,
        totalPrice: neckPrice + earPrice,
        description: 'Focus on face-framing impact with choker and statement earrings.',
        includes: ['Statement Necklace', 'Jhumkas']
      }
    ],
    stylingAdvice: [
      'Apply perfume, hairspray, and lotion before wearing jewelry to prevent tarnishing.',
      'If your outfit has heavy zari or beadwork on the bodice, opt for longer earrings and skip the choker to avoid visual clutter.',
      'Store each piece individually in velvet or airtight ziplocks to maintain luster for years.'
    ]
  };
}

// -------------------------------------------------------------
// API ROUTE 1: Home Interior Budget Planning
// -------------------------------------------------------------
app.post('/api/recommendations/home', async (req: Request, res: Response) => {
  try {
    const { budget, currency = 'INR', rooms = [], style = 'Modern Minimalist', preferredPlatforms = [], additionalNotes = '' } = req.body;
    const numBudget = Number(budget) || 50000;

    if (!ai) {
      const fallback = generateFallbackHomePlan(numBudget, currency, rooms, style, preferredPlatforms);
      return res.json({ success: true, data: fallback, mode: 'algorithmic' });
    }

    const prompt = `You are PocketSmart AI, an expert cross-platform interior budget planner and decor shopping advisor.
Generate a comprehensive, realistic budget allocation and item recommendation plan for home interiors.

User Specifications:
- Total Budget: ${currency} ${numBudget}
- Rooms & Items Needed: ${JSON.stringify(rooms)}
- Interior Style Preference: ${style}
- Target Platforms: ${preferredPlatforms.join(', ') || 'IKEA, Amazon, Flipkart, Pepperfry, Urban Ladder'}
- Special Requirements / Context: ${additionalNotes || 'Maximize value, balance aesthetics and utility'}

Instructions:
1. Ensure the total of all items does not exceed the total budget of ${currency} ${numBudget}.
2. Recommend specific realistic products sourced across platforms like IKEA, Amazon, Flipkart, Pepperfry, Urban Ladder.
3. Include real product search URLs or format:
   - Amazon: "https://www.amazon.in/s?k=" + encodeURIComponent(query)
   - Flipkart: "https://www.flipkart.com/search?q=" + encodeURIComponent(query)
   - IKEA: "https://www.ikea.com/in/en/search/?q=" + encodeURIComponent(query)
4. Provide practical trade-offs and interior designer cost-saving hacks.

Respond STRICTLY with valid JSON following this exact JSON structure:
{
  "summary": "Short inspiring summary of how this plan meets their budget and style",
  "totalEstimatedCost": 48500,
  "savingsOrSurplus": 1500,
  "budgetBreakdown": [
    { "category": "Furniture", "allocatedAmount": 26000, "percentage": 52, "explanation": "..." },
    { "category": "Lighting & Electricals", "allocatedAmount": 10500, "percentage": 21, "explanation": "..." },
    { "category": "Decor & Furnishings", "allocatedAmount": 8000, "percentage": 16, "explanation": "..." },
    { "category": "Hardware & Assembly Buffer", "allocatedAmount": 4000, "percentage": 8, "explanation": "..." }
  ],
  "recommendations": [
    {
      "id": "item-1",
      "room": "Living Room",
      "item": "Ceiling Fan",
      "quantity": 1,
      "platform": "Amazon",
      "productName": "Atomberg Renesa 1200mm BLDC Motor Energy Efficient Ceiling Fan",
      "unitPrice": 3699,
      "totalPrice": 3699,
      "rating": 4.5,
      "reviewsCount": 1240,
      "matchReason": "Saves up to 65% electricity while matching the modern sleek ceiling profile.",
      "styleTag": "Modern BLDC",
      "searchQuery": "Atomberg Renesa 1200mm BLDC fan",
      "platformUrl": "https://www.amazon.in/s?k=Atomberg+Renesa+1200mm+BLDC",
      "isBudgetPick": true,
      "alternativeLowerCost": {
        "name": "Crompton Hill Briz 1200mm High Speed Fan",
        "price": 1899,
        "platform": "Flipkart"
      }
    }
  ],
  "proTips": ["Tip 1", "Tip 2", "Tip 3"],
  "tradeOffAnalysis": "Explanation of where money was saved vs where high quality was prioritized"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = extractJsonFromText(response.text || '{}');
    return res.json({ success: true, data: parsed, mode: 'gemini' });
  } catch (error: any) {
    console.error('Home plan error:', error);
    const { budget, currency, rooms, style, preferredPlatforms } = req.body;
    const fallback = generateFallbackHomePlan(Number(budget) || 50000, currency || 'INR', rooms || [], style || 'Modern Minimalist', preferredPlatforms || []);
    return res.json({ success: true, data: fallback, mode: 'fallback-recovered', error: error.message });
  }
});

// -------------------------------------------------------------
// API ROUTE 2: Party & Event Budget Planning
// -------------------------------------------------------------
app.post('/api/recommendations/party', async (req: Request, res: Response) => {
  try {
    const {
      budget,
      currency = 'INR',
      guestCount = 20,
      eventType = 'Birthday Party',
      venueType = 'Home / Apartment',
      preferredVendors = [],
      dietaryPreferences = [],
      entertainmentPreferences = [],
      additionalNotes = ''
    } = req.body;

    const numBudget = Number(budget) || 30000;
    const numGuests = Number(guestCount) || 20;

    if (!ai) {
      const fallback = generateFallbackPartyPlan(numBudget, currency, numGuests, eventType, venueType);
      return res.json({ success: true, data: fallback, mode: 'algorithmic' });
    }

    const prompt = `You are PocketSmart AI Party & Event Budget Planner.
Create a detailed, balanced, cost-effective party plan sourcing options across platforms including Swiggy, Zomato, OYO, Amazon, Blinkit, and Airbnb.

Event Specs:
- Total Budget: ${currency} ${numBudget}
- Guest Count: ${numGuests}
- Event Type: ${eventType}
- Venue Type: ${venueType}
- Target Platforms / Vendors: ${preferredVendors.join(', ') || 'Swiggy, Zomato, OYO, Amazon, Blinkit'}
- Dietary Preferences: ${dietaryPreferences.join(', ') || 'Standard Mix (Veg & Non-Veg)'}
- Entertainment Choices: ${entertainmentPreferences.join(', ') || 'Music & Party Games'}
- Notes: ${additionalNotes || 'Balanced celebration with delicious food, lively decor, and zero financial waste'}

Budget allocation guidance:
- Catering/Food (Swiggy / Zomato party platters, bulk orders): ~40-45%
- Decoration & Lighting (Amazon / Blinkit party kits): ~18-22%
- Entertainment (Music speaker, party games): ~15-18%
- Venue / Stay (OYO Townhouse, Airbnb, or venue rental): ~12-15% (if home, allocate to cleaning/tableware)
- Contingency: ~5-10%

Respond STRICTLY with valid JSON following this exact structure:
{
  "summary": "Blueprint overview and value summary",
  "costPerGuest": 1250,
  "totalEstimatedCost": 28900,
  "savingsOrSurplus": 1100,
  "allocation": {
    "catering": { "amount": 12500, "percent": 43, "details": "Swiggy / Zomato Party Platters with starters and mains" },
    "decoration": { "amount": 5500, "percent": 19, "details": "Amazon Theme Balloon Arch and Fairy Lights kit" },
    "entertainment": { "amount": 4500, "percent": 15, "details": "Party Speaker & Games" },
    "venueAccommodation": { "amount": 4000, "percent": 14, "details": "OYO party suite or venue deposit" },
    "contingency": { "amount": 2400, "percent": 8, "details": "Emergency ice, beverages, and extra plates" }
  },
  "items": [
    {
      "id": "party-item-1",
      "category": "Catering & Food",
      "title": "Gourmet Finger Food & Biryani Party Platters via Swiggy Gourmet",
      "vendorOrPlatform": "Swiggy",
      "cost": 12500,
      "quantityOrServings": "20 Servings + Buffer",
      "rating": 4.7,
      "details": "3 Starters + Biryani / Pasta Mains + Desserts ordered in 2 party packs.",
      "searchQuery": "Swiggy party platters bulk order",
      "platformUrl": "https://www.swiggy.com/search?query=party+catering",
      "budgetTip": "Order through restaurant party packs rather than single portions for 20% discount."
    }
  ],
  "scheduleTimeline": [
    { "time": "T-2 Hours", "activity": "Decoration & Music Check", "notes": "Set up photo corner" },
    { "time": "T-30 Min", "activity": "Food Delivery Acceptance", "notes": "Verify hot platters & beverages" },
    { "time": "00:00", "activity": "Welcome Drinks & Starters", "notes": "Casual social networking" }
  ],
  "proTips": ["Swiggy/Zomato bulk order discount tips", "OYO staycation bundling hack", "Amazon party supplies reuse tip"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = extractJsonFromText(response.text || '{}');
    return res.json({ success: true, data: parsed, mode: 'gemini' });
  } catch (error: any) {
    console.error('Party plan error:', error);
    const { budget, currency, guestCount, eventType, venueType } = req.body;
    const fallback = generateFallbackPartyPlan(Number(budget) || 30000, currency || 'INR', Number(guestCount) || 20, eventType || 'Birthday Party', venueType || 'Home');
    return res.json({ success: true, data: fallback, mode: 'fallback-recovered', error: error.message });
  }
});

// -------------------------------------------------------------
// API ROUTE 3: Occasion Jewelry Budget Planning (with Vision!)
// -------------------------------------------------------------
app.post('/api/recommendations/jewelry', async (req: Request, res: Response) => {
  try {
    const {
      budget,
      currency = 'INR',
      occasion = 'Wedding / Bridal',
      stylePreference = 'Kundan & Jadau',
      outfitDescription = '',
      outfitImage = '', // Base64 data URL
      preferredPlatforms = [],
      jewelryTypes = ['Necklace', 'Earrings', 'Bangles', 'Ring']
    } = req.body;

    const numBudget = Number(budget) || 20000;

    if (!ai) {
      const fallback = generateFallbackJewelryPlan(numBudget, currency, occasion, stylePreference, outfitDescription);
      return res.json({ success: true, data: fallback, mode: 'algorithmic' });
    }

    const textPrompt = `You are PocketSmart AI Jewelry Stylist & Budget Optimizer.
Create a personalized jewelry recommendation plan for an upcoming occasion across platforms like Amazon, Flipkart, Tanishq, CaratLane, Myntra, and Meesho.

User Details:
- Budget: ${currency} ${numBudget}
- Occasion: ${occasion}
- Style Preference: ${stylePreference}
- Outfit Description: ${outfitDescription || 'Not described in text'}
- Preferred Platforms: ${preferredPlatforms.join(', ') || 'Amazon, Flipkart, CaratLane, Tanishq, Myntra'}
- Target Jewelry Pieces: ${jewelryTypes.join(', ') || 'Necklace, Earrings, Bangles, Rings'}
${outfitImage ? '- NOTE: The user has attached an image of their outfit. Analyze its colors, neckline, embroidery style, and fabric richness.' : ''}

Instructions:
1. Ensure the total cost of all recommended individual pieces stays under the budget of ${currency} ${numBudget}.
2. Recommend specific items across Amazon, Flipkart, CaratLane, Tanishq, Myntra.
3. If an outfit image is provided, extract color harmony, neckline complement, and undertones.
4. Calculate a realistic Match Score (85-99%) based on how well the piece coordinates with the aesthetic and occasion.

Respond STRICTLY with valid JSON following this exact structure:
{
  "summary": "Stylist overview of how this jewelry set elevates the look while staying strictly within budget",
  "outfitAnalysis": {
    "colorHarmony": "Analysis of fabric tone and matching gold/silver/rose-gold hues",
    "necklineComplement": "Analysis of collar/neck profile and recommended drop/choker length",
    "recommendedMetals": ["22K Antique Gold", "Kundan stones", "Emerald Green beads"],
    "detectedAesthetic": "Royal Festive Elegance"
  },
  "totalEstimatedCost": 18450,
  "savingsOrSurplus": 1550,
  "pieces": [
    {
      "id": "jewel-1",
      "pieceType": "Necklace",
      "name": "Peora Traditional 22K Gold Plated Kundan Choker Necklace Set",
      "platform": "Amazon",
      "price": 2899,
      "metalAndFinish": "Gold Plated Brass with Pearl Drops",
      "stylingRationale": "Sits flush against the neckline, highlighting collarbones without clashing with the blouse zari.",
      "matchScore": 97,
      "searchQuery": "Peora Kundan Choker Necklace Set Amazon",
      "platformUrl": "https://www.amazon.in/s?k=Peora+Kundan+Choker+Necklace+Set",
      "budgetAlternative": {
        "name": "Zaveri Pearls Kundan Choker Set",
        "price": 1499,
        "platform": "Flipkart"
      }
    }
  ],
  "curatedSets": [
    {
      "title": "Complete Occasion Majesty Set",
      "totalPrice": 18450,
      "description": "Harmonious 4-piece set covering necklace, jhumkas, kada bangles, and cocktail ring.",
      "includes": ["Choker Set", "Matching Jhumkas", "Kada Bangles Pair", "Statement Ring"]
    }
  ],
  "stylingAdvice": [
    "Styling tip 1",
    "Care and preservation tip 2",
    "Photography and lighting tip 3"
  ]
}`;

    let contentsPayload: any;

    if (outfitImage && outfitImage.includes('base64,')) {
      const parts = outfitImage.split('base64,');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const base64Data = parts[1];

      contentsPayload = {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          {
            text: textPrompt,
          },
        ],
      };
    } else {
      contentsPayload = textPrompt;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contentsPayload,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = extractJsonFromText(response.text || '{}');
    return res.json({ success: true, data: parsed, mode: 'gemini' });
  } catch (error: any) {
    console.error('Jewelry plan error:', error);
    const { budget, currency, occasion, stylePreference, outfitDescription } = req.body;
    const fallback = generateFallbackJewelryPlan(Number(budget) || 20000, currency || 'INR', occasion || 'Wedding', stylePreference || 'Kundan', outfitDescription || '');
    return res.json({ success: true, data: fallback, mode: 'fallback-recovered', error: error.message });
  }
});

// -------------------------------------------------------------
// API ROUTE 4: Real-time Budget & Recommendation Co-Pilot Tuning
// -------------------------------------------------------------
app.post('/api/recommendations/tune', async (req: Request, res: Response) => {
  try {
    const { scenarioType, currentPlan, userPrompt, currency = 'INR' } = req.body;

    if (!ai) {
      return res.json({
        success: true,
        reply: `I've noted your request: "${userPrompt}". In full mode, I automatically adjust item quantities, platform links, and budget weights accordingly!`,
      });
    }

    const prompt = `You are PocketSmart AI, an agile budget and cross-platform shopping assistant.
The user is viewing their plan in the "${scenarioType}" planner.
Current Plan Details:
${JSON.stringify(currentPlan, null, 2)}

User's Adjustment / Query:
"${userPrompt}"

Instructions:
1. Provide a direct, intelligent, encouraging response explaining how to optimize the budget.
2. If the user asks for cheaper alternatives, platform comparisons (e.g., Amazon vs Flipkart, IKEA vs Pepperfry, Swiggy vs Zomato), or style adjustments, provide concrete product names, platforms, and estimated price changes.
3. Suggest 2-3 quick follow-up action items.

Format response clearly with Markdown bullet points and bold highlights. Keep it concise, engaging, and practical.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      success: true,
      reply: response.text || 'Adjusted your recommendations according to your preferences!',
    });
  } catch (error: any) {
    console.error('Tune error:', error);
    return res.json({
      success: true,
      reply: `I received your request: "${req.body.userPrompt}". You can swap individual items or adjust your overall budget in the panel above.`,
    });
  }
});

// -------------------------------------------------------------
// VITE MIDDLEWARE / STATIC ASSETS SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PocketSmart AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
