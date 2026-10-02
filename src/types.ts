export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  conversionRate: number; // base INR = 1
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', conversionRate: 1 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar (USD)', conversionRate: 0.012 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (EUR)', conversionRate: 0.011 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', conversionRate: 0.0095 },
};

// ----------------------------------------
// Scenario 1: Home Interior Types
// ----------------------------------------
export interface RoomItemConfig {
  name: string;
  quantity: number;
  priority?: 'Essential' | 'Recommended' | 'Luxury';
}

export interface RoomConfig {
  name: string;
  items: RoomItemConfig[];
}

export interface HomeRecommendationItem {
  id: string;
  room: string;
  item: string;
  quantity: number;
  platform: string;
  productName: string;
  unitPrice: number;
  totalPrice: number;
  rating: number;
  reviewsCount: number;
  matchReason: string;
  styleTag: string;
  searchQuery: string;
  platformUrl: string;
  isBudgetPick?: boolean;
  alternativeLowerCost?: {
    name: string;
    price: number;
    platform: string;
  };
}

export interface HomeBudgetBreakdownCategory {
  category: string;
  allocatedAmount: number;
  percentage: number;
  explanation: string;
}

export interface HomePlanData {
  summary: string;
  totalEstimatedCost: number;
  savingsOrSurplus: number;
  budgetBreakdown: HomeBudgetBreakdownCategory[];
  recommendations: HomeRecommendationItem[];
  proTips: string[];
  tradeOffAnalysis: string;
}

// ----------------------------------------
// Scenario 2: Party Planner Types
// ----------------------------------------
export interface PartyItem {
  id: string;
  category: 'Catering & Food' | 'Decoration & Lighting' | 'Entertainment & Music' | 'Venue & Stay' | 'Supplies & Favors' | string;
  title: string;
  vendorOrPlatform: string;
  cost: number;
  quantityOrServings: string;
  rating: number;
  details: string;
  searchQuery: string;
  platformUrl: string;
  budgetTip: string;
}

export interface PartyAllocationCategory {
  amount: number;
  percent: number;
  details: string;
}

export interface PartyPlanData {
  summary: string;
  costPerGuest: number;
  totalEstimatedCost: number;
  savingsOrSurplus: number;
  allocation: {
    catering: PartyAllocationCategory;
    decoration: PartyAllocationCategory;
    entertainment: PartyAllocationCategory;
    venueAccommodation: PartyAllocationCategory;
    contingency: PartyAllocationCategory;
  };
  items: PartyItem[];
  scheduleTimeline: Array<{ time: string; activity: string; notes: string }>;
  proTips: string[];
}

// ----------------------------------------
// Scenario 3: Jewelry Planner Types
// ----------------------------------------
export interface JewelryPiece {
  id: string;
  pieceType: string;
  name: string;
  platform: string;
  price: number;
  metalAndFinish: string;
  stylingRationale: string;
  matchScore: number;
  searchQuery: string;
  platformUrl: string;
  budgetAlternative?: {
    name: string;
    price: number;
    platform: string;
  };
}

export interface JewelrySet {
  title: string;
  totalPrice: number;
  description: string;
  includes: string[];
}

export interface JewelryPlanData {
  summary: string;
  outfitAnalysis: {
    colorHarmony: string;
    necklineComplement: string;
    recommendedMetals: string[];
    detectedAesthetic: string;
  };
  totalEstimatedCost: number;
  savingsOrSurplus: number;
  pieces: JewelryPiece[];
  curatedSets: JewelrySet[];
  stylingAdvice: string[];
}

// ----------------------------------------
// Saved Plans History
// ----------------------------------------
export interface SavedPlan {
  id: string;
  scenario: 'home' | 'party' | 'jewelry';
  title: string;
  timestamp: number;
  budget: number;
  currency: Currency;
  totalEstimatedCost: number;
  data: HomePlanData | PartyPlanData | JewelryPlanData;
}
