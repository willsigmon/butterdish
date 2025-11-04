import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch('https://givebutter.com/giftofaccess', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ButterDish/1.0)',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Extract the GB_CAMPAIGN object from the page
    // The JSON is complex and nested, so we need to be more flexible
    const campaignMatch = html.match(/window\.GB_CAMPAIGN\s*=\s*(\{[\s\S]*?\});\s*window\.givebutterDefaults/);
    
    if (!campaignMatch) {
      throw new Error('Campaign data not found in page');
    }

    const campaignData = JSON.parse(campaignMatch[1]);
    
    // Extract supporter count from the HTML
    const $ = cheerio.load(html);
    let supporterCount = 1;
    const supporterText = $('[data-part="supporters"] span').first().text();
    if (supporterText) {
      supporterCount = parseInt(supporterText) || 1;
    }

    // Clean and structure the data
    const cleanData = {
      id: campaignData.id,
      title: campaignData.title,
      goal: campaignData.goal,
      raised: parseFloat(campaignData.raised) || 0,
      raised_percentage: campaignData.raised_percentage || 0,
      supporter_count: supporterCount,
      cover_image: campaignData.cover?.url || null,
      theme_color: campaignData.settings?.find((s: any) => s.name === 'theme_color')?.value || '#F67B16',
      url: campaignData.url,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(cleanData, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59',
      },
    });
  } catch (error) {
    console.error('Error fetching campaign data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
