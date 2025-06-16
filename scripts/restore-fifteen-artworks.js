const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// The 15 artworks to restore with their correct titles and artists from activity logs
const artworksToRestore = [
  { id: 'cea1de7e-f324-4acc-adb5-e526cd903ec4', title: 'Eric, Gwern Borter, 1924', artist: 'WARREN WILLIAMS' },
  { id: 'a89c8e4f-49ab-4d6f-a797-2ab118c449cf', title: 'Group of Standing Farmers', artist: 'ANEURIN JONES' },
  { id: 'ca46a677-2d07-4cbc-8986-cdce387001b4', title: 'Colourful Study of Figure on Mule', artist: 'Unknown Artist' },
  { id: 'c2d5bc4d-b36e-4e5a-bdf8-fc90ee73c8d6', title: 'Landscape Series No.37', artist: 'ROGER CECIL' },
  { id: '96e5d2cc-3057-4d47-a80c-483d2626738f', title: 'Hon', artist: 'Unknown Artist' },
  { id: '4868f502-d3df-4650-a256-c4c45115738b', title: 'Figure at Doorway with Garden', artist: 'JOHN ELWYN' },
  { id: 'fb03470c-023e-4cbc-b98f-97fe35950b22', title: 'Still Life with Olives', artist: 'Unknown Artist' },
  { id: '3f2f92cc-605a-4975-864c-f4da68e85cd4', title: 'Llanfachraeth', artist: 'GWILYM PRICHARD' },
  { id: '056d9ac1-7273-4e40-a5b2-87796debdae0', title: 'Misty Flooded Moorland', artist: 'GARETH THOMAS' },
  { id: '9e77a521-dd56-483b-8a5c-5b959d5cc842', title: 'Fishing Boats, Marina', artist: 'MIKE JONES' },
  { id: '429301e1-3786-4b51-928a-2c5490867716', title: 'Llyn-y-Fan Fach', artist: 'Unknown Artist' },
  { id: '804c16aa-32db-4fe5-a87b-b7b89281cf4f', title: 'Anglesey in Winter', artist: 'SIR KYFFIN WILLIAMS RA' },
  { id: 'dc044cb0-d2ca-4ca7-b74e-bf5cf169fbcd', title: 'Road to the Mine, Blaenau Ffestiniog', artist: 'SIR KYFFIN WILLIAMS RA' },
  { id: 'edbeec56-1a16-47ee-b3c7-a563d006a0bb', title: 'Concourse', artist: 'Unknown Artist' },
  { id: 'b8278b61-6cd7-408b-80b9-f0477220de04', title: 'Farmer with Walking Stick', artist: 'SIR KYFFIN WILLIAMS RA' }
];

// Read the corrected JSON data for image paths
const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/final_corrected_products.json'), 'utf8'));

async function restoreArtworks() {
  console.log('🔄 RESTORING the 15 artworks you wanted to keep...\n');
  
  let restoredCount = 0;
  let alreadyExistsCount = 0;
  
  for (const artwork of artworksToRestore) {
    try {
      // Check if artwork already exists
      const existing = await prisma.product.findUnique({
        where: { id: artwork.id }
      });
      
      if (existing) {
        console.log(`✅ Already exists: "${existing.name}"`);
        alreadyExistsCount++;
        continue;
      }
      
      // Find image path from JSON data by matching title
      const jsonItem = jsonData.find(item => 
        item.title && (
          item.title.includes(artwork.title) ||
          artwork.title.includes(item.title) ||
          // Try partial matches for complex titles
          (artwork.title.includes('Group') && item.title.includes('Group')) ||
          (artwork.title.includes('Colourful') && item.title.includes('Colourful')) ||
          (artwork.title.includes('Landscape') && item.title.includes('Landscape')) ||
          (artwork.title.includes('Hon') && item.title.includes('Hon')) ||
          (artwork.title.includes('Figure at Door') && item.title.includes('Figure at Door')) ||
          (artwork.title.includes('Still Life') && item.title.includes('Still Life')) ||
          (artwork.title.includes('Llanfachraeth') && item.title.includes('Llanfachraeth')) ||
          (artwork.title.includes('Misty') && item.title.includes('Misty')) ||
          (artwork.title.includes('Fishing Boats') && item.title.includes('Fishing Boats')) ||
          (artwork.title.includes('Llyn-y-Fan') && item.title.includes('Llyn-y-Fan')) ||
          (artwork.title.includes('Anglesey in Winter') && item.title.includes('Anglesey in Winter')) ||
          (artwork.title.includes('Road to the Mine') && item.title.includes('Road to the Mine')) ||
          (artwork.title.includes('Concourse') && item.title.includes('Concourse')) ||
          (artwork.title.includes('Farmer with Walking') && item.title.includes('Farmer with Walking'))
        )
      );
      
      const imagePath = jsonItem?.local_image ? `/${jsonItem.local_image}` : null;
      
      // Clean title (remove artist names)
      const cleanTitle = artwork.title
        .replace(/^(Glen|Mfikela|Jean|Frank|Robert|Eric|Gwern|Alfred|Philippa)\s+/gi, '')
        .replace(/^(Portrait of|Head of|Poet)\s+/gi, '')
        .replace(/^(Unknown Artist)\s*/gi, '')
        .replace(/\s+/g, ' ')
        .trim() || artwork.title;
      
      // Restore the artwork with all required fields
      await prisma.product.create({
        data: {
          id: artwork.id,
          name: cleanTitle,
          artist: artwork.artist,
          category: artwork.artist === 'Unknown Artist' ? 'unidentified' : 'identified',
          localImagePath: imagePath,
          price: '', // Empty price for now
          originalImageUrl: imagePath || '', // Required field
          originalProductUrl: '', // Required field
          status: 'available',
          featured: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log(`🔄 RESTORED: "${cleanTitle}" by ${artwork.artist}`);
      if (imagePath) {
        console.log(`   📸 Image: ${imagePath}`);
      } else {
        console.log(`   ⚠️  No image found for this artwork`);
      }
      restoredCount++;
      
      // Log the restoration activity
      await prisma.activity.create({
        data: {
          type: 'artwork_restore',
          title: `Artwork restored: ${cleanTitle}`,
          description: `Restored artwork from deletion - part of final 15 collection`,
          artworkId: artwork.id,
          artworkName: cleanTitle,
          artistName: artwork.artist
        }
      });
      
    } catch (error) {
      console.error(`❌ Error restoring "${artwork.title}":`, error.message);
    }
  }
  
  console.log(`\n📊 Restoration Complete:`);
  console.log(`   🔄 Successfully restored: ${restoredCount}`);
  console.log(`   ✅ Already existed: ${alreadyExistsCount}`);
  console.log(`   🎯 Total target artworks: ${artworksToRestore.length}`);
  
  // Verify final count
  const totalCount = await prisma.product.count();
  console.log(`   📊 Total artworks in database: ${totalCount}`);
  
  if (totalCount === artworksToRestore.length) {
    console.log(`\n🎉 PERFECT! You now have exactly the ${artworksToRestore.length} artworks you wanted to keep.`);
  } else {
    console.log(`\n⚠️  Note: Database has ${totalCount} artworks, expected ${artworksToRestore.length}`);
  }
  
  await prisma.$disconnect();
}

// Run the restoration
restoreArtworks().catch(console.error);