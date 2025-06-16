import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeDuplicates() {
  console.log('Analyzing database for duplicate artworks...\n');

  try {
    // Get total count
    const totalCount = await prisma.product.count();
    console.log(`Total artworks in database: ${totalCount}\n`);

    // Get all products
    const allProducts = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });

    // Group by name to find duplicates
    const productsByName: Record<string, typeof allProducts> = {};
    
    allProducts.forEach(product => {
      const name = product.name?.toLowerCase().trim() || '';
      if (!productsByName[name]) {
        productsByName[name] = [];
      }
      productsByName[name].push(product);
    });

    // Find actual duplicates
    const duplicateGroups = Object.entries(productsByName)
      .filter(([_, products]) => products.length > 1)
      .sort((a, b) => b[1].length - a[1].length);

    console.log(`Found ${duplicateGroups.length} groups of duplicates:\n`);

    // Show duplicate groups
    duplicateGroups.forEach(([_, products]) => {
      console.log(`\n"${products[0].name}" - ${products.length} copies:`);
      products.forEach(product => {
        console.log(`  - ID: ${product.id}`);
        console.log(`    Artist: ${product.artist || 'Unknown'}`);
        console.log(`    Medium: ${product.medium || 'Unknown'}`);
        console.log(`    Year: ${product.year || 'Unknown'}`);
        console.log(`    Price: ${product.price}`);
        console.log(`    Status: ${product.status || 'available'}`);
        console.log(`    Created: ${product.createdAt.toISOString()}`);
      });
    });

    // Also check for potential duplicates with similar names
    console.log('\n\nChecking for potential duplicates with similar names...\n');
    
    const names = Object.keys(productsByName);
    const similarPairs: Array<{
      name1: string;
      name2: string;
      similarity: number;
      products1: typeof allProducts;
      products2: typeof allProducts;
    }> = [];
    
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const similarity = calculateSimilarity(names[i], names[j]);
        if (similarity > 0.8 && similarity < 1) {
          similarPairs.push({
            name1: names[i],
            name2: names[j],
            similarity: similarity,
            products1: productsByName[names[i]],
            products2: productsByName[names[j]]
          });
        }
      }
    }

    if (similarPairs.length > 0) {
      console.log(`Found ${similarPairs.length} pairs of similar names:`);
      similarPairs
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 10)
        .forEach(pair => {
          console.log(`\n"${pair.products1[0].name}" vs "${pair.products2[0].name}" (${Math.round(pair.similarity * 100)}% similar)`);
          console.log(`  - First: ${pair.products1.length} copies, artist: ${pair.products1[0].artist}`);
          console.log(`  - Second: ${pair.products2.length} copies, artist: ${pair.products2[0].artist}`);
        });
    }

    // Check for duplicates by multiple criteria
    console.log('\n\nChecking for duplicates by name + artist combination...\n');
    
    const productsByNameAndArtist: Record<string, typeof allProducts> = {};
    
    allProducts.forEach(product => {
      const key = `${product.name?.toLowerCase().trim() || ''}_${product.artist?.toLowerCase().trim() || ''}`;
      if (!productsByNameAndArtist[key]) {
        productsByNameAndArtist[key] = [];
      }
      productsByNameAndArtist[key].push(product);
    });

    const duplicatesByNameAndArtist = Object.entries(productsByNameAndArtist)
      .filter(([_, products]) => products.length > 1)
      .sort((a, b) => b[1].length - a[1].length);

    console.log(`Found ${duplicatesByNameAndArtist.length} groups of duplicates by name+artist:\n`);
    
    duplicatesByNameAndArtist.slice(0, 10).forEach(([_, products]) => {
      console.log(`\n"${products[0].name}" by ${products[0].artist || 'Unknown'} - ${products.length} copies`);
    });

  } catch (error) {
    console.error('Error analyzing duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function getEditDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
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