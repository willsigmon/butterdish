import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

interface Donor {
  name: string;
  amount: number;
  time: string;
  message?: string;
}

export async function GET() {
  try {
    // Fetch the Givebutter page to get GetStream credentials
    const pageResponse = await fetch('https://givebutter.com/giftofaccess', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ButterDish/1.0)',
      },
      cache: 'no-store',
    });

    const html = await pageResponse.text();
    const $ = cheerio.load(html);

    // Extract GetStream credentials from the page
    const appId = $('[data-getstream-app-id]').attr('data-getstream-app-id');
    const token = $('[data-getstream-token]').attr('data-getstream-token');
    const apiKey = $('[data-getstream-api-key]').attr('data-getstream-api-key');

    if (!appId || !token || !apiKey) {
      throw new Error('Could not extract GetStream credentials');
    }

    // Fetch activity feed from GetStream
    const feedUrl = `https://us-east-api.stream-io-api.com/api/v1.0/enrich/feed/campaign/519661/?api_key=${apiKey}&limit=10`;
    
    const feedResponse = await fetch(feedUrl, {
      headers: {
        'Authorization': token,
        'Stream-Auth-Type': 'jwt',
      },
    });

    if (!feedResponse.ok) {
      throw new Error(`GetStream API error: ${feedResponse.statusText}`);
    }

    const feedData = await feedResponse.json();
    
    // Parse donors from the feed
    const donors: Donor[] = [];
    
    if (feedData.results && Array.isArray(feedData.results)) {
      feedData.results.forEach((activity: any) => {
        if (activity.verb === 'transaction' || activity.actor) {
          const rawAmount = activity.object?.data?.amount || activity.amount || 0;
          donors.push({
            name: activity.actor?.data?.name || activity.actor?.name || 'A generous supporter',
            amount: typeof rawAmount === 'string' ? parseFloat(rawAmount) : rawAmount,
            time: new Date(activity.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            message: activity.object?.data?.message || activity.message,
          });
        }
      });
    }

    return NextResponse.json({ donors }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59',
      },
    });
  } catch (error) {
    console.error('Error fetching donors:', error);
    
    // Return sample data as fallback
    return NextResponse.json({
      donors: [
        { name: 'Mark Williams', amount: 10, time: new Date(Date.now() - 1860000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) },
        { name: 'Will Sigmon', amount: 5, time: new Date(Date.now() - 7200000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), message: "Let's go, HTI!" },
      ],
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30',
      },
    });
  }
}
