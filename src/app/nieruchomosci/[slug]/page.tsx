import ListingBreadcrumbs from '@/components/ui/ListingBreadcrumbs';
import ListingTopInfo from '@/components/listings/ListingTopInfo';
import ListingDetails from '@/components/listings/ListingDetails';
import { Button } from '@/components/ui/button';
import AgentCard from '@/components/AgentCard';
import AgentSidebar from '@/components/AgentSidebar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import HtmlContent from '@/components/HtmlContent';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { ListingApiResponse } from '@/types/api.types';
import { prisma } from '@/services/prisma';
import { AsariStatus } from '@prisma/client';
import ListingGallery from '@/components/listings/ListingGallery';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

async function fetchListing(slug: string): Promise<ListingApiResponse | null> {
  try {
    // 1) Try by slug
    let listingFromDb = await prisma.listing.findFirst({
      where: {
        slug,
        isVisible: true,
        asariStatus: { in: [AsariStatus.Active, AsariStatus.Closed] },
      },
      include: {
        images: {
          select: {
            id: true,
            asariId: true,
            urlNormal: true,
            urlThumbnail: true,
            urlOriginal: true,
            description: true,
            order: true,
            isScheme: true,
            dbCreatedAt: true,
            dbUpdatedAt: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    // 2) Fallback by trailing numeric asariId in slug
    if (!listingFromDb) {
      const idMatch = slug.match(/(\d+)$/);
      if (idMatch) {
        const asariId = parseInt(idMatch[1], 10);
        if (!Number.isNaN(asariId)) {
          listingFromDb = await prisma.listing.findFirst({
            where: {
              asariId,
              isVisible: true,
              asariStatus: { in: [AsariStatus.Active, AsariStatus.Closed] },
            },
            include: {
              images: {
                select: {
                  id: true,
                  asariId: true,
                  urlNormal: true,
                  urlThumbnail: true,
                  urlOriginal: true,
                  description: true,
                  order: true,
                  isScheme: true,
                  dbCreatedAt: true,
                  dbUpdatedAt: true,
                },
                orderBy: { order: 'asc' },
              },
            },
          });
        }
      }
    }

    if (!listingFromDb) return null;

    // 3) Transform dates to string (ListingApiResponse contract)
    const listingForApi: ListingApiResponse = {
      ...listingFromDb,
      lastUpdatedAsari: listingFromDb.lastUpdatedAsari?.toISOString() || null,
      createdAtSystem: listingFromDb.createdAtSystem?.toISOString() || null,
      updatedAtSystem: listingFromDb.updatedAtSystem?.toISOString() || null,
      soldAt: listingFromDb.soldAt?.toISOString() || null,
      dbCreatedAt: listingFromDb.dbCreatedAt.toISOString(),
      dbUpdatedAt: listingFromDb.dbUpdatedAt.toISOString(),
      images: listingFromDb.images.map(image => ({
        ...image,
        dbCreatedAt: image.dbCreatedAt.toISOString(),
        dbUpdatedAt: image.dbUpdatedAt.toISOString(),
      })),
    };

    return listingForApi;
  } catch (error) {
    console.error('Failed to fetch listing:', error);
    return null;
  }
}

function getOfferTypeLabel(offerType: string | null): string {
  if (!offerType) return 'Oferta';

  if (offerType.toLowerCase().includes('sale')) {
    return 'Oferta sprzedaży';
  }

  if (
    offerType.toLowerCase().includes('rental') ||
    offerType.toLowerCase().includes('rent')
  ) {
    return 'Oferta wynajmu';
  }

  return 'Oferta';
}

// Local date formatter (not used on this page currently) removed to satisfy linter

// Helper to extract property type from listingIdString
function getPropertyTypeFromListing(
  additionalDetailsJson: unknown
): string | null {
  if (!additionalDetailsJson || typeof additionalDetailsJson !== 'object') {
    return null;
  }

  const listingIdString = (
    additionalDetailsJson as { listingIdString?: unknown }
  ).listingIdString;
  if (!listingIdString || typeof listingIdString !== 'string') {
    return null;
  }

  const parts = listingIdString.split('/');
  const code = parts[parts.length - 1];

  if (code.includes('OM')) return 'mieszkanie';
  if (code.includes('OD')) return 'dom';
  if (code.includes('OG')) return 'dzialka';
  if (code.includes('OL') || code.includes('BL')) return 'lokal';

  return null;
}

export default async function OfferPage({ params }: PageProps) {
  const { slug } = await params;
  const listing = await fetchListing(slug);

  if (!listing) {
    notFound();
  }

  const fullAddress = [listing.locationStreet, listing.locationCity]
    .filter(Boolean)
    .join(', ');

  // Agent data handling - agentName contains full name like "Małgorzata Walas"
  const agentFullName = listing.agentName || 'Agent nieruchomości';
  // Derive first name (unused for now but may be useful later)

  // Generate agent image paths
  // Small image for sidebar: "Małgorzata Walas" → "/agents/Małgorzata_Walas.png"
  const agentImagePath = listing.agentName
    ? `/agents/${listing.agentName.replace(/ /g, '_')}.png`
    : null;

  // Full-size image for contact form: "Małgorzata Walas" → "/agents/full/Małgorzata_Walas.jpg"
  const agentImagePathFull = listing.agentName
    ? `/agents/full/${listing.agentName.replace(/ /g, '_')}.jpg`
    : null;

  const calculatedPricePerM2 =
    listing.price && listing.area
      ? Math.round(listing.price / listing.area)
      : listing.pricePerM2
        ? Math.round(listing.pricePerM2)
        : null;

  // Check if it's a sale offer (not rental)
  const isSaleOffer = listing.offerType
    ? listing.offerType.toLowerCase().includes('sale') ||
      listing.offerType.toLowerCase().includes('sprzedaz')
    : false;

  // Find floor plan image (image with isScheme: true)
  const floorPlanImage = listing.images.find(img => img.isScheme);

  // Determine property type
  const propertyType = getPropertyTypeFromListing(
    listing.additionalDetailsJson
  );

  // Get formatted listing ID
  const getListingId = () => {
    // Prefer exportId if available
    if (listing.exportId) {
      return listing.exportId;
    }

    // Otherwise try to get listingIdString from additionalDetailsJson
    if (
      listing.additionalDetailsJson &&
      typeof listing.additionalDetailsJson === 'object'
    ) {
      const additionalDetails = listing.additionalDetailsJson as {
        listingIdString?: string | null;
      };
      if (additionalDetails.listingIdString) {
        return additionalDetails.listingIdString;
      }
    }

    // Fall back to asariId
    return listing.asariId.toString();
  };

  const listingId = getListingId();

  const isLoading = false;

  // Prepare images for carousel: regular images first, then floor plans at the end
  const schemes = listing.images.filter(img => img.isScheme);
  const photos = listing.images.filter(img => !img.isScheme);

  // PhotoCarousel limits to 20 internally. We ensure we don't exceed 20 if possible, or let PhotoCarousel slice.
  // But to ensure floor plan is the LAST slide, we should construct the array such that schemes are at the end
  // and the total length is what we want.
  // If we have too many photos, we trim photos to make room for schemes.
  const MAX_CAROUSEL_IMAGES = 20;
  const photoLimit = Math.max(0, MAX_CAROUSEL_IMAGES - schemes.length);
  const carouselImages = [...photos.slice(0, photoLimit), ...schemes];

  return (
    <div className='mt-6 lg:mt-22 mb-14'>
      <div className='hidden lg:block'>
        <ListingBreadcrumbs listing={listing} />
      </div>

      <ListingGallery
        listing={listing}
        carouselImages={carouselImages}
        floorPlanImage={floorPlanImage}
        listingId={listingId}
        fullAddress={fullAddress}
        offerTypeLabel={getOfferTypeLabel(listing.offerType)}
        isSaleOffer={isSaleOffer}
        calculatedPricePerM2={calculatedPricePerM2}
        isLoading={isLoading}
      />

      {/* Mobile: Tabs section */}
      <div className='lg:hidden max-w-[1200px] mx-auto mt-6'>
        <Tabs defaultValue='info'>
          <TabsList>
            <TabsTrigger value='info'>Informacje</TabsTrigger>
            <TabsTrigger value='location'>Lokalizacja</TabsTrigger>
          </TabsList>
          <TabsContent value='info'>
            <section className='rounded-2xl bg-white p-4 shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
              <ListingDetails listing={listing} propertyType={propertyType} />
              <HtmlContent
                html={listing.description || '<p>Brak opisu</p>'}
                className='text-sm text-[--color-text-primary] prose prose-neutral max-w-none'
              />
            </section>
          </TabsContent>
          <TabsContent value='location'>
            <section className='rounded-2xl bg-white p-4 shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
              location
            </section>
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: Details section */}
      <div className='hidden lg:grid grid-cols-1 gap-6 mt-6 lg:grid-cols-[minmax(0,1fr)_360px] max-w-[1200px] mx-auto'>
        <section className='rounded-2xl bg-white p-6 shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
          <div className='flex items-center justify-between text-md text-[--color-text-primary]'>
            <span>{getOfferTypeLabel(listing.offerType)}</span>
            <span>ID: {listingId}</span>
          </div>
          <h1 className='mt-3 text-[48px]/[56px] font-bold'>
            {listing.title || fullAddress || 'Nieruchomość'}
          </h1>

          <div className='flex flex-row justify-between'>
            <div>
              <div className='mt-8 text-[#448C00] font-black text-5xl/[48px]'>
                {listing.price ? formatPrice(listing.price) : 'Cena w ofercie'}
              </div>
              {isSaleOffer && calculatedPricePerM2 && (
                <div className='text-gray-500 text-[20px] mt-1 font-medium'>
                  {formatPrice(calculatedPricePerM2)} / m²
                </div>
              )}
            </div>

            <div>
              <ListingTopInfo listing={listing} propertyType={propertyType} />
            </div>
          </div>
        </section>

        {agentFullName && (
          <AgentSidebar
            agentName={agentFullName}
            agentPhone={listing.agentPhone}
            agentImagePath={agentImagePath}
            isLoading={isLoading}
          />
        )}

        <Tabs defaultValue='info'>
          <TabsList>
            <TabsTrigger value='info'>Informaje</TabsTrigger>
            <TabsTrigger value='location'>Lokalizacja</TabsTrigger>
          </TabsList>
          <TabsContent value='info'>
            <section className='rounded-2xl bg-white p-4 md:p-8 shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
              <ListingDetails listing={listing} propertyType={propertyType} />
              <HtmlContent
                html={listing.description || '<p>Brak opisu</p>'}
                className='mx-0 md:mx-5 text-sm text-[--color-text-primary] prose prose-neutral max-w-none'
              />
            </section>
          </TabsContent>
          <TabsContent value='location'>
            <section className='rounded-2xl bg-white p-4 md:p-6 shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
              location
            </section>
          </TabsContent>
        </Tabs>
      </div>

      {agentFullName && (
        <div className='mt-8 lg:hidden'>
          <AgentSidebar
            agentName={agentFullName}
            agentPhone={listing.agentPhone}
            agentImagePath={agentImagePath}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Contact form */}
      <div className='lg:block hidden max-w-[1200px] mx-auto mt-6'>
        <section className='rounded-2xl bg-white p-4 md:p-6 shadow-[0_8px_40px_0_rgba(164,167,174,0.12)]'>
          <div className='flex flex-col lg:flex-row gap-6'>
            {/* Agent card - desktop only */}
            {agentFullName && (
              <div className='hidden lg:block lg:w-[300px]'>
                <AgentCard
                  name={agentFullName}
                  title='Specjalista ds. nieruchomości'
                  imageSrc={agentImagePathFull}
                />
                <p className='mt-4 text-xs/5 text-[--color-text-secondary]'>
                  Administratorem danych osobowych jest Green House
                  Nieruchomości sp. z o. o. z siedzibą przy Dąbrowskiego 7 lok.
                  1, 42-202 Częstochowa &quot;Administrator&quot;, z którym
                  można się skontaktować przez adres kontakt@ghn.pl.
                </p>
              </div>
            )}

            <div className='w-full'>
              <h2 className='text-xl/7 font-bold text-[--color-text-primary]'>
                Zapytaj o ofertę
              </h2>
              <div className='mt-6 grid grid-cols-1 gap-4'>
                <div>
                  <Label className='text-xs/5 font-bold' htmlFor='name'>
                    Imię i nazwisko
                  </Label>
                  <Input
                    id='name'
                    placeholder='Imię i nazwisko'
                    className='mt-1'
                  />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-xs/5 font-bold' htmlFor='phone'>
                      Nr telefonu
                    </Label>
                    <Input
                      id='phone'
                      placeholder='Nr telefonu'
                      className='mt-1'
                    />
                  </div>
                  <div>
                    <Label className='text-xs/5 font-bold' htmlFor='email'>
                      Adres e-mail
                    </Label>
                    <Input
                      id='email'
                      placeholder='Adres e-mail'
                      className='mt-1'
                    />
                  </div>
                </div>
                <div>
                  <Label className='text-xs/5 font-bold' htmlFor='message'>
                    Treść wiadomości
                  </Label>
                  <textarea
                    id='message'
                    className='mt-1 w-full min-h-[128px] rounded-md border border-input px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
                    rows={4}
                    placeholder='Wiadomość'
                  />
                </div>
                <div className='flex items-start gap-[10px]'>
                  <input
                    id='consent'
                    type='checkbox'
                    className='size-6 rounded border border-input'
                  />
                  <label
                    htmlFor='consent'
                    className='text-xs/5 text-[--color-text-secondary]'
                  >
                    Wyrażam zgodę na przetwarzanie moich danych osobowych przez
                    firmę Green House Nieruchomości sp. z o. o. dla celów
                    związanych z działalnością pośrednictwa w obrocie
                    nieruchomościami, jednocześnie potwierdzam, iż zostałem
                    poinformowany o tym, iż będę posiadać dostęp do treści
                    swoich danych do ich edycji lub usunięcia.
                  </label>
                </div>
                <div className='flex justify-end mt-2'>
                  <Button className='rounded-xl px-6'>Wyślij</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile agent card (shown below form on mobile) */}
          {agentFullName && (
            <div className='lg:hidden mt-6'>
              <AgentCard
                name={agentFullName}
                title='Specjalista ds. nieruchomości'
                imageSrc={agentImagePathFull}
                fullWidth={true}
              />
              <p className='mt-4 text-xs/5 text-[--color-text-secondary]'>
                Administratorem danych osobowych jest Green House Nieruchomości
                sp. z o. o. z siedzibą przy Dąbrowskiego 7 lok. 1, 42-202
                Częstochowa (&quot;Administrator&quot;), z którym można się
                skontaktować przez adres kontakt@ghn.pl.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
