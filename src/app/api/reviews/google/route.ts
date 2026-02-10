import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        const placeId = process.env.GOOGLE_PLACE_ID;

        if (!apiKey || !placeId) {
            return NextResponse.json(
                { error: 'Google Places API configuration missing' },
                { status: 500 }
            );
        }

        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}&language=th`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK') {
            return NextResponse.json(
                { error: data.error_message || 'Failed to fetch reviews' },
                { status: 400 }
            );
        }

        const reviews = data.result.reviews || [];
        // Sort by time (newest first)
        reviews.sort((a: any, b: any) => b.time - a.time);

        return NextResponse.json({
            reviews: reviews,
            rating: data.result.rating,
            total_ratings: data.result.user_ratings_total
        });

    } catch (error) {
        console.error('Error fetching Google Reviews:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
