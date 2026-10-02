import { Currency, CURRENCIES } from '../types';

export function formatCurrency(amount: number, currency: Currency): string {
  const conf = CURRENCIES[currency] || CURRENCIES.INR;
  // Format with commas
  const rounded = Math.round(amount);
  return `${conf.symbol}${rounded.toLocaleString()}`;
}

export function getPlatformBadgeStyle(platform: string): { bg: string; text: string; border: string; label: string } {
  const p = (platform || '').toLowerCase();
  if (p.includes('ikea')) {
    return { bg: 'bg-blue-950/80', text: 'text-yellow-400', border: 'border-yellow-500/40', label: 'IKEA' };
  }
  if (p.includes('amazon')) {
    return { bg: 'bg-amber-950/80', text: 'text-amber-400', border: 'border-amber-500/40', label: 'Amazon' };
  }
  if (p.includes('flipkart')) {
    return { bg: 'bg-sky-950/80', text: 'text-sky-400', border: 'border-sky-500/40', label: 'Flipkart' };
  }
  if (p.includes('swiggy')) {
    return { bg: 'bg-orange-950/80', text: 'text-orange-400', border: 'border-orange-500/40', label: 'Swiggy' };
  }
  if (p.includes('zomato')) {
    return { bg: 'bg-rose-950/80', text: 'text-rose-400', border: 'border-rose-500/40', label: 'Zomato' };
  }
  if (p.includes('oyo')) {
    return { bg: 'bg-red-950/80', text: 'text-red-400', border: 'border-red-500/40', label: 'OYO' };
  }
  if (p.includes('caratlane') || p.includes('tanishq')) {
    return { bg: 'bg-purple-950/80', text: 'text-purple-300', border: 'border-purple-500/40', label: platform };
  }
  if (p.includes('pepperfry') || p.includes('urban ladder')) {
    return { bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-500/40', label: platform };
  }
  return { bg: 'bg-slate-800', text: 'text-slate-200', border: 'border-slate-700', label: platform || 'Vendor' };
}

export function buildSearchUrl(platform: string, query: string, currency: Currency): string {
  const p = (platform || '').toLowerCase();
  const encoded = encodeURIComponent(query);
  const isIndia = currency === 'INR';

  if (p.includes('ikea')) {
    return isIndia
      ? `https://www.ikea.com/in/en/search/?q=${encoded}`
      : `https://www.ikea.com/us/en/search/?q=${encoded}`;
  }
  if (p.includes('amazon')) {
    return isIndia
      ? `https://www.amazon.in/s?k=${encoded}`
      : `https://www.amazon.com/s?k=${encoded}`;
  }
  if (p.includes('flipkart')) {
    return `https://www.flipkart.com/search?q=${encoded}`;
  }
  if (p.includes('swiggy')) {
    return `https://www.swiggy.com/search?query=${encoded}`;
  }
  if (p.includes('zomato')) {
    return `https://www.zomato.com/search?q=${encoded}`;
  }
  if (p.includes('oyo')) {
    return `https://www.oyorooms.com/search?location=${encoded}`;
  }
  if (p.includes('caratlane')) {
    return `https://www.caratlane.com/search?q=${encoded}`;
  }
  if (p.includes('myntra')) {
    return `https://www.myntra.com/${encoded}`;
  }
  // Default google search fallback
  return `https://www.google.com/search?q=${encoded}+buy+online`;
}
