require('dotenv').config();
const mongoose = require('mongoose'); const { Movie } = require('./models');
const at = (d, h) => { const t = new Date(); t.setDate(t.getDate() + d); t.setHours(h, 0, 0, 0); return t; };
const shows = p => [0, 1].flatMap(d => [14, 18, 21].map(h => ({ time: at(d, h), screen: 'Screen ' + (1 + (h % 3)), price: p })));

const movies = [
  [
    'Midnight Express',
    'Thriller',
    118,
    'A night train, a stolen ledger and twelve suspects.',
    'https://picsum.photos/seed/midnight/400/600',
    250
  ],
  [
    'Monsoon Letters',
    'Romance',
    126,
    'Two strangers write to each other through one long rainy season.',
    'https://picsum.photos/seed/monsoon/400/600',
    220
  ],
  [
    'Orbit Seven',
    'Sci-Fi',
    141,
    'A repair crew discovers the station is not empty.',
    'https://picsum.photos/seed/orbit/400/600',
    300
  ],
  [
    'The Last Baraat',
    'Comedy',
    109,
    'The groom is missing and the band is already paid.',
    'https://picsum.photos/seed/baraat/400/600',
    200
  ]
];

const beginnings = [
  'Crimson', 'Hidden', 'Golden', 'Silent',
  'Broken', 'Distant', 'Forgotten', 'Electric',
  'Velvet', 'Frozen', 'Shadow', 'Wild',
  'Infinite', 'Silver', 'Neon', 'Secret'
];

const endings = [
  'Horizon', 'Promise', 'Kingdom', 'Reckoning',
  'Mirage', 'Odyssey', 'Legacy', 'Paradox',
  'Whisper', 'Frontier', 'Chronicles', 'Escape',
  'Revolution', 'Destiny', 'Afterglow', 'Labyrinth',
  'Eclipse', 'Voyage', 'Revelation'
];

const genres = [
  'Action', 'Adventure', 'Comedy', 'Drama',
  'Romance', 'Thriller', 'Horror', 'Sci-Fi',
  'Fantasy', 'Animation', 'Mystery', 'Crime',
  'Documentary'
];

const storyIdeas = [
  'An unexpected discovery changes the lives of everyone involved.',
  'A determined stranger uncovers a secret buried for decades.',
  'An unlikely group must work together when everything goes wrong.',
  'A forgotten mystery returns and challenges everything people believe.',
  'A difficult journey forces a family to confront its past.',
  'A brilliant investigator follows clues that lead somewhere unexpected.',
  'A small decision sets off a chain of extraordinary events.',
  'A new opportunity tests the courage and loyalty of old friends.',
  'A remote community faces a challenge that could change its future.',
  'Two very different people discover a connection neither expected.',
  'A daring plan becomes more complicated with every passing hour.',
  'An unusual invention reveals a world nobody knew existed.',
  'A search for answers uncovers a surprising truth about the past.'
];

// Generate 296 additional movies.
let added = 0;

for (const beginning of beginnings) {
  for (const ending of endings) {
    if (added >= 296) break;

    const title = `${beginning} ${ending}`;
    const genre = genres[added % genres.length];
    const duration = 90 + ((added * 7) % 81);
    const description = storyIdeas[added % storyIdeas.length];
    const price = 150 + ((added * 17) % 351);
    const posterSeed = `imovies-poster-${added + 1}`;

    movies.push([
      title,
      genre,
      duration,
      description,
      `https://picsum.photos/seed/${posterSeed}/400/600`,
      price
    ]);

    added++;
  }

  if (added >= 296) break;
}

// Confirm the file contains exactly 300 movies.
if (movies.length !== 300) {
  throw new Error(`Expected 300 movies, got ${movies.length}`);
}


mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const existingTitles = new Set(
      (await Movie.find({}, { title: 1, _id: 0 }))
        .map(movie => movie.title)
    );

    const newMovies = movies
      .filter(([title]) => !existingTitles.has(title))
      .map(([title, genre, duration, description, poster, price]) => ({
        title,
        genre,
        duration,
        description,
        poster,
        showtimes: shows(price)
      }));

    if (newMovies.length > 0) {
      await Movie.insertMany(newMovies);
    }

    console.log(
      `Seeded ${newMovies.length} new movies. Existing movies were preserved.`
    );

    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async error => {
    console.error('Seeding failed:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
