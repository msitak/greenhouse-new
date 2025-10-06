import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import { ListingApiResponse } from '@/types/api.types';

type ListingBreadcrumbsProps = {
  listing: ListingApiResponse;
};

// Helper function to extract property type from listingIdString
function getPropertyTypeFromListingId(additionalDetailsJson: any): string | null {
  if (!additionalDetailsJson || typeof additionalDetailsJson !== 'object') {
    return null;
  }

  const listingIdString = additionalDetailsJson.listingIdString;
  if (!listingIdString || typeof listingIdString !== 'string') {
    return null;
  }

  // Extract the last part after the last slash (e.g., "554/10314/OMS" -> "OMS")
  const parts = listingIdString.split('/');
  const code = parts[parts.length - 1];

  // Map codes to property types
  if (code.includes('OM')) return 'mieszkanie';
  if (code.includes('OD')) return 'dom';
  if (code.includes('OG')) return 'dzialka';
  if (code.includes('OL') || code.includes('BL')) return 'lokal';

  return null;
}

// Helper function to get singular form of property type (capitalized)
function getPropertyTypeSingular(propertyType: string | null): string {
  const singularMap: Record<string, string> = {
    mieszkanie: 'Mieszkanie',
    dom: 'Dom',
    dzialka: 'Działka',
    lokal: 'Lokal użytkowy',
  };

  return propertyType ? (singularMap[propertyType] || 'Nieruchomość') : 'Nieruchomość';
}

// Helper function to get plural form of property type
function getPropertyTypePlural(propertyType: string | null): string {
  const pluralMap: Record<string, string> = {
    mieszkanie: 'Mieszkania',
    dom: 'Domy',
    dzialka: 'Działki',
    lokal: 'Lokale użytkowe',
  };

  return propertyType ? (pluralMap[propertyType] || 'Nieruchomości') : 'Nieruchomości';
}

// Helper function to get transaction type label
function getTransactionTypeLabel(offerType: string | null): { label: string; param: string } | null {
  if (!offerType) return null;

  const offerTypeLower = offerType.toLowerCase();

  if (offerTypeLower.includes('rent') || offerTypeLower.includes('wynajem')) {
    return { label: 'na wynajem', param: 'wynajem' };
  }

  if (offerTypeLower.includes('sale') || offerTypeLower.includes('sprzedaz')) {
    return { label: 'na sprzedaż', param: 'sprzedaz' };
  }

  return null;
}

export default function ListingBreadcrumbs({ listing }: ListingBreadcrumbsProps) {
  // Extract property type and transaction type
  const propertyType = getPropertyTypeFromListingId(listing.additionalDetailsJson);
  const propertyTypePlural = getPropertyTypePlural(propertyType);
  const transactionType = getTransactionTypeLabel(listing.offerType);

  // Build category label and URL
  const categoryLabel = transactionType
    ? `${propertyTypePlural} ${transactionType.label}`
    : propertyTypePlural;

  const categoryUrl = (() => {
    const params = new URLSearchParams();
    if (propertyType) {
      params.set('typ', propertyType);
    }
    if (transactionType) {
      params.set('transakcja', transactionType.param);
    }
    const queryString = params.toString();
    return queryString ? `/nieruchomosci?${queryString}` : '/nieruchomosci';
  })();

  // Build current page title: "Mieszkanie 3-pokojowe, Częstochowa"
  const propertyTypeSingular = getPropertyTypeSingular(propertyType);
  const currentPageParts: string[] = [propertyTypeSingular];
  
  if (listing.roomsCount) {
    currentPageParts.push(`${listing.roomsCount}-pokojowe`);
  }
  
  if (listing.locationCity) {
    currentPageParts.push(listing.locationCity);
  }

  const currentPageTitle = currentPageParts.join(' ');

  return (
    <nav aria-label='Breadcrumb' className='leading-none py-5 mb-10'>
      <ol className='flex flex-wrap items-center gap-1.5 leading-none text-sm max-w-[1200px] mx-auto'>
        {/* Level 1: Home */}
        <li className='flex items-center gap-1 text-secondary font-medium leading-none'>
          <Home className='h-[1em] w-[1em] text-gray-500' aria-hidden='true' />
          <Link href='/' className='text-gray-500 hover:underline'>
            Strona główna
          </Link>
        </li>

        {/* Level 2: Nieruchomości */}
        <li className='flex items-center gap-2 leading-none'>
          <ChevronRight className='h-[1em] w-[1em] text-gray-400' aria-hidden='true' />
          <span className='hidden md:inline'>
            <Link href='/nieruchomosci' className='text-gray-500 font-medium hover:underline'>
              Nieruchomości
            </Link>
          </span>
          <span className='md:hidden'>...</span>
        </li>

        {/* Level 3: Category (dynamic) */}
        <li className='hidden md:flex items-center gap-2 leading-none'>
          <ChevronRight className='h-[1em] w-[1em] text-gray-400' aria-hidden='true' />
          <Link href={categoryUrl} className='text-gray-500 font-medium hover:underline'>
            {categoryLabel}
          </Link>
        </li>

        {/* Level 4: Current page (not a link) */}
        <li className='flex items-center gap-2 leading-none'>
          <ChevronRight className='h-[1em] w-[1em] text-gray-400' aria-hidden='true' />
          <span aria-current='page' className='font-bold text-black line-clamp-1'>
            {currentPageTitle}
          </span>
        </li>
      </ol>
    </nav>
  );
}

