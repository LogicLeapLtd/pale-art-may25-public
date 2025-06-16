const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// The 15 artworks that should be KEPT (were incorrectly deleted)
const artworksToKeep = [
  'cea1de7e-f324-4acc-adb5-e526cd903ec4', // Group of Standing Farmers
  'a89c8e4f-49ab-4d6f-a797-2ab118c449cf', // Colourful Study of Figure on Mule
  'ca46a677-2d07-4cbc-8986-cdce387001b4', // Landscape Series No.37
  'c2d5bc4d-b36e-4e5a-bdf8-fc90ee73c8d6', // Hon
  '96e5d2cc-3057-4d47-a80c-483d2626738f', // Figure at Doorway with Garden
  '4868f502-d3df-4650-a256-c4c45115738b', // Still Life with Olives
  'fb03470c-023e-4cbc-b98f-97fe35950b22', // Llanfachraeth
  '3f2f92cc-605a-4975-864c-f4da68e85cd4', // Misty Flooded Moorland
  '056d9ac1-7273-4e40-a5b2-87796debdae0', // Fishing Boats, Marina
  '9e77a521-dd56-483b-8a5c-5b959d5cc842', // Llyn-y-Fan Fach
  '429301e1-3786-4b51-928a-2c5490867716', // Anglesey in Winter
  '804c16aa-32db-4fe5-a87b-b7b89281cf4f', // Road to the Mine, Blaenau Ffestiniog
  'dc044cb0-d2ca-4ca7-b74e-bf5cf169fbcd', // Concourse
  'edbeec56-1a16-47ee-b3c7-a563d006a0bb', // Farmer with Walking Stick
  'b8278b61-6cd7-408b-80b9-f0477220de04'  // Farmer in Overcoat with Walking Stick
];

// Read the corrected products data for restoration
const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/final_corrected_products.json'), 'utf8'));

async function restoreDeletedArtworks() {
  console.log('🔄 RESTORING incorrectly deleted artworks...\n');
  
  let restoredCount = 0;
  let alreadyExistsCount = 0;
  
  for (const keepId of artworksToKeep) {
    try {
      // Check if artwork already exists
      const existing = await prisma.product.findUnique({
        where: { id: keepId }
      });
      
      if (existing) {
        console.log(`✅ Already exists: "${existing.name}"`);
        alreadyExistsCount++;
        continue;
      }
      
      // Find artwork data in the JSON backup
      const artworkData = jsonData.find(item => 
        item.id === keepId || 
        item.title?.includes('Group of Standing Farmers') ||
        item.title?.includes('Colourful Study of Figure on Mule') ||
        item.title?.includes('Landscape Series No.37') ||
        item.title?.includes('Hon') ||
        item.title?.includes('Figure at Doorway with Garden') ||
        item.title?.includes('Still Life with Olives') ||
        item.title?.includes('Llanfachraeth') ||
        item.title?.includes('Misty Flooded Moorland') ||
        item.title?.includes('Fishing Boats, Marina') ||
        item.title?.includes('Llyn-y-Fan Fach') ||
        item.title?.includes('Anglesey in Winter') ||
        item.title?.includes('Road to the Mine, Blaenau Ffestiniog') ||
        item.title?.includes('Concourse') ||
        item.title?.includes('Farmer with Walking Stick') ||
        item.title?.includes('Farmer in Overcoat')
      );
      
      if (!artworkData) {
        console.log(`❌ No backup data found for ID: ${keepId}`);
        continue;
      }
      
      // Clean title (remove artist names)
      const cleanTitle = artworkData.title
        ?.replace(/^(Glen|Mfikela|Jean|Frank|Robert|Eric|Gwern|Alfred|Philippa)\\s+/gi, '')
        ?.replace(/^(Portrait of|Head of|Poet)\\s+/gi, '')
        ?.replace(/^(Unknown Artist)\\s*/gi, '')
        ?.replace(/\\s+/g, ' ')
        ?.trim() || artworkData.title;
      
      // Restore the artwork
      await prisma.product.create({
        data: {
          id: keepId,
          name: cleanTitle,
          artist: artworkData.artist || 'Unknown Artist',
          category: artworkData.category === 'identified' ? 'identified' : 'unidentified',
          localImagePath: artworkData.local_image ? `/${artworkData.local_image}` : null,
          status: 'available',
          featured: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log(`🔄 RESTORED: "${cleanTitle}" by ${artworkData.artist || 'Unknown Artist'}`);
      restoredCount++;
      
      // Log the restoration activity
      await prisma.activity.create({
        data: {
          type: 'artwork_restore',
          title: `Artwork restored: ${cleanTitle}`,
          description: `Restored incorrectly deleted artwork`,
          artworkId: keepId,
          artworkName: cleanTitle,
          artistName: artworkData.artist
        }
      });
      
    } catch (error) {
      console.error(`❌ Error restoring ID ${keepId}:`, error.message);
    }
  }
  
  console.log(`\\n📊 Restoration Summary:`);
  console.log(`   🔄 Successfully restored: ${restoredCount}`);
  console.log(`   ✅ Already existed: ${alreadyExistsCount}`);
  console.log(`   🎯 Total to keep: ${artworksToKeep.length}`);
}

async function deleteUnwantedArtworks() {
  console.log('\\n🗑️  DELETING all artworks EXCEPT the 15 specified ones...');
  
  // Get all artworks
  const allArtworks = await prisma.product.findMany({
    select: { id: true, name: true, artist: true }
  });
  
  // Find artworks to delete (everything NOT in the keep list)
  const artworksToDelete = allArtworks.filter(artwork => 
    !artworksToKeep.includes(artwork.id)
  );
  
  console.log(`Found ${artworksToDelete.length} artworks to delete (keeping ${artworksToKeep.length})`);
  
  let deletedCount = 0;
  
  for (const artwork of artworksToDelete) {
    try {
      await prisma.product.delete({
        where: { id: artwork.id }
      });
      
      console.log(`🗑️  Deleted: "${artwork.name}" (${artwork.artist || 'Unknown Artist'})`);
      deletedCount++;
      
      // Log the deletion activity
      await prisma.activity.create({
        data: {
          type: 'artwork_delete',
          title: `Artwork deleted: ${artwork.name}`,
          description: `Deleted as part of collection cleanup - not in final 15`,
          artworkId: artwork.id,
          artworkName: artwork.name,
          artistName: artwork.artist
        }
      });
      
    } catch (error) {
      console.error(`❌ Error deleting "${artwork.name}":`, error.message);
    }
  }
  
  console.log(`\\n📊 Final Cleanup Summary:`);
  console.log(`   🗑️  Deleted unwanted artworks: ${deletedCount}`);
  console.log(`   ✅ Kept desired artworks: ${artworksToKeep.length}`);
  
  // Verify final state
  const finalCount = await prisma.product.count();
  console.log(`   📊 Total artworks remaining: ${finalCount}`);
  
  if (finalCount === artworksToKeep.length) {
    console.log(`\\n🎉 SUCCESS! Collection now contains exactly the ${artworksToKeep.length} artworks you wanted to keep.`);
  } else {
    console.log(`\\n⚠️  WARNING: Expected ${artworksToKeep.length} artworks but found ${finalCount}`);
  }
}

async function main() {
  console.log('🚨 FIXING CRITICAL ERROR: Restoring deleted artworks and cleaning up collection\\n');
  
  try {
    // Step 1: Restore the 15 artworks that were incorrectly deleted
    await restoreDeletedArtworks();
    
    // Step 2: Delete everything EXCEPT those 15 artworks
    await deleteUnwantedArtworks();
    
    console.log('\\n✅ COLLECTION FIXED! You now have exactly the 15 artworks you wanted to keep.');
    
  } catch (error) {
    console.error('❌ Critical error during restoration/cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
main().catch(console.error);