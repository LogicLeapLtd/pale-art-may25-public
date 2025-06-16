const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// List of artwork IDs to delete
const artworkIdsToDelete = [
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

async function deleteArtworks() {
  console.log(`🗑️  Starting deletion of ${artworkIdsToDelete.length} artworks...\n`);
  
  let deletedCount = 0;
  let notFoundCount = 0;
  
  for (const id of artworkIdsToDelete) {
    try {
      // First check if the artwork exists and get its details
      const artwork = await prisma.product.findUnique({
        where: { id }
      });
      
      if (!artwork) {
        console.log(`❌ ID: ${id} - Not found in database`);
        notFoundCount++;
        continue;
      }
      
      // Delete the artwork
      await prisma.product.delete({
        where: { id }
      });
      
      console.log(`✅ Deleted: "${artwork.name}" (${artwork.artist || 'Unknown Artist'})`);
      deletedCount++;
      
      // Log the deletion activity
      await prisma.activity.create({
        data: {
          type: 'artwork_delete',
          title: `Artwork deleted: ${artwork.name}`,
          description: `Deleted artwork from collection via bulk cleanup`,
          artworkId: artwork.id,
          artworkName: artwork.name,
          artistName: artwork.artist
        }
      });
      
    } catch (error) {
      console.error(`❌ Error deleting ID ${id}:`, error.message);
    }
  }
  
  console.log(`\n📊 Deletion Summary:`);
  console.log(`   ✅ Successfully deleted: ${deletedCount}`);
  console.log(`   ❌ Not found: ${notFoundCount}`);
  console.log(`   🎯 Total requested: ${artworkIdsToDelete.length}`);
  
  await prisma.$disconnect();
}

// Run the deletion
deleteArtworks().catch(console.error);