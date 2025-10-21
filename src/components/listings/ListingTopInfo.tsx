import { ListingApiResponse } from '@/types/api.types';
import { PropertyDetails } from '@/types/listing.types';
import { formatFloor } from '@/lib/utils';

type ListingTopInfoProps = {
  listing: ListingApiResponse;
  propertyType: string | null;
};

// Helper to safely parse propertyDetailsJson
function getPropertyDetails(listing: ListingApiResponse): PropertyDetails {
  if (
    !listing.propertyDetailsJson ||
    typeof listing.propertyDetailsJson !== 'object'
  ) {
    return {};
  }
  return listing.propertyDetailsJson as PropertyDetails;
}

export default function ListingTopInfo({
  listing,
  propertyType,
}: ListingTopInfoProps) {
  const details = getPropertyDetails(listing);

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | number | null | undefined;
  }) => {
    if (!value) return null;

    return (
      <div className='flex justify-between px-5 py-[10px] border-b-1 border-[#00000014] last:border-b-0'>
        <div className='text-[--color-text-secondary]'>{label}</div>
        <div className='font-bold text-[--color-text-primary]'>{value}</div>
      </div>
    );
  };

  // Wspólne pola dla wszystkich typów
  const commonRows = (
    <>
      <InfoRow label='Lokalizacja' value={listing.locationCity} />
      <InfoRow
        label='Powierzchnia'
        value={listing.area ? `${listing.area} m²` : null}
      />
    </>
  );

  // Specyficzne dla mieszkań i domów
  if (propertyType === 'mieszkanie' || propertyType === 'dom') {
    return (
      <div className='flex flex-col text-sm w-full lg:w-[360px] lg:mt-6'>
        {commonRows}
        <InfoRow label='Pokoje' value={listing.roomsCount} />
        {propertyType === 'dom' && details.lotArea && (
          <InfoRow
            label='Powierzchnia działki'
            value={`${details.lotArea} m²`}
          />
        )}
      </div>
    );
  }

  // Specyficzne dla działek
  if (propertyType === 'dzialka') {
    return (
      <div className='flex flex-col text-sm w-full lg:w-[360px] lg:mt-6'>
        {commonRows}
        <InfoRow label='Ukształtowanie działki' value={details.lotShape} />
      </div>
    );
  }

  // Specyficzne dla lokali użytkowych
  if (propertyType === 'lokal') {
    return (
      <div className='flex flex-col text-sm w-full lg:w-[360px] lg:mt-6'>
        {commonRows}
        <InfoRow label='Piętro' value={formatFloor(listing.floor)} />
      </div>
    );
  }

  // Fallback - podstawowe info
  return (
    <div className='flex flex-col text-sm w-full lg:w-[360px] lg:mt-6'>
      {commonRows}
      {listing.roomsCount && (
        <InfoRow label='Pokoje' value={listing.roomsCount} />
      )}
    </div>
  );
}
