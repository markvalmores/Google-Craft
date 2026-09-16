// Google Maps Integration & Real-World Landmark Voxel Engine

export const GOOGLE_MAPS_API_KEY = "AIzaSyDsXmn4Uz0OGotNhv99x6qUjzRrUu4rMnc";

export interface Landmark {
  id: string;
  name: string;
  location: string;
  country: string;
  flag: string;
  lat: number;
  lng: number;
  altitudeMeters: number;
  category: 'Modern Wonder' | 'Ancient Monument' | 'Skyscraper' | 'Bridge' | 'Sacred Heritage';
  description: string;
  historicalFact: string;
  recommendedTime: 'day' | 'sunset' | 'night';
  voxelPalette: string[];
}

export const FAMOUS_LANDMARKS: Landmark[] = [
  {
    id: 'eiffel_tower',
    name: 'Eiffel Tower',
    location: 'Champ de Mars, Paris',
    country: 'France',
    flag: '🇫🇷',
    lat: 48.8584,
    lng: 2.2945,
    altitudeMeters: 330,
    category: 'Modern Wonder',
    description: 'Wrought-iron lattice tower on the Champ de Mars in Paris, constructed from 1887 to 1889.',
    historicalFact: 'Contains 18,038 metallic parts joined by 2.5 million rivets, weighing over 10,100 tons.',
    recommendedTime: 'sunset',
    voxelPalette: ['stone', 'cobblestone', 'glowstone', 'glass', 'quartz']
  },
  {
    id: 'giza_pyramid',
    name: 'Great Pyramid of Giza',
    location: 'Giza Necropolis, Cairo',
    country: 'Egypt',
    flag: '🇪🇬',
    lat: 29.9792,
    lng: 31.1342,
    altitudeMeters: 139,
    category: 'Ancient Monument',
    description: 'The oldest of the Seven Wonders of the Ancient World, built for Pharaoh Khufu circa 2560 BC.',
    historicalFact: 'Constructed with approximately 2.3 million stone blocks weighing over 2 tons each.',
    recommendedTime: 'day',
    voxelPalette: ['sandstone', 'gold', 'stone', 'tnt', 'redstone_lamp']
  },
  {
    id: 'taj_mahal',
    name: 'Taj Mahal',
    location: 'Yamuna Riverbank, Agra',
    country: 'India',
    flag: '🇮🇳',
    lat: 27.1751,
    lng: 78.0421,
    altitudeMeters: 73,
    category: 'Sacred Heritage',
    description: 'An ivory-white marble mausoleum commissioned in 1631 by Mughal Emperor Shah Jahan.',
    historicalFact: 'Incorporates symmetrical gardens, reflecting pool channels, and four tapering minarets.',
    recommendedTime: 'day',
    voxelPalette: ['quartz', 'water', 'gold', 'emerald', 'glowstone']
  },
  {
    id: 'big_ben',
    name: 'Big Ben & Elizabeth Tower',
    location: 'Westminster, London',
    country: 'United Kingdom',
    flag: '🇬🇧',
    lat: 51.5007,
    lng: -0.1246,
    altitudeMeters: 96,
    category: 'Modern Wonder',
    description: 'The iconic Gothic Revival clock tower of the Palace of Westminster, completed in 1859.',
    historicalFact: 'The Great Bell inside weighs 13.7 tonnes, chiming every hour across London.',
    recommendedTime: 'night',
    voxelPalette: ['brick', 'stone', 'quartz', 'glass', 'glowstone']
  },
  {
    id: 'statue_of_liberty',
    name: 'Statue of Liberty',
    location: 'Liberty Island, New York Harbor',
    country: 'United States',
    flag: '🇺🇸',
    lat: 40.6892,
    lng: -74.0445,
    altitudeMeters: 93,
    category: 'Modern Wonder',
    description: 'A colossal neoclassical copper sculpture on Liberty Island in New York Harbor.',
    historicalFact: 'Gift from the people of France to the United States, dedicated on October 28, 1886.',
    recommendedTime: 'sunset',
    voxelPalette: ['prismarine', 'stone', 'gold', 'water', 'glowstone']
  },
  {
    id: 'colosseum',
    name: 'The Colosseum',
    location: 'Piazza del Colosseo, Rome',
    country: 'Italy',
    flag: '🇮🇹',
    lat: 41.8902,
    lng: 12.4922,
    altitudeMeters: 48,
    category: 'Ancient Monument',
    description: 'The largest ancient amphitheatre ever built, constructed of travertine limestone and concrete.',
    historicalFact: 'Could hold an estimated 50,000 to 80,000 spectators for gladiatorial contests.',
    recommendedTime: 'day',
    voxelPalette: ['cobblestone', 'sandstone', 'dirt', 'wood', 'bricks']
  },
  {
    id: 'sydney_opera',
    name: 'Sydney Opera House',
    location: 'Bennelong Point, Sydney Harbour',
    country: 'Australia',
    flag: '🇦🇺',
    lat: -33.8568,
    lng: 151.2153,
    altitudeMeters: 65,
    category: 'Modern Wonder',
    description: 'Multi-venue performing arts centre designed by Danish architect Jørn Utzon.',
    historicalFact: 'The iconic interlocking vaulted shells are covered with 1,056,006 Swedish glazed ceramic tiles.',
    recommendedTime: 'sunset',
    voxelPalette: ['quartz', 'water', 'obsidian', 'glass', 'glowstone']
  },
  {
    id: 'torii_fuji',
    name: 'Mount Fuji & Torii Gate',
    location: 'Fujiyoshida, Honshu',
    country: 'Japan',
    flag: '🇯🇵',
    lat: 35.3606,
    lng: 138.7274,
    altitudeMeters: 3776,
    category: 'Sacred Heritage',
    description: 'Active stratovolcano and Japan’s highest peak, accompanied by traditional Shinto Torii shrines.',
    historicalFact: 'An exceptionally symmetrical cone that has inspired artists and pilgrims for centuries.',
    recommendedTime: 'day',
    voxelPalette: ['redstone_block', 'wood', 'leaves', 'stone', 'snow']
  },
  {
    id: 'christ_redeemer',
    name: 'Christ the Redeemer',
    location: 'Mount Corcovado, Rio de Janeiro',
    country: 'Brazil',
    flag: '🇧🇷',
    lat: -22.9519,
    lng: -43.2105,
    altitudeMeters: 710,
    category: 'Modern Wonder',
    description: 'Art Deco statue of Jesus Christ created by French sculptor Paul Landowski atop Corcovado mountain.',
    historicalFact: 'Stands 30 metres tall with an arm span of 28 metres, overlooking Guanabara Bay.',
    recommendedTime: 'day',
    voxelPalette: ['stone', 'quartz', 'leaves', 'grass', 'glowstone']
  },
  {
    id: 'burj_khalifa',
    name: 'Burj Khalifa',
    location: 'Downtown Dubai',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    lat: 25.1972,
    lng: 55.2744,
    altitudeMeters: 828,
    category: 'Skyscraper',
    description: 'The world’s tallest building since its topping out in 2009, standing at 828 metres.',
    historicalFact: 'Features a Y-shaped tripartite floor geometry optimized for residential and hotel space.',
    recommendedTime: 'night',
    voxelPalette: ['glass', 'diamond', 'glowstone', 'iron_block', 'quartz']
  },
  {
    id: 'golden_gate',
    name: 'Golden Gate Bridge',
    location: 'San Francisco Bay, California',
    country: 'United States',
    flag: '🇺🇸',
    lat: 37.8199,
    lng: -122.4783,
    altitudeMeters: 227,
    category: 'Bridge',
    description: 'Suspension bridge spanning the Golden Gate strait between San Francisco and Marin County.',
    historicalFact: 'The bridge’s signature International Orange color was chosen for visibility in heavy sea fogs.',
    recommendedTime: 'sunset',
    voxelPalette: ['redstone_block', 'water', 'stone', 'glowstone', 'wood']
  },
  {
    id: 'parthenon',
    name: 'The Parthenon',
    location: 'Acropolis of Athens',
    country: 'Greece',
    flag: '🇬🇷',
    lat: 37.9715,
    lng: 23.7267,
    altitudeMeters: 156,
    category: 'Ancient Monument',
    description: 'Former temple on the Athenian Acropolis, dedicated to goddess Athena during 447–432 BC.',
    historicalFact: 'Regarded as the zenith of Doric architectural order with optical refinements on its columns.',
    recommendedTime: 'day',
    voxelPalette: ['quartz', 'sandstone', 'stone', 'gold', 'leaves']
  }
];

let mapsLoadedPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  if (mapsLoadedPromise) return mapsLoadedPromise;

  mapsLoadedPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();

    // Check if already loaded
    if ((window as unknown as { google?: { maps?: unknown } }).google?.maps) {
      return resolve();
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => {
      console.warn("Google Maps script load fallback", err);
      // Resolve anyway so offline voxel sandbox works even if quota or CSP blocks
      resolve();
    };
    document.head.appendChild(script);
  });

  return mapsLoadedPromise;
}

// Convert real world lat/lng offset to voxel meter coordinates relative to landmark origin
export function coordinatesToVoxel(centerLat: number, centerLng: number, targetLat: number, targetLng: number): { x: number; z: number } {
  const metersPerLat = 111320;
  const metersPerLng = 111320 * Math.cos((centerLat * Math.PI) / 180);

  const deltaLat = targetLat - centerLat;
  const deltaLng = targetLng - centerLng;

  return {
    x: Math.round(deltaLng * metersPerLng),
    z: Math.round(-deltaLat * metersPerLat)
  };
}
