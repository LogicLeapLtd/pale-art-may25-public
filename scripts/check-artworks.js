const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkArtworks() {
  // Check specific artworks that need unblurred images
  const artworksToCheck = [
    'Still Life with Olives',
    'Group of Standing Farmers',
    'Porth Uchaf',
    'Buchod Dafydd',
    'The Rising Moon',
    'Bathers',
    'Eric, Gwern Borter, 1924'
  ];
  
  console.log('ARTWORKS NEEDING UNBLURRED IMAGES:');
  console.log('==================================\n');
  
  for (const name of artworksToCheck) {
    const found = await prisma.product.findMany({
      where: { name: { contains: name } }
    });
    
    if (found.length === 0) {
      console.log(`❌ "${name}" - NOT FOUND IN DATABASE\n`);
    } else {
      found.forEach(a => {
        const hasUnblurred = a.localImagePath?.includes('Unblurred');
        console.log(`${hasUnblurred ? '✅' : '⚠️'} "${a.name}"`);
        console.log(`   ID: ${a.id}`);
        console.log(`   Current Path: ${a.localImagePath || 'NO PATH'}`);
        console.log(`   Artist: ${a.artist || 'Unknown'}\n`);
      });
    }
  }
  
  // Check for duplicates
  const allProducts = await prisma.product.findMany({
    orderBy: { name: 'asc' }
  });
  
  const duplicates = {};
  allProducts.forEach(p => {
    if (!duplicates[p.name]) {
      duplicates[p.name] = [];
    }
    duplicates[p.name].push(p);
  });
  
  console.log('\nDUPLICATES FOUND:');
  console.log('=================');
  
  let dupCount = 0;
  Object.entries(duplicates).forEach(([name, items]) => {
    if (items.length > 1) {
      dupCount++;
      console.log(`\n${dupCount}. "${name}" (${items.length} copies):`);
      items.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ID: ${item.id}`);
        console.log(`      Artist: ${item.artist || 'Unknown'}`);
        console.log(`      Path: ${item.localImagePath || 'NO PATH'}`);
      });
    }
  });
  
  if (dupCount === 0) {
    console.log('No duplicates found.');
  }
  
  // Summary
  const needingImages = artworksToCheck.filter(name => {
    const found = allProducts.find(p => p.name.includes(name));
    return found && !found.localImagePath?.includes('Unblurred');
  });
  
  console.log('\n\nSUMMARY:');
  console.log('========');
  console.log(`Total artworks: ${allProducts.length}`);
  console.log(`Artworks needing unblurred images: ${needingImages.length}`);
  console.log(`Duplicate entries found: ${dupCount}`);
  
  await prisma.$disconnect();
}

checkArtworks().catch(console.error);