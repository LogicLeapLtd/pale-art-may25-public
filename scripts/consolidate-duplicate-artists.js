const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Artist consolidation mapping
const artistConsolidations = [
  {
    // Glen Farrelly consolidation
    targetName: 'Glen Farrelly ARCA',
    duplicates: ['Glen Farrelly'],
    description: 'Consolidating Glen Farrelly variants to most descriptive name'
  },
  {
    // Frank Brangwyn consolidation
    targetName: 'Sir Frank Brangwyn RA',
    duplicates: ['SIR FRANK BRANGWYN RA HRSA RSW RWS PRBA RE HRMS ROI'],
    description: 'Consolidating Frank Brangwyn to shorter, standard name'
  },
  {
    // Page artists consolidation
    targetName: 'Steven Page',
    duplicates: ['Steve Page', 'Stephen Page'],
    description: 'Consolidating Page artist variants to Steven Page'
  }
];

async function consolidateArtists() {
  console.log('🎨 CONSOLIDATING DUPLICATE ARTISTS...\n');
  
  let totalArtworksUpdated = 0;
  let totalArtistsRemoved = 0;
  
  for (const consolidation of artistConsolidations) {
    console.log(`📋 ${consolidation.description}`);
    console.log(`   Target: ${consolidation.targetName}`);
    console.log(`   Duplicates: ${consolidation.duplicates.join(', ')}`);
    
    // Check if target artist exists in Artist table
    const targetArtist = await prisma.artist.findFirst({
      where: { name: consolidation.targetName }
    });
    
    if (!targetArtist) {
      console.log(`   ⚠️  Target artist "${consolidation.targetName}" not found in Artist table`);
    }
    
    for (const duplicateName of consolidation.duplicates) {
      try {
        // Find artworks with this duplicate artist name
        const artworksToUpdate = await prisma.product.findMany({
          where: { artist: duplicateName },
          select: { id: true, name: true, artist: true }
        });
        
        if (artworksToUpdate.length > 0) {
          console.log(`   🔄 Updating ${artworksToUpdate.length} artworks from "${duplicateName}" to "${consolidation.targetName}"`);
          
          // Update all artworks
          await prisma.product.updateMany({
            where: { artist: duplicateName },
            data: { 
              artist: consolidation.targetName,
              updatedAt: new Date()
            }
          });
          
          totalArtworksUpdated += artworksToUpdate.length;
          
          // Log each artwork update
          for (const artwork of artworksToUpdate) {
            await prisma.activity.create({
              data: {
                type: 'artist_consolidation',
                title: `Artist name updated: ${artwork.name}`,
                description: `Changed artist from "${duplicateName}" to "${consolidation.targetName}"`,
                artworkId: artwork.id,
                artworkName: artwork.name,
                artistName: consolidation.targetName,
                metadata: {
                  oldArtist: duplicateName,
                  newArtist: consolidation.targetName
                }
              }
            });
          }
        } else {
          console.log(`   ℹ️  No artworks found with artist "${duplicateName}"`);
        }
        
        // Remove duplicate artist from Artist table
        const duplicateArtist = await prisma.artist.findFirst({
          where: { name: duplicateName }
        });
        
        if (duplicateArtist) {
          await prisma.artist.delete({
            where: { id: duplicateArtist.id }
          });
          console.log(`   🗑️  Removed duplicate artist "${duplicateName}" from Artist table`);
          totalArtistsRemoved++;
          
          // Log artist removal
          await prisma.activity.create({
            data: {
              type: 'artist_removal',
              title: `Duplicate artist removed: ${duplicateName}`,
              description: `Removed duplicate artist, consolidated into "${consolidation.targetName}"`,
              metadata: {
                removedArtist: duplicateName,
                consolidatedInto: consolidation.targetName
              }
            }
          });
        }
        
      } catch (error) {
        console.error(`   ❌ Error processing "${duplicateName}":`, error.message);
      }
    }
    
    console.log('   ✅ Consolidation complete\n');
  }
  
  console.log('📊 CONSOLIDATION SUMMARY:');
  console.log(`   🔄 Total artworks updated: ${totalArtworksUpdated}`);
  console.log(`   🗑️  Total duplicate artists removed: ${totalArtistsRemoved}`);
  
  // Verify results
  console.log('\n🔍 VERIFICATION:');
  
  // Check for remaining duplicates
  const remainingArtists = await prisma.product.groupBy({
    by: ['artist'],
    _count: { artist: true },
    having: {
      artist: {
        _count: {
          gt: 0
        }
      }
    },
    orderBy: {
      _count: {
        artist: 'desc'
      }
    }
  });
  
  console.log('Current artist distribution after consolidation:');
  remainingArtists.slice(0, 15).forEach(artist => {
    if (artist.artist) {
      console.log(`   ${artist.artist}: ${artist._count.artist} artworks`);
    }
  });
  
  // Check specifically for our consolidated artists
  console.log('\nConsolidated artists:');
  for (const consolidation of artistConsolidations) {
    const count = await prisma.product.count({
      where: { artist: consolidation.targetName }
    });
    console.log(`   ${consolidation.targetName}: ${count} artworks`);
  }
  
  console.log('\n✅ ARTIST CONSOLIDATION COMPLETE!');
  
  await prisma.$disconnect();
}

// Run consolidation
consolidateArtists().catch(console.error);