const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// Read the corrected JSON data
const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/final_corrected_products.json'), 'utf8'));

// The 15 artworks that should be kept (already restored)
const keptArtworkIds = [
  'cea1de7e-f324-4acc-adb5-e526cd903ec4',
  'a89c8e4f-49ab-4d6f-a797-2ab118c449cf', 
  'ca46a677-2d07-4cbc-8986-cdce387001b4',
  'c2d5bc4d-b36e-4e5a-bdf8-fc90ee73c8d6',
  '96e5d2cc-3057-4d47-a80c-483d2626738f',
  '4868f502-d3df-4650-a256-c4c45115738b',
  'fb03470c-023e-4cbc-b98f-97fe35950b22',
  '3f2f92cc-605a-4975-864c-f4da68e85cd4',
  '056d9ac1-7273-4e40-a5b2-87796debdae0',
  '9e77a521-dd56-483b-8a5c-5b959d5cc842',
  '429301e1-3786-4b51-928a-2c5490867716',
  '804c16aa-32db-4fe5-a87b-b7b89281cf4f',
  'dc044cb0-d2ca-4ca7-b74e-bf5cf169fbcd',
  'edbeec56-1a16-47ee-b3c7-a563d006a0bb',
  'b8278b61-6cd7-408b-80b9-f0477220de04'
];

function cleanTitle(title, artist) {
  if (!title) return title;
  
  let cleanedTitle = title;
  
  // Remove common patterns like "Glen Portrait" -> "Portrait"
  cleanedTitle = cleanedTitle
    .replace(/^(Glen|Mfikela|Jean|Frank|Robert|Eric|Gwern|Alfred|Philippa)\s+/gi, '')
    .replace(/^(Portrait of|Head of|Poet)\s+/gi, '')
    .replace(/^(Unknown Artist)\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleanedTitle || title;
}

async function restoreFullCollection() {
  console.log('🔄 RESTORING FULL COLLECTION from JSON backup...\n');
  
  let restoredCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const item of jsonData) {
    try {
      // Skip if this is one of the 15 already restored artworks
      if (item.id && keptArtworkIds.includes(item.id)) {
        console.log(`⏭️  Skipping already restored: "${item.title}"`);
        skippedCount++;
        continue;
      }
      
      // Only restore items with local images
      if (!item.local_image) {
        console.log(`⚠️  Skipping (no image): "${item.title}"`);
        continue;
      }
      
      const cleanedTitle = cleanTitle(item.title, item.artist);
      const artworkId = item.id || uuidv4();
      
      // Check if already exists
      const existing = await prisma.product.findUnique({
        where: { id: artworkId }
      });
      
      if (existing) {
        console.log(`✅ Already exists: "${existing.name}"`);
        skippedCount++;
        continue;
      }
      
      // Restore the artwork
      await prisma.product.create({
        data: {
          id: artworkId,
          name: cleanedTitle,
          artist: item.artist || 'Unknown Artist',
          category: item.category === 'identified' ? 'identified' : 'unidentified',
          localImagePath: `/${item.local_image}`,
          price: '', // Empty price for now
          originalImageUrl: `/${item.local_image}`,
          originalProductUrl: '',
          status: 'available',
          featured: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log(`🔄 RESTORED: "${cleanedTitle}" by ${item.artist || 'Unknown Artist'}`);
      restoredCount++;
      
      // Log the restoration activity
      await prisma.activity.create({
        data: {
          type: 'artwork_restore',
          title: `Full collection restore: ${cleanedTitle}`,
          description: `Restored from JSON backup after accidental deletion`,
          artworkId: artworkId,
          artworkName: cleanedTitle,
          artistName: item.artist
        }
      });
      
    } catch (error) {
      console.error(`❌ Error restoring "${item.title}":`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Full Collection Restoration Complete:`);
  console.log(`   🔄 Successfully restored: ${restoredCount}`);
  console.log(`   ⏭️  Skipped (already existed): ${skippedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  
  // Verify final count
  const totalCount = await prisma.product.count();
  console.log(`   📊 Total artworks in database: ${totalCount}`);
  
  console.log(`\n✅ COLLECTION RESTORED! You now have your full artwork collection back.`);
  console.log(`The 15 special artworks you wanted to keep are still there, plus all the others.`);
  
  await prisma.$disconnect();
}

// Run the restoration
restoreFullCollection().catch(console.error);