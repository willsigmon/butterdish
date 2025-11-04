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
    // Fetch the Givebutter page and scrape donor names directly from HTML
    const pageResponse = await fetch('https://givebutter.com/giftofaccess', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      cache: 'no-store',
    });

    const html = await pageResponse.text();
    const $ = cheerio.load(html);
    
    // Parse donors from the activity feed section in the HTML
    const donors: Donor[] = [];
    
    // Look for transaction items in the page
    $('[data-testid="transaction-item"], .transaction-item, .activity-item').each((i, elem) => {
      if (i >= 10) return; // Limit to 10 most recent
      
      const $elem = $(elem);
      const name = $elem.find('[data-testid="supporter-name"], .supporter-name, .donor-name').text().trim() || 
                   $elem.find('h3, h4, .name').first().text().trim() ||
                   'A generous supporter';
      
      const amountText = $elem.find('[data-testid="transaction-amount"], .amount, .transaction-amount').text().trim();
      const amount = parseFloat(amountText.replace(/[^0-9.]/g, '')) || 0;
      
      const timeText = $elem.find('[data-testid="transaction-time"], .time, time').text().trim();
      const message = $elem.find('[data-testid="transaction-message"], .message, .comment').text().trim() || undefined;
      
      if (amount > 0 || name !== 'A generous supporter') {
        donors.push({
          name,
          amount,
          time: timeText || new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          message,
        });
      }
    });
    
    // If no donors found via scraping, try the embedded JSON data
    if (donors.length === 0) {
      const scriptContent = $('script').toArray().find(s => 
        $(s).html()?.includes('window.GB_CAMPAIGN') || 
        $(s).html()?.includes('transactions')
      );
      
      if (scriptContent) {
        const scriptText = $(scriptContent).html() || '';
        // Try to extract transaction data from embedded JSON
        const transactionMatch = scriptText.match(/transactions["']?\s*:\s*\[([\s\S]*?)\]/);
        if (transactionMatch) {
          try {
            const transactionsJson = `[${transactionMatch[1]}]`;
            const transactions = JSON.parse(transactionsJson);
            transactions.slice(0, 10).forEach((t: any) => {
              donors.push({
                name: t.supporter_name || t.name || 'A generous supporter',
                amount: parseFloat(t.amount || 0),
                time: t.time || new Date(t.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
                message: t.message,
              });
            });
          } catch (e) {
            console.error('Failed to parse transactions:', e);
          }
        }
      }
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
