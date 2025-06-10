import { NextResponse } from 'next/server';
import { fetchExportedListingIds, fetchListingDetails } from '../../../services/asariApi';

export async function GET() {
  try {
    console.log("App Router API Route /api/test-asari-ids called");
    const asariResponse = await fetchExportedListingIds();
    const fetchListingDetailsTest = await fetchListingDetails(12225899)

    //console.log("RAW asariResponse from fetchExportedListingIds:", JSON.stringify(asariResponse, null, 2));
    console.log(JSON.stringify(fetchListingDetailsTest, null, 2))
    
    if (asariResponse && asariResponse.data) {
      console.log(`App Router: Successfully fetched ${asariResponse.data.length} IDs.`);
      return NextResponse.json({ 
        message: 'Successfully fetched listing IDs from Asari', 
        count: asariResponse.data.length,
        data: asariResponse.data.slice(0, 10) 
      });
    } else {
      console.error("App Router: Unexpected response from fetchExportedListingIds", asariResponse);
      return NextResponse.json({ message: 'Unexpected response structure from Asari API' }, { status: 500 });
    }
  } catch (error: any) {
    console.error("App Router: Error fetching from Asari API", error);
    return NextResponse.json({ message: 'Error fetching from Asari API', error: error.message }, { status: 500 });
  }
}