import { NextResponse } from 'next/server';
import { addReviewToDynamoDB } from '@/app/lib/dynamodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, rating, text } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ success: false, message: 'Profile ID is required' }, { status: 400 });
    }
    if (!text || typeof text !== 'string' || text.trim().length < 5) {
      return NextResponse.json({ success: false, message: 'Review text must be at least 5 characters' }, { status: 400 });
    }
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, message: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const review = {
      name: (name && typeof name === 'string' ? name.trim().slice(0, 50) : 'Anonymous'),
      rating: Math.max(1, Math.min(5, Math.round(rating))),
      text: text.trim().slice(0, 500),
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };

    const result = await addReviewToDynamoDB(id, review);
    return NextResponse.json({ success: true, review: result.review || review });
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
