const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeDuplicates() {
  console.log('Analyzing database for duplicate artworks...\n');

  // First, let's see how many total artworks we have
  const { count: totalCount } = await supabase
    .from('artworks')
    .select('*', { count: 'exact', head: true });
  
  console.log(`Total artworks in database: ${totalCount}\n`);

  // Get all artworks to analyze locally
  const { data: allArtworks, error } = await supabase
    .from('artworks')
    .select('id, name, artist_name, medium, dimensions, year, location')
    .order('name');

  if (error) {
    console.error('Error fetching artworks:', error);
    return;
  }

  // Group by name to find duplicates
  const artworksByName = {};
  allArtworks.forEach(artwork => {
    const name = artwork.name?.toLowerCase().trim() || '';
    if (!artworksByName[name]) {
      artworksByName[name] = [];
    }
    artworksByName[name].push(artwork);
  });

  // Find actual duplicates
  const duplicateGroups = Object.entries(artworksByName)
    .filter(([name, artworks]) => artworks.length > 1)
    .sort((a, b) => b[1].length - a[1].length);

  console.log(`Found ${duplicateGroups.length} groups of duplicates:\n`);

  // Show duplicate groups
  duplicateGroups.forEach(([name, artworks]) => {
    console.log(`\n"${artworks[0].name}" - ${artworks.length} copies:`);
    artworks.forEach(artwork => {
      console.log(`  - ID: ${artwork.id}`);
      console.log(`    Artist: ${artwork.artist_name || 'Unknown'}`);
      console.log(`    Medium: ${artwork.medium || 'Unknown'}`);
      console.log(`    Year: ${artwork.year || 'Unknown'}`);
      console.log(`    Location: ${artwork.location || 'Unknown'}`);
    });
  });

  // Also check for potential duplicates with similar names
  console.log('\n\nChecking for potential duplicates with similar names...\n');
  
  const names = Object.keys(artworksByName);
  const similarPairs = [];
  
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const similarity = calculateSimilarity(names[i], names[j]);
      if (similarity > 0.8 && similarity < 1) {
        similarPairs.push({
          name1: names[i],
          name2: names[j],
          similarity: similarity,
          artworks1: artworksByName[names[i]],
          artworks2: artworksByName[names[j]]
        });
      }
    }
  }

  if (similarPairs.length > 0) {
    console.log(`Found ${similarPairs.length} pairs of similar names:`);
    similarPairs.sort((a, b) => b.similarity - a.similarity).slice(0, 10).forEach(pair => {
      console.log(`\n"${pair.artworks1[0].name}" vs "${pair.artworks2[0].name}" (${Math.round(pair.similarity * 100)}% similar)`);
    });
  }
}

function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function getEditDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

analyzeDuplicates().catch(console.error);