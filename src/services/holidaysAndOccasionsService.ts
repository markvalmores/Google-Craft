// Calendar Holidays, Global Festive Celebrations & Occasions Engine
import { Landmark, FAMOUS_LANDMARKS } from './googleMapsService';

export interface FestiveOccasion {
  id: string;
  name: string;
  occasionTitle: string;
  holidayIcon: string;
  landmarkId: string;
  dateRange: string;
  themeDescription: string;
  activeMonths: number[]; // 0-indexed months
  activeDays?: [number, number]; // [startDay, endDay]
  specialFeatures: string[];
}

export const FESTIVE_OCCASIONS: FestiveOccasion[] = [
  {
    id: 'holy_week_easter',
    name: 'Holy Week & Easter Resurrection',
    occasionTitle: 'Mount Calvary (Golgotha) & Resurrection Dawn',
    holidayIcon: '✝️',
    landmarkId: 'mount_calvary_holy_week',
    dateRange: 'March – April (Holy Week)',
    themeDescription: 'The sacred hill of Golgotha overlooking ancient Jerusalem, with the 3 Crosses: Lord Jesus Christ in the center and the two thieves on the left and right, with olive groves and the stone rolled away.',
    activeMonths: [2, 3], // Mar-Apr
    specialFeatures: [
      'The 3 Mount Calvary Crosses (Christ & 2 Thieves)',
      'Ancient Jerusalem Stone Fortress Walls',
      'Golden Divine Sunbeams & Easter Sunrise',
      'Ancient Olive Grove & Garden Tomb'
    ]
  },
  {
    id: 'christmas_north_pole',
    name: 'Christmas Holiday Season',
    occasionTitle: 'North Pole Santa\'s Winter Workshop',
    holidayIcon: '🎅',
    landmarkId: 'north_pole_xmas',
    dateRange: 'December 15 – December 31',
    themeDescription: 'Winter wonderland at the North Pole with towering illuminated Christmas tree with gold star, candy cane columns, present gift blocks, Santa\'s log lodge, and Aurora Borealis.',
    activeMonths: [11], // Dec
    activeDays: [15, 31],
    specialFeatures: [
      'Towering 25m Decorated Christmas Tree with Golden Star',
      'Candy Cane Arches & Wrapped Gift Present Voxels',
      'Santa\'s Cozy Wooden Workshop & Chimney Smoke',
      'Luminescent Green & Violet Aurora Borealis Sky'
    ]
  },
  {
    id: 'new_year_japan',
    name: 'New Year Celebration',
    occasionTitle: 'Tokyo Shibuya & Mount Fuji Shinto Shrine',
    holidayIcon: '🎆',
    landmarkId: 'japan_new_year',
    dateRange: 'December 31 – January 5',
    themeDescription: 'Celebrate the New Year in Japan with monumental red Torii gates, shrine lanterns, cherry blossom trees, and continuous vibrant multi-color sky fireworks!',
    activeMonths: [0, 11], // Jan or late Dec
    activeDays: [31, 5],
    specialFeatures: [
      'Continuous Colorful Fireworks Rockets & Confetti',
      'Traditional Vermilion Red Torii Gate Archways',
      'Blooming Pink Cherry Blossom (Sakura) Voxel Trees',
      'Gilded Pagoda Shrine with Glowing Stone Lanterns'
    ]
  },
  {
    id: 'valentines_paris',
    name: 'Valentine\'s Day Celebration',
    occasionTitle: 'Paris Pont des Arts & Eiffel Tower of Love',
    holidayIcon: '💖',
    landmarkId: 'paris_valentines',
    dateRange: 'February 10 – February 18',
    themeDescription: 'Romantic Paris illuminated in rose-pink hues, the Eiffel Tower with romantic love beacons, Pont des Arts padlock bridge, and floating rose petals.',
    activeMonths: [1], // Feb
    activeDays: [10, 18],
    specialFeatures: [
      'Eiffel Tower with Radiant Rose-Pink Lights',
      'Pont des Arts Bridge of Eternal Love Locks',
      'Sculpted Glowing Redstone Heart Monuments',
      'Floating Crimson Rose Petals Breeze'
    ]
  },
  {
    id: 'halloween_cemetery',
    name: 'Halloween Spooktacular',
    occasionTitle: 'Gothic Cemetery & Haunted Catacomb Crypt',
    holidayIcon: '🎃',
    landmarkId: 'halloween_cemetery',
    dateRange: 'October 20 – November 3',
    themeDescription: 'Eerie misty cemetery with weathered stone tombstones, glowing Jack-o\'-Lantern pumpkins, wrought iron gates, and an ancient haunted mausoleum crypt.',
    activeMonths: [9, 10], // Oct-Nov
    activeDays: [20, 3],
    specialFeatures: [
      'Ancient Weathered Gravestones & Mausoleum Crypt',
      'Carved Glowing Jack-o\'-Lantern Pumpkins',
      'Spooky Wrought-Iron Cemetery Gates & Torches',
      'Eerie Purple Mist & Spectral Moonlight'
    ]
  },
  {
    id: 'independence_day_usa',
    name: '4th of July / National Festivals',
    occasionTitle: 'Statue of Liberty Harbor Fireworks',
    holidayIcon: '🗽',
    landmarkId: 'statue_of_liberty',
    dateRange: 'July 1 – July 7',
    themeDescription: 'Liberty Island harbor with the colossal Lady Liberty torch and grand patriotic fireworks display.',
    activeMonths: [6], // July
    activeDays: [1, 7],
    specialFeatures: [
      'Statue of Liberty with Flaming Golden Beacon Torch',
      'Red, White & Blue Sky Fireworks',
      'Harbor Waterfront & Fort Wood Star Bastion'
    ]
  },
  {
    id: 'times_square_default',
    name: 'Metropolitan Everyday (Default)',
    occasionTitle: 'Times Square, New York City',
    holidayIcon: '🏙️',
    landmarkId: 'times_square',
    dateRange: 'Year-Round Default Spawn',
    themeDescription: 'The Crossroads of the World in Manhattan NYC, bustling with neon billboards, glowing skyscrapers, yellow cab avenues, and city lights.',
    activeMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    specialFeatures: [
      'Illuminated Neon Advertising Billboards',
      'Manhattan Glass & Steel Voxel Skyscrapers',
      'Broadway Asphalt Avenues & Yellow Taxi Blocks',
      'Midnight City Lights & Subway Entrances'
    ]
  }
];

export class HolidaysAndOccasionsService {
  // Detect current active holiday based on date in user's timezone
  public detectActiveOccasion(): FestiveOccasion {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();

    // Check specific date windows
    if (month === 11 && day >= 15) {
      return FESTIVE_OCCASIONS.find(o => o.id === 'christmas_north_pole')!;
    }
    if ((month === 11 && day >= 30) || (month === 0 && day <= 5)) {
      return FESTIVE_OCCASIONS.find(o => o.id === 'new_year_japan')!;
    }
    if (month === 1 && day >= 10 && day <= 18) {
      return FESTIVE_OCCASIONS.find(o => o.id === 'valentines_paris')!;
    }
    if ((month === 9 && day >= 20) || (month === 10 && day <= 3)) {
      return FESTIVE_OCCASIONS.find(o => o.id === 'halloween_cemetery')!;
    }
    if (month === 2 || month === 3) {
      // March/April Holy Week
      return FESTIVE_OCCASIONS.find(o => o.id === 'holy_week_easter')!;
    }
    if (month === 6 && day >= 1 && day <= 7) {
      return FESTIVE_OCCASIONS.find(o => o.id === 'independence_day_usa')!;
    }

    // Default to Times Square New York City
    return FESTIVE_OCCASIONS.find(o => o.id === 'times_square_default')!;
  }

  // Get matching Landmark object from landmark ID
  public getLandmarkForOccasion(occasion: FestiveOccasion, allLandmarks: Landmark[]): Landmark {
    const found = allLandmarks.find(l => l.id === occasion.landmarkId);
    return found || allLandmarks[0];
  }
}

export const holidaysService = new HolidaysAndOccasionsService();
