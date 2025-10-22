import { NextResponse } from 'next/server';
import { fetchListingDetails } from '../../../services/asariApi';
import {
  AsariListingDetail,
  ListingDetailsApiResponse,
} from '@/services/asariApi.types';

export async function GET() {
  const listingIdToTest = 9760309; // Użyj ID, dla którego masz pełny JSON z poprzedniej odpowiedzi

  try {
    console.log(
      `App Router: Testing fetchListingDetails for ID: ${listingIdToTest}`
    );
    const apiResponse: ListingDetailsApiResponse =
      await fetchListingDetails(listingIdToTest);

    console.log(
      'App Router: Raw response object from fetchListingDetails:',
      JSON.stringify(apiResponse, null, 2)
    );

    if (apiResponse.success && apiResponse.data) {
      const listingData: AsariListingDetail = apiResponse.data;
      console.log(
        `App Router: Successfully fetched details for ID: ${listingData.id}`
      );
      // Możesz tu wylogować konkretne pola z listingData, aby sprawdzić ich wartości
      console.log(
        'Title (headerAdvertisement):',
        listingData.headerAdvertisement
      );
      console.log('Price amount:', listingData.price?.amount);
      console.log('Location city:', listingData.location?.locality);
      console.log('First image ID:', listingData.images?.[0]?.id);

      return NextResponse.json({
        message: `Successfully fetched details for Asari ID: ${listingIdToTest}`,
        apiSuccess: apiResponse.success,
        listingData: listingData, // Zwróć cały obiekt danych oferty
      });
    } else {
      console.error(
        'App Router: Failed to fetch details or unexpected response structure',
        apiResponse
      );
      return NextResponse.json(
        {
          message: 'Failed to fetch details or unexpected structure',
          details: apiResponse,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(
      `App Router: Error fetching details for ID ${listingIdToTest}`,
      error
    );
    const err = error as { message?: string; stack?: string };
    return NextResponse.json(
      {
        message: `Error fetching details for ID ${listingIdToTest}`,
        error: err.message,
        stack: err.stack,
      }, // Dodaj stack dla lepszego debugowania
      { status: 500 }
    );
  }
}
