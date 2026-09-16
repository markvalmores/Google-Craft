// Google Maps Integration & Real-World Landmark Voxel Engine

export const GOOGLE_MAPS_API_KEY = "AIzaSyDsXmn4Uz0OGotNhv99x6qUjzRrUu4rMnc";

export interface SpawnPoint {
  id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  z: number;
  pitch: number;
  yaw: number;
  description: string;
}

export interface Landmark {
  id: string;
  name: string;
  location: string;
  country: string;
  flag: string;
  lat: number;
  lng: number;
  altitudeMeters: number;
  category: 'Modern Wonder' | 'Ancient Monument' | 'Skyscraper' | 'Bridge' | 'Sacred Heritage' | 'Festive Occasion';
  description: string;
  historicalFact: string;
  recommendedTime: 'day' | 'sunset' | 'night';
  voxelPalette: string[];
  spawnPoints?: SpawnPoint[];
}

export const FAMOUS_LANDMARKS: Landmark[] = [
  {
    id: 'times_square',
    name: 'Times Square & Broadway',
    location: 'Manhattan, New York City',
    country: 'United States',
    flag: '🇺🇸',
    lat: 40.7580,
    lng: -73.9855,
    altitudeMeters: 15,
    category: 'Modern Wonder',
    description: 'The Crossroads of the World in NYC, illuminated by towering neon billboards, Broadway theaters, and bustling avenues.',
    historicalFact: 'Originally Longacre Square, renamed in 1904 when the New York Times moved to One Times Square.',
    recommendedTime: 'night',
    voxelPalette: ['stone', 'glass', 'glowstone', 'redstone_lamp', 'diamond_block', 'gold_block']
  },
  {
    id: 'mount_calvary_holy_week',
    name: 'Mount Calvary (Golgotha)',
    location: 'Ancient Jerusalem Hill',
    country: 'Israel / Holy Land',
    flag: '✝️',
    lat: 31.7784,
    lng: 35.2297,
    altitudeMeters: 770,
    category: 'Sacred Heritage',
    description: 'The sacred hill of Golgotha where Lord Jesus Christ was crucified on the center cross alongside the two thieves on the left and right, with the garden tomb and resurrection dawn.',
    historicalFact: 'Golgotha in Aramaic translates to "Place of the Skull", standing just outside the ancient second wall of Jerusalem.',
    recommendedTime: 'sunset',
    voxelPalette: ['stone', 'cobblestone', 'sandstone', 'oak_planks', 'gold_block', 'glowstone']
  },
  {
    id: 'north_pole_xmas',
    name: 'North Pole Santa Workshop',
    location: 'Arctic Ice Cap, North Pole',
    country: 'Arctic',
    flag: '🎅',
    lat: 90.0000,
    lng: 0.0000,
    altitudeMeters: 1,
    category: 'Festive Occasion',
    description: 'Winter wonderland at the North Pole featuring a 25m decorated Christmas tree with a golden star, candy cane columns, present gift voxels, and glowing fairy lanterns.',
    historicalFact: 'Tradition places Santa’s magical workshop and toy factory amidst the frozen boreal glow of the Northern Lights.',
    recommendedTime: 'night',
    voxelPalette: ['quartz', 'glowstone', 'gold_block', 'diamond_block', 'tnt', 'oak_leaves']
  },
  {
    id: 'japan_new_year',
    name: 'Tokyo New Year Shrine',
    location: 'Shibuya & Mount Fuji, Honshu',
    country: 'Japan',
    flag: '🇯🇵',
    lat: 35.6580,
    lng: 139.7016,
    altitudeMeters: 40,
    category: 'Festive Occasion',
    description: 'Celebrate the New Year in Japan with monumental red Torii gates, blooming pink cherry blossoms, traditional lanterns, and fireworks exploding in the night sky.',
    historicalFact: 'Hatsumode is the Japanese tradition of visiting a Shinto shrine during the first days of the new year for health and prosperity.',
    recommendedTime: 'night',
    voxelPalette: ['redstone_lamp', 'gold_block', 'oak_planks', 'oak_leaves', 'glowstone']
  },
  {
    id: 'paris_valentines',
    name: 'Paris City of Love & Locks',
    location: 'Pont des Arts & Eiffel Tower, Paris',
    country: 'France',
    flag: '💖',
    lat: 48.8584,
    lng: 2.2945,
    altitudeMeters: 330,
    category: 'Festive Occasion',
    description: 'Paris bathed in radiant romantic rose-pink illumination, featuring the Eiffel Tower, the Pont des Arts love locks bridge, and sculpted glowing heart monuments.',
    historicalFact: 'Thousands of couples historically attached engraved padlocks to the Pont des Arts railing to seal their eternal love before throwing the key into the Seine.',
    recommendedTime: 'sunset',
    voxelPalette: ['quartz', 'glowstone', 'gold_block', 'diamond_block', 'water']
  },
  {
    id: 'halloween_cemetery',
    name: 'Gothic Haunted Cemetery',
    location: 'Ancient Transylvanian Crypt',
    country: 'Romania',
    flag: '🎃',
    lat: 45.6579,
    lng: 25.6012,
    altitudeMeters: 600,
    category: 'Festive Occasion',
    description: 'Eerie Gothic cemetery surrounded by wrought-iron fences, ancient mossy tombstones, carved glowing Jack-o\'-Lantern pumpkins, and a haunted stone mausoleum.',
    historicalFact: 'Carving vegetables into Jack-o\'-lanterns originated from the ancient Celtic festival of Samhain to ward off wandering spirits.',
    recommendedTime: 'night',
    voxelPalette: ['stone', 'cobblestone', 'glowstone', 'obsidian', 'redstone_lamp']
  },
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
    voxelPalette: ['sandstone', 'gold_block', 'stone', 'tnt', 'redstone_lamp']
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
    voxelPalette: ['quartz', 'water', 'gold_block', 'diamond_block', 'glowstone']
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
    voxelPalette: ['bricks', 'stone', 'quartz', 'glass', 'glowstone']
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
    voxelPalette: ['diamond_block', 'stone', 'gold_block', 'water', 'glowstone']
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
    voxelPalette: ['cobblestone', 'sandstone', 'oak_planks', 'stone', 'bricks']
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
    voxelPalette: ['redstone_lamp', 'oak_planks', 'oak_leaves', 'stone', 'quartz']
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
    voxelPalette: ['stone', 'quartz', 'oak_leaves', 'grass', 'glowstone']
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
    voxelPalette: ['glass', 'diamond_block', 'glowstone', 'quartz']
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
    voxelPalette: ['redstone_lamp', 'water', 'stone', 'glowstone', 'oak_planks']
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
    voxelPalette: ['quartz', 'sandstone', 'stone', 'gold_block', 'oak_leaves']
  }
];

let mapsLoadedPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  if (mapsLoadedPromise) return mapsLoadedPromise;

  mapsLoadedPromise = new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve();

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
      resolve();
    };
    document.head.appendChild(script);
  });

  return mapsLoadedPromise;
}

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

export function voxelToCoordinates(centerLat: number, centerLng: number, voxelX: number, voxelZ: number): { lat: number; lng: number } {
  const metersPerLat = 111320;
  const metersPerLng = 111320 * Math.cos((centerLat * Math.PI) / 180);

  return {
    lat: centerLat - (voxelZ / metersPerLat),
    lng: centerLng + (voxelX / metersPerLng)
  };
}

export interface BlockArchitecturalInfo {
  landmarkId: string;
  landmarkName: string;
  componentName: string;
  yearBuilt: string;
  architectOrCulture: string;
  materialComposition: string;
  engineeringRole: string;
  historicalContext: string;
  googleMapsPlaceData: string;
}

export function getVoxelArchitecturalInfo(
  landmark: Landmark,
  blockType: string,
  x: number,
  y: number,
  z: number
): BlockArchitecturalInfo {
  const coords = voxelToCoordinates(landmark.lat, landmark.lng, x, z);
  const geoStr = `${coords.lat.toFixed(5)}°N, ${coords.lng.toFixed(5)}°E`;

  if (landmark.id === 'mount_calvary_holy_week') {
    if (Math.abs(x) <= 2 && y >= 6) {
      return {
        landmarkId: landmark.id,
        landmarkName: landmark.name,
        componentName: 'Center Cross of Lord Jesus Christ',
        yearBuilt: 'c. 30–33 AD (Jerusalem)',
        architectOrCulture: 'Holy Biblical Scriptures & Resurrection',
        materialComposition: 'Rough-Hewn Olive Wood & Gilded Divine Halo',
        engineeringRole: 'Sacred Center Cross atop Mount Calvary Hill',
        historicalContext: 'The place where Lord Jesus Christ triumphed over sin and death, offering salvation and redemption, flanked by the two thieves, celebrated worldwide during Holy Week and Easter.',
        googleMapsPlaceData: `Google Maps Grid [Mount Calvary / Golgotha]: ${geoStr}`
      };
    } else if (Math.abs(x) > 2 && Math.abs(x) <= 8 && y >= 4) {
      return {
        landmarkId: landmark.id,
        landmarkName: landmark.name,
        componentName: x < 0 ? 'Left Cross (The Penitent Thief St. Dismas)' : 'Right Cross (The Unrepentant Thief Gestas)',
        yearBuilt: 'c. 30–33 AD (Jerusalem)',
        architectOrCulture: 'Holy Land Biblical History',
        materialComposition: 'Cypress & Olive Timber Crossbeams',
        engineeringRole: 'Companion Crosses on Mount Calvary',
        historicalContext: 'The two thieves crucified on each side of Christ; to Dismas, Jesus spoke: "Truly I tell you, today you will be with me in Paradise."',
        googleMapsPlaceData: `Google Maps Grid [Golgotha Ridge]: ${geoStr}`
      };
    }
  }

  if (landmark.id === 'times_square') {
    return {
      landmarkId: landmark.id,
      landmarkName: landmark.name,
      componentName: 'Times Square Neon High-Definition Billboard Matrix',
      yearBuilt: 'Continuous 1904 – Present',
      architectOrCulture: 'Manhattan Midtown Architectural District',
      materialComposition: 'Tempered Display Glass, LED Arrays & Structural Steel Trusses',
      engineeringRole: 'High-luminosity commercial display facade at Broadway & 7th Ave',
      historicalContext: 'Times Square receives over 50 million visitors annually and serves as the iconic epicenter for New Year’s Eve Ball Drop celebrations.',
      googleMapsPlaceData: `Google Maps Grid [Times Square Plaza]: ${geoStr}`
    };
  }

  if (landmark.id === 'north_pole_xmas') {
    return {
      landmarkId: landmark.id,
      landmarkName: landmark.name,
      componentName: 'North Pole Great Evergreen & Santa Workshop Lodge',
      yearBuilt: 'Festive Holiday Legend',
      architectOrCulture: 'Arctic Elves & Santa Claus Guild',
      materialComposition: 'Pine Wood, Gold Star Crown, Festive Baubles & Sugar Cane',
      engineeringRole: 'Illuminated 25m Evergreen Christmas Tree with Golden Star Apex',
      historicalContext: 'The heart of Christmas cheer at 90°N latitude, surrounded by snowdrifts, wrapped gift boxes, and the shimmering green Aurora Borealis.',
      googleMapsPlaceData: `Google Maps Grid [North Pole 90°N]: ${geoStr}`
    };
  }

  if (landmark.id === 'eiffel_tower') {
    if (y <= 1) {
      return {
        landmarkId: landmark.id,
        landmarkName: landmark.name,
        componentName: 'Champ de Mars Compressed-Air Caisson Pier',
        yearBuilt: 'January 1887 – June 1887',
        architectOrCulture: 'Gustave Eiffel & Maurice Koechlin',
        materialComposition: 'Hydraulic Lime Concrete & Masonry Footings',
        engineeringRole: 'Anchored 15m deep into Seine silt with pressurized pneumatic caissons',
        historicalContext: 'Four inclined piers distribute 10,100 tonnes with ground pressure of only 4.5 kg/cm², equal to an average seated person.',
        googleMapsPlaceData: `Google Maps Grid [Champ de Mars]: ${geoStr}`
      };
    } else if (y <= 8) {
      return {
        landmarkId: landmark.id,
        landmarkName: landmark.name,
        componentName: 'Bipod Pier Lattice Truss & Hydraulic Jack Sockets',
        yearBuilt: '1887 – 1888',
        architectOrCulture: 'Émile Nouguier & Maurice Koechlin',
        materialComposition: 'Puddle Iron (Low-Carbon Refined Forged Pig Iron)',
        engineeringRole: 'Inclined at 54° using 800-tonne hydraulic jacks to calibrate initial equilibrium',
        historicalContext: 'Each rivet was heated cherry-red and hammered by a four-man gang; 2.5 million rivets hold 18,038 discrete metal girders together.',
        googleMapsPlaceData: `Google Maps Grid [East Pillar]: ${geoStr}`
      };
    } else if (y <= 16) {
      return {
        landmarkId: landmark.id,
        landmarkName: landmark.name,
        componentName: '1st & 2nd Platform Grand Promenade',
        yearBuilt: '1888 – 1889',
        architectOrCulture: 'Stephen Sauvestre (Chief Aesthetic Architect)',
        materialComposition: 'Riveted Iron Plate Girders & Safety Balustrades',
        engineeringRole: 'Houses historical observation platforms and meteorological laboratory',
        historicalContext: 'Stephen Sauvestre added monumental decorative arches spanning the legs to reassure 19th-century visitors of structural stability.',
        googleMapsPlaceData: `Google Maps Grid [Level 2 Observation Deck]: ${geoStr}`
      };
    } else {
      return {
        landmarkId: landmark.id,
        landmarkName: landmark.name,
        componentName: 'Summit Radio Mast & Rotary Navigation Beacon',
        yearBuilt: '1889 (Electrified 1900)',
        architectOrCulture: 'Gustave Eiffel & General Gustave Ferrié',
        materialComposition: 'Galvanized Wrought Iron Spire & Xenon Projectors',
        engineeringRole: 'High-altitude telecommunications mast and airspace light beacon',
        historicalContext: 'Gustave Eiffel saved the tower from its mandated 20-year demolition by transforming the summit into a military radio transmitter.',
        googleMapsPlaceData: `Google Maps Grid [300m Pinnacle Spire]: ${geoStr}`
      };
    }
  }

  // Default architectural dossier for any other landmark voxel
  return {
    landmarkId: landmark.id,
    landmarkName: landmark.name,
    componentName: `${landmark.name} Structural Voxel Component`,
    yearBuilt: 'Historic Architectural Era',
    architectOrCulture: `${landmark.country} Heritage Builders`,
    materialComposition: `${blockType.replace(/_/g, ' ').toUpperCase()} Architectural Medium`,
    engineeringRole: `Elevation ${y}m load-bearing matrix in ${landmark.category} grid`,
    historicalContext: landmark.description + ' ' + landmark.historicalFact,
    googleMapsPlaceData: `Google Maps Coordinates: ${geoStr} • Alt: ${landmark.altitudeMeters}m`
  };
}

// Landmark Spawn Points System
export function getLandmarkSpawnPoints(landmark: Landmark): SpawnPoint[] {
  switch (landmark.id) {
    case 'mount_calvary_holy_week':
      return [
        {
          id: 'calvary_golden_path',
          name: 'Calvary Path (Looking Up at 3 Crosses)',
          icon: '✝️',
          x: 0,
          y: 2,
          z: 22,
          yaw: 0,
          pitch: 0.2,
          description: 'Spawns facing the rocky hill of Golgotha looking directly up at the Center Cross of Lord Jesus Christ and the two thieves.'
        },
        {
          id: 'calvary_summit',
          name: 'Summit of Golgotha',
          icon: '👑',
          x: 0,
          y: 10,
          z: 6,
          yaw: 0,
          pitch: 0.05,
          description: 'High elevation summit right beside the divine golden halo cross.'
        },
        {
          id: 'calvary_garden_tomb',
          name: 'Garden Tomb & Rolled Stone',
          icon: '🪨',
          x: 9,
          y: 3,
          z: 16,
          yaw: -0.25,
          pitch: 0.05,
          description: 'Beside the stone rolled away from the tomb celebrating the resurrection.'
        },
        {
          id: 'calvary_olive_grove',
          name: 'Ancient Olive Grove Vista',
          icon: '🫒',
          x: -14,
          y: 3,
          z: -8,
          yaw: 1.2,
          pitch: 0.1,
          description: 'Scenic vista looking across ancient olive trees.'
        }
      ];

    case 'north_pole_xmas':
      return [
        {
          id: 'north_pole_tree_view',
          name: '25m Christmas Tree Courtyard',
          icon: '🎄',
          x: 0,
          y: 2,
          z: 20,
          yaw: 0,
          pitch: 0.25,
          description: 'Spawns in the snow plaza looking up at the illuminated 25m evergreen tree, Bethlehem star, and wrapped presents.'
        },
        {
          id: 'north_pole_santa_porch',
          name: "Santa's Workshop Porch",
          icon: '🎅',
          x: 8,
          y: 2,
          z: 0,
          yaw: 1.57,
          pitch: 0.05,
          description: 'Outside the brick & log cabin workshop surrounded by toy gift boxes.'
        },
        {
          id: 'north_pole_high_aurora',
          name: 'Aurora Borealis High Overlook',
          icon: '🌌',
          x: 0,
          y: 22,
          z: 14,
          yaw: 0,
          pitch: -0.3,
          description: 'Panoramic high-altitude aerial view of the North Pole festive camp.'
        }
      ];

    case 'japan_new_year':
      return [
        {
          id: 'japan_torii_gate',
          name: 'Grand Torii Gate Entrance',
          icon: '⛩️',
          x: 0,
          y: 2,
          z: 22,
          yaw: 0,
          pitch: 0.1,
          description: 'Directly in front of the vermilion red Shinto Torii gate with fireworks bursting overhead.'
        },
        {
          id: 'japan_sakura_garden',
          name: 'Blooming Sakura Blossom Canopy',
          icon: '🌸',
          x: 10,
          y: 2,
          z: 8,
          yaw: -1.2,
          pitch: 0.15,
          description: 'Beneath the pink cherry blossom leaves and traditional lanterns.'
        },
        {
          id: 'japan_shrine_summit',
          name: 'Pagoda Shrine Balcony',
          icon: '🏯',
          x: 0,
          y: 12,
          z: 18,
          yaw: 0,
          pitch: -0.15,
          description: 'High pagoda tier overlooking the festive New Year crowds and fireworks.'
        }
      ];

    case 'times_square':
      return [
        {
          id: 'times_square_broadway',
          name: 'Broadway & 7th Ave Crossing',
          icon: '🏙️',
          x: 0,
          y: 2,
          z: 24,
          yaw: 0,
          pitch: 0.3,
          description: 'At street level looking up at the illuminated Broadway neon billboards and Midtown glass skyscrapers.'
        },
        {
          id: 'times_square_red_steps',
          name: 'TKTS Red Steps Grandstand',
          icon: '🪜',
          x: 0,
          y: 6,
          z: 14,
          yaw: 0,
          pitch: 0.1,
          description: 'Elevated terrace viewing Manhattan traffic and glowing digital billboards.'
        },
        {
          id: 'times_square_penthouse',
          name: 'Skyscraper Penthouse Overlook',
          icon: '✨',
          x: 10,
          y: 20,
          z: 12,
          yaw: -0.8,
          pitch: -0.35,
          description: 'High-rise skyscraper roof level overlooking the entire NYC voxel avenue.'
        }
      ];

    case 'paris_valentines':
    case 'eiffel_tower':
      return [
        {
          id: 'eiffel_champ_de_mars',
          name: 'Champ de Mars Grand Lawn',
          icon: '🗼',
          x: 0,
          y: 2,
          z: 24,
          yaw: 0,
          pitch: 0.35,
          description: 'Standing on the green lawn looking straight under the 330m Eiffel Tower lattice arch.'
        },
        {
          id: 'eiffel_love_locks',
          name: 'Pont des Arts Love Locks & Seine',
          icon: '💖',
          x: 10,
          y: 3,
          z: 10,
          yaw: -0.9,
          pitch: 0.05,
          description: 'Beside the romantic padlocks bridge and sculpted glowing hearts.'
        },
        {
          id: 'eiffel_platform_2',
          name: '2nd Level Observation Deck',
          icon: '🔭',
          x: 0,
          y: 18,
          z: 8,
          yaw: 0,
          pitch: -0.2,
          description: 'High above Paris overlooking the River Seine and city lights.'
        }
      ];

    case 'giza_pyramid':
      return [
        {
          id: 'giza_sphinx_avenue',
          name: 'Sphinx Causeway Entrance',
          icon: '🏜️',
          x: 0,
          y: 2,
          z: 28,
          yaw: 0,
          pitch: 0.25,
          description: 'Looking across the desert sands toward the monumental 4-sided sandstone pyramid.'
        },
        {
          id: 'giza_high_dune',
          name: 'Pharaoh Dunes Ridge',
          icon: '🐪',
          x: -16,
          y: 6,
          z: 16,
          yaw: 0.7,
          pitch: 0.1,
          description: 'High sand dune crest with panoramic desert sunset vistas.'
        },
        {
          id: 'giza_apex_view',
          name: 'Golden Capstone Apex Peak',
          icon: '⭐',
          x: 0,
          y: 18,
          z: 8,
          yaw: 0,
          pitch: -0.4,
          description: 'Aerial viewpoint from the upper pyramid tiers.'
        }
      ];

    case 'taj_mahal':
      return [
        {
          id: 'taj_reflecting_pool',
          name: 'Reflecting Pool Garden Walkway',
          icon: '🏛️',
          x: 0,
          y: 2,
          z: 26,
          yaw: 0,
          pitch: 0.15,
          description: 'Classic central axis view across the water channel reflection toward the white marble dome.'
        },
        {
          id: 'taj_minaret_balcony',
          name: 'East Minaret Tower Balcony',
          icon: '🕌',
          x: 12,
          y: 10,
          z: 12,
          yaw: -1.0,
          pitch: -0.1,
          description: 'Elevated vantage point overlooking symmetrical Mughal gardens.'
        }
      ];

    case 'colosseum':
      return [
        {
          id: 'colosseum_arena_center',
          name: 'Gladiator Arena Floor',
          icon: '⚔️',
          x: 0,
          y: 2,
          z: 8,
          yaw: 0,
          pitch: 0.2,
          description: 'Center arena position surrounded by concentric travertine arches.'
        },
        {
          id: 'colosseum_imperial_box',
          name: 'Imperial Royal Tribune',
          icon: '👑',
          x: 0,
          y: 8,
          z: 18,
          yaw: 0,
          pitch: -0.1,
          description: 'Elevated emperor seat overlooking the amphitheatre.'
        }
      ];

    default:
      return [
        {
          id: 'default_scenic_overlook',
          name: 'Scenic Plaza Overlook',
          icon: '📍',
          x: 0,
          y: 3,
          z: 22,
          yaw: 0,
          pitch: 0.15,
          description: `Prime scenic overview of ${landmark.name}.`
        },
        {
          id: 'default_high_ridge',
          name: 'High Ridge Panoramic Vista',
          icon: '🌄',
          x: 12,
          y: 14,
          z: 16,
          yaw: -0.7,
          pitch: -0.2,
          description: `Aerial bird's eye view above ${landmark.name}.`
        },
        {
          id: 'default_ground_approach',
          name: 'Ground Level Promenade',
          icon: '🚶',
          x: -10,
          y: 2,
          z: 14,
          yaw: 0.6,
          pitch: 0.1,
          description: `Ground approach entrance into ${landmark.name}.`
        }
      ];
  }
}

export function getDefaultSpawnPoint(landmark: Landmark): SpawnPoint {
  const points = getLandmarkSpawnPoints(landmark);
  return points[0];
}

export function getRandomSpawnPoint(landmark: Landmark): SpawnPoint {
  const points = getLandmarkSpawnPoints(landmark);
  return points[Math.floor(Math.random() * points.length)];
}

