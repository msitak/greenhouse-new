import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import slugify from 'slugify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | null): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 0,
  }).format(price ? price : 0);
}

export function formatFloor(floor: number | null | undefined, includeLabel: boolean = false): string | null {
  if (floor === null || floor === undefined) return null;
  if (floor === 0) return 'Parter';
  return includeLabel ? `${floor} piętro` : floor.toString();
}

export function formatAddedByAgentAgo(
  createdAtIso?: string | null,
  agentFullName?: string | null
): string {
  if (!createdAtIso) return '';
  const created = new Date(createdAtIso);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.floor(diffMs / dayMs);
  const firstName = agentFullName ? agentFullName.split(' ')[0] : undefined;
  const isFemale = firstName ? firstName.trim().slice(-1).toLowerCase() === 'a' : false;
  const verb = isFemale ? 'dodała' : 'dodał';
  if (days <= 0) return `${verb} to ogłoszenie dzisiaj`;
  if (days === 1) return `${verb} to ogłoszenie wczoraj`;
  if (days < 7) return `${verb} to ogłoszenie ${days} dni temu`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return `${verb} to ogłoszenie tydzień temu`;
  if (weeks === 2) return `${verb} to ogłoszenie 2 tygodnie temu`;
  if (weeks === 3) return `${verb} to ogłoszenie 3 tygodnie temu`;
  const months = Math.floor(days / 30);
  if (months === 1) return `${verb} to ogłoszenie miesiąc temu`;
  if (months === 2) return `${verb} to ogłoszenie 2 miesiące temu`;
  return `${verb} to ogłoszenie ${months} miesiące temu`;
}

type ListingForSlug = {
  propertyTypeId?: number | null;
  offerType?: string | null;
  roomsCount?: number | null;
  locationCity?: string | null;
  locationDistrict?: string | null;
  asariId: number;
  listingIdString?: string | null;
};

// Helper function to extract property type from listingIdString
function getPropertyTypeFromListingId(listingIdString?: string | null): string | null {
  if (!listingIdString) return null;
  
  // Extract the last part after the last slash (e.g., "554/10314/OMS" -> "OMS")
  const parts = listingIdString.split('/');
  const code = parts[parts.length - 1];
  
  // Map codes to property types
  if (code.includes('OM')) return 'mieszkanie'; // Oferta Mieszkania
  if (code.includes('OD')) return 'dom'; // Oferta Domu
  if (code.includes('OG')) return 'dzialka'; // Oferta Gruntu
  if (code.includes('OL') || code.includes('BL')) return 'lokal-uzytkowy'; // Oferta Lokalu
  if (code.includes('OG') && code.includes('A')) return 'garaz'; // Oferta Garażu
  if (code.includes('OH')) return 'hala'; // Oferta Hali
  
  return null;
}

export function generateListingSlug(listing: ListingForSlug): string {
  const parts: string[] = [];

  // Property type mapping
  const propertyTypeMap: Record<number, string> = {
    1: 'mieszkanie',
    2: 'dom',
    3: 'dzialka',
    4: 'lokal-uzytkowy',
    5: 'garaz',
    6: 'hala',
  };

  // 1. Property type (FIRST - rodzaj nieruchomości)
  let propertyType: string | null = null;
  
  if (listing.propertyTypeId) {
    propertyType = propertyTypeMap[listing.propertyTypeId];
  } else if (listing.listingIdString) {
    propertyType = getPropertyTypeFromListingId(listing.listingIdString);
  }
  
  if (propertyType) {
    parts.push(propertyType);
  }

  // 2. Transaction type
  if (listing.offerType) {
    const offerTypeLower = listing.offerType.toLowerCase();
    if (offerTypeLower.includes('rent') || offerTypeLower.includes('wynajem')) {
      parts.push('na-wynajem');
    } else if (offerTypeLower.includes('sale') || offerTypeLower.includes('sprzedaz')) {
      parts.push('na-sprzedaz');
    }
  }

  // 3. Number of rooms
  if (listing.roomsCount) {
    parts.push(`${listing.roomsCount}-pokoje`);
  }

  // 4. City
  if (listing.locationCity) {
    parts.push(listing.locationCity);
  }

  // 5. District
  if (listing.locationDistrict) {
    parts.push(listing.locationDistrict);
  }

  // 6. Add asariId for uniqueness
  parts.push(listing.asariId.toString());

  // Join and slugify
  const slug = slugify(parts.join(' '), {
    lower: true,
    strict: true,
    locale: 'pl',
  });

  return slug;
}
