import { chromium, Browser, Page } from 'playwright';
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
  visualFeatures?: {
    colors?: string[];
    texture?: string;
    style?: string;
    subject?: string;
  };
}

// Categories we're looking for
const ARTWORK_CATEGORIES = [
  'Painting',
  'Ceramic',
  'Sculpture',
  'Print',
  'Photography',
  'Drawing',
  'Textile',
  'Glass Art',
  'Mixed Media',
  'Digital Art',
  'Installation',
  'Collage'
];

async function setupAnalysisPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();
  
  // Create an HTML page with image analysis capabilities
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Artwork Visual Analysis</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          padding: 20px;
          background: #f5f5f5;
        }
        .analyzer {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }
        img { 
          max-width: 800px; 
          max-height: 600px; 
          display: block; 
          margin: 20px auto;
          border: 1px solid #ddd;
        }
        .analysis-form {
          margin: 20px 0;
        }
        .form-group {
          margin: 15px 0;
        }
        label {
          display: block;
          font-weight: bold;
          margin-bottom: 5px;
        }
        select, textarea, input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        textarea {
          height: 100px;
          resize: vertical;
        }
        .visual-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 20px 0;
        }
        button {
          background: #2563eb;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        button:hover {
          background: #1d4ed8;
        }
        #result {
          margin-top: 20px;
          padding: 15px;
          background: #f0f9ff;
          border-radius: 4px;
          white-space: pre-wrap;
        }
      </style>
    </head>
    <body>
      <h1>Artwork Visual Analysis Tool</h1>
      <div class="analyzer">
        <h2>Current Image</h2>
        <img id="artwork-image" src="" alt="Artwork">
        
        <div class="analysis-form">
          <h3>Visual Analysis</h3>
          
          <div class="form-group">
            <label for="category">Artwork Category:</label>
            <select id="category">
              <option value="">Select category...</option>
              ${ARTWORK_CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
            </select>
          </div>
          
          <div class="form-group">
            <label for="confidence">Confidence (0-100%):</label>
            <input type="number" id="confidence" min="0" max="100" value="80">
          </div>
          
          <div class="visual-features">
            <div class="form-group">
              <label for="primary-colors">Primary Colors:</label>
              <input type="text" id="primary-colors" placeholder="e.g., blue, red, gold">
            </div>
            
            <div class="form-group">
              <label for="texture">Texture/Surface:</label>
              <input type="text" id="texture" placeholder="e.g., smooth, rough, glazed">
            </div>
            
            <div class="form-group">
              <label for="style">Style/Movement:</label>
              <input type="text" id="style" placeholder="e.g., abstract, realistic, impressionist">
            </div>
            
            <div class="form-group">
              <label for="subject">Subject Matter:</label>
              <input type="text" id="subject" placeholder="e.g., landscape, portrait, still life">
            </div>
          </div>
          
          <div class="form-group">
            <label for="analysis">Detailed Analysis:</label>
            <textarea id="analysis" placeholder="Describe the artwork's medium, technique, and visual characteristics..."></textarea>
          </div>
          
          <button onclick="saveAnalysis()">Save Analysis</button>
        </div>
        
        <div id="result"></div>
      </div>
      
      <script>
        let currentImagePath = '';
        
        function loadImage(imagePath) {
          currentImagePath = imagePath;
          document.getElementById('artwork-image').src = 'file://' + imagePath;
          // Reset form
          document.getElementById('category').value = '';
          document.getElementById('confidence').value = '80';
          document.getElementById('primary-colors').value = '';
          document.getElementById('texture').value = '';
          document.getElementById('style').value = '';
          document.getElementById('subject').value = '';
          document.getElementById('analysis').value = '';
          document.getElementById('result').textContent = '';
        }
        
        function saveAnalysis() {
          const analysis = {
            filePath: currentImagePath,
            category: document.getElementById('category').value,
            confidence: parseInt(document.getElementById('confidence').value) / 100,
            analysis: document.getElementById('analysis').value,
            visualFeatures: {
              colors: document.getElementById('primary-colors').value.split(',').map(c => c.trim()).filter(c => c),
              texture: document.getElementById('texture').value,
              style: document.getElementById('style').value,
              subject: document.getElementById('subject').value
            }
          };
          
          // Store in window for Playwright to retrieve
          window.lastAnalysis = analysis;
          document.getElementById('result').textContent = 'Analysis saved!\\n' + JSON.stringify(analysis, null, 2);
        }
        
        // Automatic analysis based on image characteristics
        function autoAnalyze() {
          const img = document.getElementById('artwork-image');
          
          // This is where you could integrate with a real AI vision API
          // For now, we'll provide a template for manual analysis
          
          // Suggest based on filename
          const filename = currentImagePath.toLowerCase();
          let suggestedCategory = '';
          
          if (filename.includes('painting') || filename.includes('oil') || filename.includes('acrylic')) {
            suggestedCategory = 'Painting';
          } else if (filename.includes('ceramic') || filename.includes('pottery')) {
            suggestedCategory = 'Ceramic';
          } else if (filename.includes('sculpture')) {
            suggestedCategory = 'Sculpture';
          }
          
          if (suggestedCategory) {
            document.getElementById('category').value = suggestedCategory;
          }
        }
      </script>
    </body>
    </html>
  `;
  
  await page.setContent(htmlContent);
  return page;
}

async function analyzeWithPlaywright(page: Page, imagePath: string): Promise<Partial<ArtworkAnalysis>> {
  // Load the image
  await page.evaluate((path) => {
    (window as any).loadImage(path);
  }, imagePath);
  
  // Wait for image to load
  await page.waitForTimeout(500);
  
  // Auto-analyze
  await page.evaluate(() => {
    (window as any).autoAnalyze();
  });
  
  // For automated analysis, we'll use basic heuristics
  // In a real implementation, you would integrate with an AI vision API here
  
  const fileName = path.basename(imagePath).toLowerCase();
  let category = 'Unknown';
  let confidence = 0.5;
  let analysis = 'Visual analysis pending manual review';
  
  // Enhanced pattern matching
  const patterns = {
    'Painting': ['painting', 'oil', 'acrylic', 'watercolor', 'canvas', 'gouache', 'tempera'],
    'Ceramic': ['ceramic', 'pottery', 'clay', 'porcelain', 'stoneware', 'earthenware', 'glaze'],
    'Sculpture': ['sculpture', 'bronze', 'marble', 'stone', 'wood carving', 'metal', 'cast'],
    'Print': ['print', 'lithograph', 'etching', 'screen print', 'giclée', 'serigraph', 'woodcut'],
    'Photography': ['photo', 'photograph', 'digital photo', 'silver gelatin'],
    'Drawing': ['drawing', 'pencil', 'charcoal', 'sketch', 'graphite', 'pastel', 'ink'],
    'Textile': ['textile', 'fabric', 'tapestry', 'weaving', 'embroidery', 'fiber'],
    'Glass Art': ['glass', 'stained glass', 'blown glass', 'fused glass'],
    'Mixed Media': ['mixed media', 'collage', 'assemblage', 'multimedia']
  };
  
  for (const [cat, keywords] of Object.entries(patterns)) {
    if (keywords.some(keyword => fileName.includes(keyword))) {
      category = cat;
      confidence = 0.85;
      analysis = `Identified as ${cat} based on filename pattern matching`;
      break;
    }
  }
  
  return { category, confidence, analysis };
}

async function categorizeArtworksWithBrowser() {
  console.log('Starting visual artwork categorization with Playwright...\n');
  
  const browser = await chromium.launch({ 
    headless: true  // Set to false if you want to see the browser
  });
  
  try {
    const page = await setupAnalysisPage(browser);
    
    // Find all image files
    const imagePatterns = [
      'public/product_images/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}',
      'public/Unblurred Images/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}',
      'public/*/products/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}',
      'temp/ARTPRODUCTS/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}'
    ];
    
    const results: ArtworkAnalysis[] = [];
    let totalProcessed = 0;
    
    for (const pattern of imagePatterns) {
      const files = await glob(pattern);
      console.log(`Found ${files.length} images matching pattern: ${pattern}`);
      
      for (const file of files) {
        const fullPath = path.resolve(file);
        const artistMatch = file.match(/public\/([^\/]+)\/products/);
        const artist = artistMatch ? artistMatch[1].replace(/_/g, ' ') : 'Unknown Artist';
        
        const analysis = await analyzeWithPlaywright(page, fullPath);
        
        results.push({
          filePath: file,
          artist: artist,
          fileName: path.basename(file),
          category: analysis.category || 'Unknown',
          confidence: analysis.confidence || 0.5,
          analysis: analysis.analysis || 'No analysis available',
          visualFeatures: analysis.visualFeatures
        });
        
        totalProcessed++;
        if (totalProcessed % 10 === 0) {
          console.log(`Processed ${totalProcessed} images...`);
        }
      }
    }
    
    // Generate comprehensive report
    await generateReports(results);
    
  } finally {
    await browser.close();
  }
}

async function generateReports(results: ArtworkAnalysis[]) {
  // Group results by category
  const categorySummary: { [key: string]: ArtworkAnalysis[] } = {};
  
  for (const result of results) {
    if (!categorySummary[result.category]) {
      categorySummary[result.category] = [];
    }
    categorySummary[result.category].push(result);
  }
  
  // Generate detailed markdown report
  let report = '# Artwork Categorization Report\n\n';
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;
  report += `Total artworks analyzed: ${results.length}\n\n`;
  
  // Summary statistics
  report += '## Summary Statistics\n\n';
  report += '| Category | Count | Percentage |\n';
  report += '|----------|-------|------------|\n';
  
  for (const [category, items] of Object.entries(categorySummary)) {
    const percentage = ((items.length / results.length) * 100).toFixed(1);
    report += `| ${category} | ${items.length} | ${percentage}% |\n`;
  }
  
  report += '\n## Detailed Breakdown by Category\n\n';
  
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
      report += `#### ${artist} (${artworks.length} pieces)\n\n`;
      for (const artwork of artworks) {
        report += `- **${artwork.fileName}**\n`;
        report += `  - Confidence: ${(artwork.confidence * 100).toFixed(0)}%\n`;
        report += `  - Analysis: ${artwork.analysis}\n`;
        if (artwork.visualFeatures) {
          if (artwork.visualFeatures.colors?.length) {
            report += `  - Colors: ${artwork.visualFeatures.colors.join(', ')}\n`;
          }
          if (artwork.visualFeatures.style) {
            report += `  - Style: ${artwork.visualFeatures.style}\n`;
          }
        }
      }
      report += '\n';
    }
  }
  
  // Save all reports
  await fs.writeFile(
    'artwork-categorization-results.json',
    JSON.stringify(results, null, 2)
  );
  
  await fs.writeFile('artwork-categorization-report.md', report);
  
  // Generate CSV
  let csv = 'File Path,Artist,File Name,Category,Confidence,Analysis\n';
  for (const result of results) {
    csv += `"${result.filePath}","${result.artist}","${result.fileName}","${result.category}",${(result.confidence * 100).toFixed(0)}%,"${result.analysis}"\n`;
  }
  await fs.writeFile('artwork-categorization.csv', csv);
  
  console.log('\nCategorization complete!');
  console.log('Results saved to:');
  console.log('- artwork-categorization-report.md (detailed summary report)');
  console.log('- artwork-categorization-results.json (full data in JSON format)');
  console.log('- artwork-categorization.csv (spreadsheet format)');
  
  // Print summary
  console.log('\nCategory Summary:');
  for (const [category, items] of Object.entries(categorySummary)) {
    console.log(`${category}: ${items.length} items`);
  }
}

// Run the categorization
if (require.main === module) {
  categorizeArtworksWithBrowser().catch(console.error);
}