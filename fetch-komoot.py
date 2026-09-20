#!/usr/bin/env python3
"""
Fetches running and biking tours from Komoot's public API
and saves coordinates to sport/tours.json for the static heat map.

Usage: python3 fetch-komoot.py
"""

import json
import os
import sys
import urllib.request
from datetime import datetime, timezone

USER_ID = os.environ.get('KOMOOT_USER_ID', '4951883717583')
OUT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sport', 'tours.json')
SPORT_TYPES = 'jogging,racebike,mtb,touringbicycle,citybike,e_touringbicycle'


def api_get(url):
    req = urllib.request.Request(url, headers={
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0',
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def fetch_all_tours():
    tours = []
    page = 0
    total_pages = 1

    while page < total_pages:
        url = (
            f'https://www.komoot.com/api/v007/users/{USER_ID}/tours/'
            f'?sport_types={SPORT_TYPES}&type=tour_recorded'
            f'&sort_field=date&sort_direction=desc&page={page}&limit=50'
        )
        print(f'Fetching tours page {page + 1}...')
        data = api_get(url)

        embedded = data.get('_embedded', {})
        for tour in embedded.get('tours', []):
            tours.append({
                'id': tour['id'],
                'name': tour.get('name', ''),
                'sport': tour.get('sport', ''),
                'date': tour.get('date', ''),
                'distance': tour.get('distance', 0),
                'duration': tour.get('duration', 0),
                'elevation_up': tour.get('elevation_up', 0),
                'elevation_down': tour.get('elevation_down', 0),
            })

        page_info = data.get('page', {})
        total_pages = page_info.get('totalPages', 1)
        page += 1

    return tours


def fetch_tour_coordinates(tour_id):
    url = f'https://www.komoot.com/api/v007/tours/{tour_id}?_embedded=coordinates'
    data = api_get(url)
    embedded = data.get('_embedded', {})
    coords = embedded.get('coordinates', {})
    items = coords.get('items', [])
    return [[c['lat'], c['lng']] for c in items]


def main():
    print(f'Fetching Komoot tours for user {USER_ID}...')

    tours = fetch_all_tours()
    print(f'Found {len(tours)} recorded tours.')

    for i, tour in enumerate(tours):
        print(f'  [{i + 1}/{len(tours)}] Fetching coordinates for "{tour["name"]}"...')
        try:
            tour['coordinates'] = fetch_tour_coordinates(tour['id'])
        except Exception as e:
            print(f'    Warning: Could not fetch coordinates for tour {tour["id"]}: {e}')
            tour['coordinates'] = []

    output = {
        'user_id': USER_ID,
        'fetched_at': datetime.now(timezone.utc).isoformat(),
        'tours': tours,
    }

    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f'Saved {len(tours)} tours to {OUT_FILE}')


if __name__ == '__main__':
    main()
