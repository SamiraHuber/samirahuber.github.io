#!/usr/bin/env node
/**
 * Fetches running and biking tours from Komoot's public API
 * and saves coordinates to sport/tours.json for the static heat map.
 *
 * Usage:  KOMOOT_USER_ID=123456789 node fetch-komoot.js
 *    or:  set the userId below.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const USER_ID = process.env.KOMOOT_USER_ID || '4951883717583';
const OUT_FILE = path.join(__dirname, 'sport', 'tours.json');
const SPORT_TYPES = ['jogging', 'racebike', 'mtb', 'touringbicycle', 'citybike', 'e_touringbicycle'];

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'komoot-heatmap/1.0' } }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetch(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Invalid JSON from ${url}`)); }
      });
    }).on('error', reject);
  });
}

async function fetchAllTours() {
  const tours = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const url = `https://www.komoot.com/api/v007/users/${USER_ID}/tours/?sport_types=${SPORT_TYPES.join(',')}&type=tour_recorded&sort_field=date&sort_direction=desc&page=${page}&limit=50`;
    console.log(`Fetching tours page ${page + 1}...`);
    const data = await fetch(url);

    if (data._embedded && data._embedded.tours) {
      for (const tour of data._embedded.tours) {
        tours.push({
          id: tour.id,
          name: tour.name,
          sport: tour.sport,
          date: tour.date,
          distance: tour.distance,
          duration: tour.duration,
          elevation_up: tour.elevation_up,
          elevation_down: tour.elevation_down,
        });
      }
    }
    totalPages = data.page ? data.page.totalPages : 1;
    page++;
  }

  return tours;
}

async function fetchTourCoordinates(tourId) {
  const url = `https://www.komoot.com/api/v007/tours/${tourId}?_embedded=coordinates`;
  const data = await fetch(url);
  if (data._embedded && data._embedded.coordinates && data._embedded.coordinates.items) {
    return data._embedded.coordinates.items.map(c => [c.lat, c.lng]);
  }
  return [];
}

async function main() {
  if (USER_ID === 'YOUR_USER_ID_HERE') {
    console.error('Error: Set KOMOOT_USER_ID environment variable or edit USER_ID in fetch-komoot.js');
    process.exit(1);
  }

  console.log(`Fetching Komoot tours for user ${USER_ID}...`);

  const tours = await fetchAllTours();
  console.log(`Found ${tours.length} recorded tours.`);

  for (let i = 0; i < tours.length; i++) {
    const tour = tours[i];
    console.log(`  [${i + 1}/${tours.length}] Fetching coordinates for "${tour.name}"...`);
    try {
      tour.coordinates = await fetchTourCoordinates(tour.id);
    } catch (err) {
      console.warn(`    Warning: Could not fetch coordinates for tour ${tour.id}: ${err.message}`);
      tour.coordinates = [];
    }
  }

  const output = {
    user_id: USER_ID,
    fetched_at: new Date().toISOString(),
    tours,
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Saved ${tours.length} tours to ${OUT_FILE}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
