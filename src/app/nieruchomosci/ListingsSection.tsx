import ListingRow from '@/components/listings/ListingRow';
import {
  getCachedListings,
  GetListingsParams,
} from '@/services/listings.queries';

export default async function ListingsSection(props: GetListingsParams) {
  const listings = await getCachedListings(props);

  return (
    <div className='space-y-6'>
      {listings.map((l, i) => (
        <ListingRow
          key={l.id}
          listing={l}
          isReservation={l.isReservation === true}
          isSpecial={false}
          priority={i < 2}
        />
      ))}
    </div>
  );
}
