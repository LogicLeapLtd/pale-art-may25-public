import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

interface CategorySummary {
  category: string;
  count: number;
  artists: { [key: string]: number };
  examples: Array<{
    title: string;
    artist: string;
    medium: string;
    year?: number;
  }>;
}

// Map medium descriptions to categories
function categorizeByMedium(medium: string): string {
  const mediumLower = medium.toLowerCase();
  
  // Painting categories
  if (mediumLower.includes('oil') || mediumLower.includes('acrylic') || 
      mediumLower.includes('watercolour') || mediumLower.includes('watercolor') ||
      mediumLower.includes('gouache') || mediumLower.includes('tempera') ||
      mediumLower.includes('paint') || mediumLower.includes('canvas')) {
    return 'Painting';
  }
  
  // Ceramic categories
  if (mediumLower.includes('ceramic') || mediumLower.includes('pottery') || 
      mediumLower.includes('clay') || mediumLower.includes('porcelain') ||
      mediumLower.includes('stoneware') || mediumLower.includes('earthenware') ||
      mediumLower.includes('terracotta') || mediumLower.includes('raku')) {
    return 'Ceramic';
  }
  
  // Sculpture categories
  if (mediumLower.includes('sculpture') || mediumLower.includes('bronze') || 
      mediumLower.includes('marble') || mediumLower.includes('stone') ||
      mediumLower.includes('wood carving') || mediumLower.includes('carved') ||
      mediumLower.includes('cast') || mediumLower.includes('metal sculpture')) {
    return 'Sculpture';
  }
  
  // Print categories
  if (mediumLower.includes('print') || mediumLower.includes('lithograph') || 
      mediumLower.includes('etching') || mediumLower.includes('screen print') ||
      mediumLower.includes('giclée') || mediumLower.includes('giclee') ||
      mediumLower.includes('serigraph') || mediumLower.includes('woodcut') ||
      mediumLower.includes('linocut') || mediumLower.includes('monotype')) {
    return 'Print';
  }
  
  // Photography
  if (mediumLower.includes('photo') || mediumLower.includes('photograph') ||
      mediumLower.includes('c-type') || mediumLower.includes('digital print') ||
      mediumLower.includes('silver gelatin')) {
    return 'Photography';
  }
  
  // Drawing categories
  if (mediumLower.includes('drawing') || mediumLower.includes('pencil') || 
      mediumLower.includes('charcoal') || mediumLower.includes('graphite') ||
      mediumLower.includes('pastel') || mediumLower.includes('chalk') ||
      mediumLower.includes('pen and ink') || mediumLower.includes('ink')) {
    return 'Drawing';
  }
  
  // Textile categories
  if (mediumLower.includes('textile') || mediumLower.includes('fabric') || 
      mediumLower.includes('tapestry') || mediumLower.includes('weaving') ||
      mediumLower.includes('embroidery') || mediumLower.includes('fiber') ||
      mediumLower.includes('felt') || mediumLower.includes('quilted')) {
    return 'Textile';
  }
  
  // Glass categories
  if (mediumLower.includes('glass') || mediumLower.includes('stained glass') ||
      mediumLower.includes('blown glass') || mediumLower.includes('fused glass') ||
      mediumLower.includes('crystal')) {
    return 'Glass Art';
  }
  
  // Mixed Media
  if (mediumLower.includes('mixed media') || mediumLower.includes('collage') ||
      mediumLower.includes('assemblage') || mediumLower.includes('multimedia')) {
    return 'Mixed Media';
  }
  
  // Digital Art
  if (mediumLower.includes('digital') || mediumLower.includes('computer') ||
      mediumLower.includes('digital art') || mediumLower.includes('nft')) {
    return 'Digital Art';
  }
  
  // Paper-based (if not already categorized)
  if (mediumLower.includes('paper') && !mediumLower.includes('on paper')) {
    return 'Works on Paper';
  }
  
  return 'Other/Unspecified';
}

async function categorizeArtworksFromDatabase() {
  console.log('Fetching artworks from database...\n');
  
  try {
    // Get all products with their artist information
    const products = await prisma.product.findMany({
      orderBy: {
        artist: 'asc'
      }
    });
    
    console.log(`Found ${products.length} artworks in database\n`);
    
    // Categorize all products
    const categories: { [key: string]: CategorySummary } = {};
    
    for (const product of products) {
      const category = categorizeByMedium(product.medium || 'Unknown');
      
      if (!categories[category]) {
        categories[category] = {
          category,
          count: 0,
          artists: {},
          examples: []
        };
      }
      
      categories[category].count++;
      
      const artistName = product.artist || 'Unknown Artist';
      categories[category].artists[artistName] = (categories[category].artists[artistName] || 0) + 1;
      
      // Add first 5 examples of each category
      if (categories[category].examples.length < 5) {
        categories[category].examples.push({
          title: product.name,
          artist: artistName,
          medium: product.medium || 'Not specified',
          year: product.year ? parseInt(product.year) : undefined
        });
      }
    }
    
    // Generate comprehensive report
    let report = '# Artwork Categorization Report (From Database)\n\n';
    report += `Generated on: ${new Date().toLocaleString()}\n\n`;
    report += `Total artworks analyzed: ${products.length}\n\n`;
    
    // Summary table
    report += '## Summary by Category\n\n';
    report += '| Category | Count | Percentage |\n';
    report += '|----------|-------|------------|\n';
    
    const sortedCategories = Object.values(categories).sort((a, b) => b.count - a.count);
    
    for (const cat of sortedCategories) {
      const percentage = ((cat.count / products.length) * 100).toFixed(1);
      report += `| ${cat.category} | ${cat.count} | ${percentage}% |\n`;
    }
    
    // Detailed breakdown
    report += '\n## Detailed Breakdown\n\n';
    
    for (const cat of sortedCategories) {
      report += `### ${cat.category} (${cat.count} artworks)\n\n`;
      
      // Artists in this category
      report += '**Artists:**\n';
      const sortedArtists = Object.entries(cat.artists)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10); // Top 10 artists
      
      for (const [artist, count] of sortedArtists) {
        report += `- ${artist}: ${count} pieces\n`;
      }
      
      if (Object.keys(cat.artists).length > 10) {
        report += `- ...and ${Object.keys(cat.artists).length - 10} more artists\n`;
      }
      
      // Example artworks
      report += '\n**Example Artworks:**\n';
      for (const example of cat.examples) {
        report += `- "${example.title}" by ${example.artist}`;
        if (example.year) {
          report += ` (${example.year})`;
        }
        report += `\n  - Medium: ${example.medium}\n`;
      }
      
      report += '\n';
    }
    
    // Artist summary
    report += '## Top Artists by Number of Works\n\n';
    const artistCounts: { [key: string]: number } = {};
    
    for (const product of products) {
      const artistName = product.artist || 'Unknown Artist';
      artistCounts[artistName] = (artistCounts[artistName] || 0) + 1;
    }
    
    const topArtists = Object.entries(artistCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20);
    
    report += '| Artist | Total Works |\n';
    report += '|--------|-------------|\n';
    
    for (const [artist, count] of topArtists) {
      report += `| ${artist} | ${count} |\n`;
    }
    
    // Save reports
    await fs.writeFile('artwork-categorization-database-report.md', report);
    
    // Save detailed JSON
    const detailedResults = products.map(product => ({
      id: product.id,
      title: product.name,
      artist: product.artist || 'Unknown Artist',
      medium: product.medium,
      category: categorizeByMedium(product.medium || 'Unknown'),
      year: product.year,
      dimensions: product.dimensions,
      price: product.price,
      status: product.status
    }));
    
    await fs.writeFile(
      'artwork-categorization-database.json',
      JSON.stringify(detailedResults, null, 2)
    );
    
    // Save CSV
    let csv = 'ID,Title,Artist,Medium,Category,Year,Price,Status\n';
    for (const result of detailedResults) {
      csv += `${result.id},"${result.title}","${result.artist}","${result.medium || ''}","${result.category}",${result.year || ''},${result.price || ''},"${result.status || ''}"\n`;
    }
    await fs.writeFile('artwork-categorization-database.csv', csv);
    
    console.log('\nCategorization complete!');
    console.log('Results saved to:');
    console.log('- artwork-categorization-database-report.md (detailed summary)');
    console.log('- artwork-categorization-database.json (full data)');
    console.log('- artwork-categorization-database.csv (spreadsheet format)');
    
    // Print summary
    console.log('\nCategory Summary:');
    for (const cat of sortedCategories) {
      console.log(`${cat.category}: ${cat.count} artworks`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the categorization
if (require.main === module) {
  categorizeArtworksFromDatabase().catch(console.error);
}