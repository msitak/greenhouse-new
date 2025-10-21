import { ListingApiResponse } from '@/types/api.types';
import { PropertyDetails } from '@/types/listing.types';
import { formatFloor } from '@/lib/utils';

type ListingDetailsProps = {
  listing: ListingApiResponse;
  propertyType: string | null;
};

// Helper to safely parse propertyDetailsJson
function getPropertyDetails(listing: ListingApiResponse): PropertyDetails {
  if (!listing.propertyDetailsJson || typeof listing.propertyDetailsJson !== 'object') {
    return {};
  }
  return listing.propertyDetailsJson as PropertyDetails;
}

// Helper to get formatted listing ID
function getListingId(listing: ListingApiResponse): string {
  // Prefer exportId if available
  if (listing.exportId) {
    return listing.exportId;
  }

  // Otherwise try to get listingIdString from additionalDetailsJson
  if (
    listing.additionalDetailsJson &&
    typeof listing.additionalDetailsJson === 'object'
  ) {
    const additionalDetails = listing.additionalDetailsJson as any;
    if (additionalDetails.listingIdString) {
      return additionalDetails.listingIdString;
    }
  }

  // Fall back to asariId
  return listing.asariId.toString();
}

export default function ListingDetails({
  listing,
  propertyType,
}: ListingDetailsProps) {
  const details = getPropertyDetails(listing);

  const DetailRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | number | null | undefined;
  }) => {
    if (value === null || value === undefined || value === '') return null;

    return (
      <div className='grid grid-cols-2 gap-3 px-0 lg:px-5 py-[10px] border-b-1 border-[#00000014]'>
        <div className='text-[--color-text-secondary]'>{label}</div>
        <div className='font-bold text-[--color-text-primary] text-right'>
          {value}
        </div>
      </div>
    );
  };

  const BooleanRow = ({
    label,
    value,
    hideOnFalse = false,
  }: {
    label: string;
    value: boolean | null | undefined;
    hideOnFalse?: boolean;
  }) => {
    if (value === null || value === undefined) return null;
    if (hideOnFalse && !value) return null;
    return <DetailRow label={label} value={value ? 'Tak' : 'Nie'} />;
  };

  const ArrayRow = ({
    label,
    value,
  }: {
    label: string;
    value: Array<string | number> | null | undefined;
  }) => {
    if (!value || !Array.isArray(value) || value.length === 0) return null;
    return <DetailRow label={label} value={value.join(', ')} />;
  };

  // Helper to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className='flex flex-col text-sm w-full'>
      {/* Wspólne pola */}
      <DetailRow label='Numer oferty' value={getListingId(listing)} />
      <DetailRow
        label='Powierzchnia'
        value={listing.area ? `${listing.area} m²` : null}
      />

      {/* Pola dla mieszkań i domów */}
      {(propertyType === 'mieszkanie' || propertyType === 'dom') && (
        <>
          <DetailRow label='Pokoje' value={listing.roomsCount} />
          {propertyType === 'mieszkanie' && (
            <>
              <DetailRow label='Piętro' value={formatFloor(listing.floor)} />
              <DetailRow label='Liczba pięter' value={listing.floorCount} />
              <BooleanRow label='Winda' value={details.elevator} />
            </>
          )}
          {propertyType === 'dom' && details.lotArea && (
            <DetailRow
              label='Powierzchnia działki'
              value={`${details.lotArea} m²`}
            />
          )}
          <BooleanRow label='Możliwość zamiany' value={details.exchange} />
        </>
      )}

      {/* Pola specyficzne dla działek */}
      {propertyType === 'dzialka' && (
        <>
          <DetailRow label='Ukształtowanie działki' value={details.lotShape} />
          <DetailRow label='Forma działki' value={details.lotForm} />
          <DetailRow label='Typ' value={details.lotType} />
          <ArrayRow label='Przeznaczenie MPZP' value={details.zoningPlan} />
          <DetailRow
            label='Możliwa zabudowa'
            value={
              details.possibleDevelopmentPercent
                ? `${details.possibleDevelopmentPercent}%`
                : null
            }
          />
          <DetailRow
            label='Maksymalna wysokość zabudowy'
            value={
              details.overallHeight ? `${details.overallHeight} metrów` : null
            }
          />
          <DetailRow
            label='Forma własności'
            value={details.groundOwnershipType}
          />
          <DetailRow
            label='Media & uzbrojenie'
            value={(() => {
              const media = [];
              if (details.electricityStatus) media.push('Prąd');
              if (details.gasStatus && details.gasStatus.toLowerCase() !== 'no')
                media.push('Gaz');
              if (
                details.waterTypeList &&
                Array.isArray(details.waterTypeList) &&
                details.waterTypeList.length > 0
              ) {
                media.push('Woda');
              }
              if (
                details.sewerageTypeList &&
                Array.isArray(details.sewerageTypeList) &&
                details.sewerageTypeList.length > 0
              ) {
                media.push('Kanalizacja');
              }
              return media.length > 0 ? media.join(', ') : null;
            })()}
          />
          <BooleanRow
            label='W granicach miasta'
            value={details.urbanCo}
            hideOnFalse
          />
          <BooleanRow
            label='Pozwolenie na budowę'
            value={details.activeBuildingPermit}
            hideOnFalse
          />
          <BooleanRow
            label='Wydane warunki zabudowy'
            value={details.issuedBuildingConditions}
            hideOnFalse
          />
          <BooleanRow
            label='Możliwość podziału'
            value={details.dividingPossibility}
            hideOnFalse
          />
        </>
      )}

      {/* Pola specyficzne dla lokali użytkowych */}
      {propertyType === 'lokal' && (
        <>
          <DetailRow label='Piętro' value={formatFloor(listing.floor)} />
          <DetailRow label='Liczba pięter' value={listing.floorCount} />
        </>
      )}

      {/* Wspólne pola - kontynuacja */}
      <DetailRow
        label='Data dodania'
        value={formatDate(listing.createdAtSystem)}
      />
      {details.vacantFromDate && (
        <DetailRow
          label='Dostępne od'
          value={formatDate(details.vacantFromDate)}
        />
      )}
      <ArrayRow label='Komunikacja' value={details.communicationList} />
      <ArrayRow
        label='Dostępne w okolicy'
        value={details.availableNeighborhoodList}
      />
      <BooleanRow
        label='Oferta zewnętrzna'
        value={details.ownListing === false}
        hideOnFalse
      />

      {/* Separator before description */}
      <div className='grid grid-cols-2 gap-3 px-0 lg:px-5 py-[10px]'>
        <div className='text-[#757575]'>Opis</div>
      </div>
    </div>
  );
}
