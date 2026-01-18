#!/usr/bin/env node
/**
 * Script per scrapare le recensioni da Google Maps e inserirle in Supabase
 *
 * Uso: node scripts/scrape-google-reviews.mjs
 *
 * Requisiti:
 * - SUPABASE_URL e SUPABASE_SERVICE_KEY nelle variabili d'ambiente
 * - Puppeteer installato (npm install puppeteer)
 */

import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

// ============================================
// CONFIGURAZIONE VILLA MAREBLU
// ============================================

// URL diretto a Villa MareBlu su Google Maps (con CID verificato)
// CID: 0x13442aef4bc92ee3:0xc5a77b4b7764eed3
const GOOGLE_MAPS_URL = 'https://www.google.com/maps/place/Villa+MareBlu/@39.8234857,18.293381,17z/data=!4m8!3m7!1s0x13442aef4bc92ee3:0xc5a77b4b7764eed3!8m2!3d39.8234857!4d18.293381!9m1!1b1';

// Place ID ufficiale Villa MareBlu (più affidabile dell'URL)
const PLACE_ID = 'ChIJdafBgOQJRBMRfE49ZgGIs2E';

// ============================================

// Supabase config
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Errore: Configura SUPABASE_URL e SUPABASE_SERVICE_KEY');
  console.log('\nEsempio:');
  console.log('SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx node scripts/scrape-google-reviews.mjs');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Genera un hash univoco per una recensione (per evitare duplicati)
 */
function generateReviewId(authorName, rating, textSnippet) {
  const str = `${authorName}-${rating}-${textSnippet?.substring(0, 50) || 'no-text'}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `google_${Math.abs(hash)}`;
}

/**
 * Converte il tempo relativo in data approssimativa
 */
function parseRelativeTime(relativeTime) {
  if (!relativeTime) return null;

  const now = new Date();
  const lower = relativeTime.toLowerCase();

  if (lower.includes('giorn')) {
    const days = parseInt(lower) || 1;
    now.setDate(now.getDate() - days);
  } else if (lower.includes('settiman')) {
    const weeks = parseInt(lower) || 1;
    now.setDate(now.getDate() - (weeks * 7));
  } else if (lower.includes('mes')) {
    const months = parseInt(lower) || 1;
    now.setMonth(now.getMonth() - months);
  } else if (lower.includes('ann')) {
    const years = parseInt(lower) || 1;
    now.setFullYear(now.getFullYear() - years);
  }

  return now.toISOString();
}

/**
 * Scrapa le recensioni da Google Maps usando Puppeteer
 */
async function scrapeGoogleReviews() {
  console.log('🚀 Avvio scraping recensioni Google Maps...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080',
      '--lang=it-IT'
    ]
  });

  try {
    const page = await browser.newPage();

    // Imposta user agent per sembrare un browser reale
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Imposta lingua italiana
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7'
    });

    // Costruisci URL
    let url = GOOGLE_MAPS_URL;
    if (PLACE_ID) {
      url = `https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`;
    }

    console.log(`📍 Navigando a: ${url}\n`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    // Accetta cookies se presente il banner
    try {
      const acceptButton = await page.$('button[aria-label*="Accetta"]');
      if (acceptButton) {
        await acceptButton.click();
        await page.waitForTimeout(2000);
      }
    } catch (e) {
      // Banner non presente, continua
    }

    // Clicca sul tab "Recensioni" se non siamo già lì
    try {
      const reviewsTab = await page.$('button[data-tab-index="1"]');
      if (reviewsTab) {
        await reviewsTab.click();
        await page.waitForTimeout(3000);
      }
    } catch (e) {
      console.log('ℹ️  Tab recensioni non trovato, potremmo già essere nella pagina giusta');
    }

    // Attendi che le recensioni siano caricate
    await page.waitForSelector('[data-review-id], .jftiEf', { timeout: 30000 }).catch(() => {
      console.log('⚠️  Selettore recensioni non trovato, provo con selettori alternativi...');
    });

    // Scrolla per caricare tutte le recensioni
    console.log('📜 Caricamento tutte le recensioni (scrolling)...');

    const scrollableDiv = await page.$('div.m6QErb.DxyBCb.kA9KIf.dS8AEf');
    if (scrollableDiv) {
      let previousHeight = 0;
      let scrollAttempts = 0;
      const maxScrollAttempts = 20;

      while (scrollAttempts < maxScrollAttempts) {
        await page.evaluate((el) => {
          el.scrollTop = el.scrollHeight;
        }, scrollableDiv);

        await page.waitForTimeout(2000);

        const currentHeight = await page.evaluate((el) => el.scrollHeight, scrollableDiv);

        if (currentHeight === previousHeight) {
          break;
        }

        previousHeight = currentHeight;
        scrollAttempts++;
        console.log(`   Scroll ${scrollAttempts}/${maxScrollAttempts}...`);
      }
    }

    // Espandi tutte le recensioni "Altro"
    const moreButtons = await page.$$('button.w8nwRe.kyuRq');
    for (const btn of moreButtons) {
      try {
        await btn.click();
        await page.waitForTimeout(500);
      } catch (e) {
        // Continua se il click fallisce
      }
    }

    // Estrai le recensioni
    console.log('\n📊 Estrazione recensioni...\n');

    const reviews = await page.evaluate(() => {
      const reviewElements = document.querySelectorAll('[data-review-id], .jftiEf');
      const results = [];

      reviewElements.forEach((el) => {
        try {
          // Nome autore
          const authorEl = el.querySelector('.d4r55, .WNxzHc .qLhwHc span');
          const authorName = authorEl?.textContent?.trim() || 'Anonimo';

          // Rating (stelle)
          const ratingEl = el.querySelector('.kvMYJc, .DU9Pgb span[role="img"]');
          let rating = 5;
          if (ratingEl) {
            const ariaLabel = ratingEl.getAttribute('aria-label');
            if (ariaLabel) {
              const match = ariaLabel.match(/(\d)/);
              if (match) rating = parseInt(match[1]);
            }
          }

          // Testo recensione
          const textEl = el.querySelector('.wiI7pd, .MyEned span');
          const text = textEl?.textContent?.trim() || '';

          // Tempo relativo
          const timeEl = el.querySelector('.rsqaWe, .xRkPPb');
          const relativeTime = timeEl?.textContent?.trim() || '';

          // Foto profilo
          const photoEl = el.querySelector('.NBa7we, img.lDY1rd');
          const profilePhoto = photoEl?.getAttribute('src') || '';

          if (authorName && authorName !== 'Anonimo') {
            results.push({
              authorName,
              rating,
              text,
              relativeTime,
              profilePhoto
            });
          }
        } catch (e) {
          console.error('Errore parsing recensione:', e);
        }
      });

      return results;
    });

    console.log(`✅ Trovate ${reviews.length} recensioni\n`);

    return reviews;

  } finally {
    await browser.close();
  }
}

/**
 * Inserisce le recensioni in Supabase
 */
async function insertReviewsToSupabase(reviews) {
  console.log('💾 Inserimento recensioni in Supabase...\n');

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const review of reviews) {
    const googleReviewId = generateReviewId(review.authorName, review.rating, review.text);

    const reviewData = {
      author_name: review.authorName,
      rating: review.rating,
      text: review.text || null,
      relative_time: review.relativeTime || null,
      review_date: parseRelativeTime(review.relativeTime),
      profile_photo_url: review.profilePhoto || null,
      google_review_id: googleReviewId
    };

    try {
      const { error } = await supabase
        .from('reviews')
        .upsert(reviewData, {
          onConflict: 'google_review_id',
          ignoreDuplicates: false
        });

      if (error) {
        if (error.code === '23505') { // Duplicate
          skipped++;
          console.log(`⏭️  Saltata (duplicato): ${review.authorName}`);
        } else {
          errors++;
          console.error(`❌ Errore: ${review.authorName} - ${error.message}`);
        }
      } else {
        inserted++;
        console.log(`✅ Inserita: ${review.authorName} - ${'⭐'.repeat(review.rating)}`);
      }
    } catch (e) {
      errors++;
      console.error(`❌ Eccezione: ${review.authorName} - ${e.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 RIEPILOGO:`);
  console.log(`   ✅ Inserite: ${inserted}`);
  console.log(`   ⏭️  Saltate (duplicati): ${skipped}`);
  console.log(`   ❌ Errori: ${errors}`);
  console.log('='.repeat(50));

  return { inserted, skipped, errors };
}

/**
 * Calcola statistiche aggregate
 */
async function calculateAggregateRating() {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating');

  if (error || !data || data.length === 0) {
    return null;
  }

  const total = data.length;
  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  const average = (sum / total).toFixed(1);

  console.log(`\n⭐ Rating aggregato: ${average}/5 (${total} recensioni)`);

  return { average: parseFloat(average), total };
}

// Main
async function main() {
  console.log('='.repeat(50));
  console.log('🌟 SCRAPER RECENSIONI GOOGLE MAPS');
  console.log('   Villa MareBlu - Torre Vado');
  console.log('='.repeat(50) + '\n');

  if (!GOOGLE_MAPS_URL && !PLACE_ID) {
    console.error('❌ Errore: Configura GOOGLE_MAPS_URL o PLACE_ID nello script!');
    console.log('\nPer trovare il Place ID:');
    console.log('1. Vai su https://developers.google.com/maps/documentation/places/web-service/place-id');
    console.log('2. Cerca "Villa MareBlu Torre Vado"');
    console.log('3. Copia il Place ID e inseriscilo nello script');
    process.exit(1);
  }

  try {
    // 1. Scrapa recensioni
    const reviews = await scrapeGoogleReviews();

    if (reviews.length === 0) {
      console.log('⚠️  Nessuna recensione trovata. Verifica l\'URL o il Place ID.');
      process.exit(1);
    }

    // 2. Inserisci in Supabase
    await insertReviewsToSupabase(reviews);

    // 3. Calcola rating aggregato
    await calculateAggregateRating();

    console.log('\n✅ Completato!\n');

  } catch (error) {
    console.error('\n❌ Errore fatale:', error.message);
    process.exit(1);
  }
}

main();
