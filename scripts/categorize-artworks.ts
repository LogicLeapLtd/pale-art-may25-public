import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

interface ArtworkAnalysis {
  filePath: string;
  artist: string;
  fileName: string;
  category: string;
  confidence: number;
  analysis: string;
}

async function analyzeImage(imagePath: string): Promise<{ category: string; confidence: number; analysis: string }> {
  // Since we can't directly analyze images with Playwright alone,
  // we'll need to use a visual AI service. For now, I'll create a placeholder
  // that categorizes based on filename patterns and folder structure
  
  const fileName = path.basename(imagePath).toLowerCase();
  const dirPath = path.dirname(imagePath).toLowerCase();
  
  // Basic categorization based on common patterns in filenames
  let category = 'Unknown';
  let confidence = 0.5;
  let analysis = 'Unable to determine medium from filename';
  
  // Check for common patterns
  if (fileName.includes('painting') || fileName.includes('oil') || fileName.includes('acrylic') || 
      fileName.includes('watercolor') || fileName.includes('canvas')) {
    category = 'Painting';
    confidence = 0.8;
    analysis = 'Identified as painting based on filename keywords';
  } else if (fileName.includes('ceramic') || fileName.includes('pottery') || fileName.includes('clay') ||
             fileName.includes('porcelain') || fileName.includes('stoneware')) {
    category = 'Ceramic';
    confidence = 0.8;
    analysis = 'Identified as ceramic based on filename keywords';
  } else if (fileName.includes('sculpture') || fileName.includes('bronze') || fileName.includes('marble') ||
             fileName.includes('stone') || fileName.includes('wood carving')) {
    category = 'Sculpture';
    confidence = 0.8;
    analysis = 'Identified as sculpture based on filename keywords';
  } else if (fileName.includes('print') || fileName.includes('lithograph') || fileName.includes('etching') ||
             fileName.includes('screen print') || fileName.includes('giclée')) {
    category = 'Print';
    confidence = 0.8;
    analysis = 'Identified as print based on filename keywords';
  } else if (fileName.includes('photo') || fileName.includes('photograph')) {
    category = 'Photography';
    confidence = 0.8;
    analysis = 'Identified as photography based on filename keywords';
  } else if (fileName.includes('drawing') || fileName.includes('pencil') || fileName.includes('charcoal') ||
             fileName.includes('sketch')) {
    category = 'Drawing';
    confidence = 0.8;
    analysis = 'Identified as drawing based on filename keywords';
  } else if (fileName.includes('textile') || fileName.includes('fabric') || fileName.includes('tapestry')) {
    category = 'Textile';
    confidence = 0.8;
    analysis = 'Identified as textile based on filename keywords';
  } else if (fileName.includes('glass') || fileName.includes('stained glass')) {
    category = 'Glass Art';
    confidence = 0.8;
    analysis = 'Identified as glass art based on filename keywords';
  } else if (fileName.includes('mixed media') || fileName.includes('collage')) {
    category = 'Mixed Media';
    confidence = 0.8;
    analysis = 'Identified as mixed media based on filename keywords';
  }
  
  return { category, confidence, analysis };
}

async function categorizeArtworks() {
  console.log('Starting artwork categorization...\n');
  
  // Find all image files in the relevant directories
  const imagePatterns = [
    'public/product_images/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}',
    'public/Unblurred Images/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}',
    'public/*/products/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}',
    'temp/ARTPRODUCTS/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}'
  ];
  
  const results: ArtworkAnalysis[] = [];
  
  for (const pattern of imagePatterns) {
    const files = await glob(pattern);
    console.log(`Found ${files.length} images matching pattern: ${pattern}`);
    
    for (const file of files) {
      const fullPath = path.resolve(file);
      const artistMatch = file.match(/public\/([^\/]+)\/products/);
      const artist = artistMatch ? artistMatch[1].replace(/_/g, ' ') : 'Unknown Artist';
      
      const { category, confidence, analysis } = await analyzeImage(fullPath);
      
      results.push({
        filePath: file,
        artist: artist,
        fileName: path.basename(file),
        category,
        confidence,
        analysis
      });
    }
  }
  
  // Group results by category
  const categorySummary: { [key: string]: ArtworkAnalysis[] } = {};
  
  for (const result of results) {
    if (!categorySummary[result.category]) {
      categorySummary[result.category] = [];
    }
    categorySummary[result.category].push(result);
  }
  
  // Generate report
  let report = '# Artwork Categorization Report\n\n';
  report += `Total artworks analyzed: ${results.length}\n\n`;
  report += '## Summary by Category\n\n';
  
  for (const [category, items] of Object.entries(categorySummary)) {
    report += `### ${category} (${items.length} items)\n\n`;
    
    // Group by artist within category
    const byArtist: { [key: string]: ArtworkAnalysis[] } = {};
    for (const item of items) {
      if (!byArtist[item.artist]) {
        byArtist[item.artist] = [];
      }
      byArtist[item.artist].push(item);
    }
    
    for (const [artist, artworks] of Object.entries(byArtist)) {
      report += `**${artist}** (${artworks.length} pieces)\n`;
      for (const artwork of artworks) {
        report += `- ${artwork.fileName} (confidence: ${(artwork.confidence * 100).toFixed(0)}%)\n`;
      }
      report += '\n';
    }
  }
  
  // Save detailed JSON results
  await fs.writeFile(
    'artwork-categorization-results.json',
    JSON.stringify(results, null, 2)
  );
  
  // Save markdown report
  await fs.writeFile('artwork-categorization-report.md', report);
  
  // Save CSV for easy viewing
  let csv = 'File Path,Artist,File Name,Category,Confidence,Analysis\n';
  for (const result of results) {
    csv += `"${result.filePath}","${result.artist}","${result.fileName}","${result.category}",${result.confidence},"${result.analysis}"\n`;
  }
  await fs.writeFile('artwork-categorization.csv', csv);
  
  console.log('\nCategorization complete!');
  console.log('Results saved to:');
  console.log('- artwork-categorization-report.md (summary report)');
  console.log('- artwork-categorization-results.json (detailed data)');
  console.log('- artwork-categorization.csv (spreadsheet format)');
  
  // Print summary
  console.log('\nCategory Summary:');
  for (const [category, items] of Object.entries(categorySummary)) {
    console.log(`${category}: ${items.length} items`);
  }
}

// Enhanced version that uses Playwright to display images and get visual analysis
async function categorizeArtworksWithVisualAnalysis() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Create a simple HTML page to display images
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Artwork Analysis</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .artwork { margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 20px; }
        img { max-width: 600px; max-height: 600px; display: block; margin: 10px 0; }
        .info { margin: 10px 0; }
        .category { font-weight: bold; color: #2563eb; }
      </style>
    </head>
    <body>
      <h1>Artwork Visual Analysis</h1>
      <div id="content"></div>
    </body>
    </html>
  `;
  
  await page.setContent(htmlContent);
  
  // Note: For actual visual analysis, you would need to integrate with an AI vision API
  // This is a demonstration of how to use Playwright to display and potentially analyze images
  
  await browser.close();
}

// Run the categorization
if (require.main === module) {
  categorizeArtworks().catch(console.error);
}