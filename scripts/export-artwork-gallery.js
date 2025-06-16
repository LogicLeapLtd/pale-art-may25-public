const fs = require('fs');
const path = require('path');

// Read the corrected JSON data
const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/final_corrected_products.json'), 'utf8'));

// Get backup images data
function getBackupImages() {
    const backupPath = path.join(__dirname, '../backups/art-backup-2025-05-29T16-37-55-842Z');
    const backupImages = [];

    if (!fs.existsSync(backupPath)) {
        return backupImages;
    }

    // Get identified artist images
    const identifiedPath = path.join(backupPath, 'Art - Products/Identified - Products');
    if (fs.existsSync(identifiedPath)) {
        const artists = fs.readdirSync(identifiedPath);
        artists.forEach(artist => {
            const artistPath = path.join(identifiedPath, artist);
            if (fs.statSync(artistPath).isDirectory()) {
                const artworks = fs.readdirSync(artistPath);
                artworks.forEach(artwork => {
                    if (artwork.match(/\.(jpeg|jpg|JPG)$/)) {
                        backupImages.push({
                            category: 'Identified Artwork',
                            artist: artist,
                            filename: artwork,
                            path: `backups/art-backup-2025-05-29T16-37-55-842Z/Art - Products/Identified - Products/${artist}/${artwork}`
                        });
                    }
                });
            }
        });
    }

    // Get unidentified artwork
    const unidentifiedPath = path.join(backupPath, 'Art - Products/Unidentified - Products');
    if (fs.existsSync(unidentifiedPath)) {
        const categories = fs.readdirSync(unidentifiedPath);
        categories.forEach(category => {
            const categoryPath = path.join(unidentifiedPath, category);
            if (fs.statSync(categoryPath).isDirectory()) {
                const artworks = fs.readdirSync(categoryPath);
                artworks.forEach(artwork => {
                    if (artwork.match(/\.(jpeg|jpg|JPG)$/)) {
                        backupImages.push({
                            category: `Unidentified - ${category}`,
                            artist: 'Unknown',
                            filename: artwork,
                            path: `backups/art-backup-2025-05-29T16-37-55-842Z/Art - Products/Unidentified - Products/${category}/${artwork}`
                        });
                    }
                });
            }
        });
    }

    return backupImages;
}

// Extract artist name from title
function extractArtistFromTitle(title) {
    const patterns = [
        /^([^[,]+)\s*\[/, // Artist name before brackets
        /^([^,]+),/, // Artist name before comma
    ];
    
    for (const pattern of patterns) {
        const match = title.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }
    
    return 'Unknown';
}

// Generate HTML gallery
function generateArtworkGallery() {
    console.log('Creating artwork gallery...');
    
    // Prepare main catalog data
    const mainArtworks = jsonData.map((item, index) => ({
        id: String(index + 1).padStart(3, '0'),
        title: item.title || 'Untitled',
        artist: item.artist || 'Unknown Artist',
        category: item.category === 'identified' ? 'Identified Artist' : 'Unidentified Artist',
        confidence: item.confidence || 'unknown',
        imagePath: item.local_image ? `public/${item.local_image}` : '',
        onlineImage: item.image || '',
        hasLocalImage: !!item.local_image
    }));

    // Get backup images
    const backupImages = getBackupImages();
    const backupArtworks = backupImages.map((item, index) => ({
        id: 'B' + String(index + 1).padStart(3, '0'),
        title: item.filename.replace(/\.(jpeg|jpg|JPG)$/, '').replace(/_/g, ' '),
        artist: item.artist || 'Unknown Artist',
        category: `Backup - ${item.category}`,
        imagePath: item.path,
        onlineImage: '',
        hasLocalImage: true
    }));

    const allArtworks = [...mainArtworks, ...backupArtworks];

    // Create HTML content
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Artwork Inventory - Head Artist Review</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header h1 {
            color: #2c3e50;
            margin: 0;
        }
        .stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 15px;
        }
        .stat {
            text-align: center;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #e74c3c;
        }
        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }
        .artwork-card {
            background: white;
            border-radius: 10px;
            padding: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .artwork-card:hover {
            transform: translateY(-5px);
        }
        .artwork-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 10px;
            border: 2px solid #ecf0f1;
        }
        .no-image {
            width: 100%;
            height: 200px;
            background: #ecf0f1;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #95a5a6;
            font-style: italic;
            margin-bottom: 10px;
        }
        .artwork-id {
            font-size: 0.9em;
            color: #7f8c8d;
            font-weight: bold;
        }
        .title-input {
            width: 100%;
            padding: 8px;
            border: 1px solid #3498db;
            border-radius: 5px;
            margin-bottom: 8px;
            font-size: 1.1em;
            font-weight: bold;
        }
        .artist-input {
            width: 100%;
            padding: 8px;
            border: 1px solid #e74c3c;
            border-radius: 5px;
            margin-bottom: 8px;
            font-size: 1em;
        }
        .artwork-category {
            background: #3498db;
            color: white;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            display: inline-block;
            margin-bottom: 10px;
        }
        .price-input {
            width: 100%;
            padding: 8px;
            border: 2px solid #e74c3c;
            border-radius: 5px;
            margin-bottom: 8px;
            font-size: 1em;
        }
        .description-input {
            width: 100%;
            padding: 8px;
            border: 1px solid #bdc3c7;
            border-radius: 5px;
            resize: vertical;
            min-height: 60px;
            font-family: Arial, sans-serif;
        }
        .input-label {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 3px;
            display: block;
            font-size: 0.9em;
        }
        .category-identified { background: #27ae60; }
        .category-unidentified { background: #e67e22; }
        .category-backup { background: #8e44ad; }
        .category-other { background: #34495e; }
        
        .instructions {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .instructions h3 {
            margin-top: 0;
            color: #856404;
        }
        
        @media print {
            .artwork-card {
                break-inside: avoid;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎨 Artwork Inventory - Head Artist Review</h1>
        <div class="stats">
            <div class="stat">
                <div class="stat-number">${allArtworks.length}</div>
                <div>Total Artworks</div>
            </div>
            <div class="stat">
                <div class="stat-number">${mainArtworks.length}</div>
                <div>Main Catalog</div>
            </div>
            <div class="stat">
                <div class="stat-number">${backupArtworks.length}</div>
                <div>From Backups</div>
            </div>
        </div>
    </div>

    <div class="instructions">
        <h3>📋 Instructions for Head Artist:</h3>
        <ul>
            <li><strong>Review each artwork image</strong> - All images are high-resolution and corrected</li>
            <li><strong>Verify artist attributions</strong> - Check the red artist fields (some are identified, others need research)</li>
            <li><strong>Edit titles if needed</strong> - Update the blue title fields if incorrect</li>
            <li><strong>Set sale prices</strong> - Determine and enter the selling price for each piece</li>
            <li><strong>Add descriptions</strong> - Include dimensions, medium, year, condition, provenance</li>
            <li><strong>Save your work</strong> - Print this page or save as PDF when complete</li>
        </ul>
    </div>

    <div class="gallery">
        ${allArtworks.map(artwork => {
            const categoryClass = artwork.category.includes('Identified Artist') ? 'category-identified' :
                                 artwork.category.includes('Unidentified Artist') ? 'category-unidentified' :
                                 artwork.category.includes('Backup') ? 'category-backup' : 'category-other';
            
            return `
            <div class="artwork-card">
                <div class="artwork-id">ID: ${artwork.id}</div>
                ${artwork.hasLocalImage ? 
                    `<img src="${artwork.imagePath}" alt="${artwork.title}" class="artwork-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                     <div class="no-image" style="display:none;">Local image not found: ${artwork.imagePath}</div>` :
                    `<div class="no-image">No local image available</div>`
                }
                <div class="artwork-category ${categoryClass}">${artwork.category}</div>
                
                <label class="input-label">🎨 TITLE:</label>
                <input type="text" class="title-input" value="${artwork.title}" placeholder="Enter artwork title" />
                
                <label class="input-label">👨‍🎨 ARTIST:</label>
                <input type="text" class="artist-input" value="${artwork.artist}" placeholder="Enter artist name" />
                
                <label class="input-label">💰 SELLING PRICE:</label>
                <input type="text" class="price-input" placeholder="Set sale price (e.g., £250, £1,500)" />
                
                <label class="input-label">📝 DESCRIPTION & DETAILS:</label>
                <textarea class="description-input" placeholder="Dimensions, medium, year, condition, provenance, etc..."></textarea>
            </div>
            `;
        }).join('')}
    </div>

    <script>
        // Add some interactivity
        document.addEventListener('DOMContentLoaded', function() {
            const priceInputs = document.querySelectorAll('.price-input');
            priceInputs.forEach(input => {
                input.addEventListener('focus', function() {
                    this.style.borderColor = '#27ae60';
                });
                input.addEventListener('blur', function() {
                    this.style.borderColor = this.value ? '#27ae60' : '#e74c3c';
                });
            });
        });
    </script>
</body>
</html>
    `;

    // Write HTML file
    fs.writeFileSync(path.join(__dirname, '../artwork-gallery-review.html'), htmlContent);
    
    console.log(`✅ Gallery created!`);
    console.log(`📊 Total artworks: ${allArtworks.length}`);
    console.log(`🖼️  With images: ${allArtworks.filter(a => a.hasLocalImage).length}`);
    console.log(`💾 File saved as: artwork-gallery-review.html`);
    console.log(`\n🎨 Open artwork-gallery-review.html in your browser to review all artwork!`);
}

// Run the export
generateArtworkGallery();