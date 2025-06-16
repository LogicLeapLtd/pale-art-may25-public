const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Read the JSON data from the temp folder
const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, '../temp/ARTPRODUCTS/all_products_with_images.json'), 'utf8'));

// Get backup images data
function getBackupImages() {
    const backupPath = path.join(__dirname, '../backups/art-backup-2025-05-29T16-37-55-842Z');
    const backupImages = [];

    // Check if backup directory exists
    if (!fs.existsSync(backupPath)) {
        console.log('Backup directory not found');
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

    // Get other images
    const otherImagesPath = path.join(backupPath, 'Other Images For Use');
    if (fs.existsSync(otherImagesPath)) {
        const images = fs.readdirSync(otherImagesPath);
        images.forEach(image => {
            if (image.match(/\.(jpeg|jpg|JPG)$/)) {
                backupImages.push({
                    category: 'Other Images For Use',
                    artist: 'Unknown',
                    filename: image,
                    path: `backups/art-backup-2025-05-29T16-37-55-842Z/Other Images For Use/${image}`
                });
            }
        });
    }

    return backupImages;
}

// Extract artist name from title
function extractArtistFromTitle(title) {
    // Look for patterns like "Artist Name [dates]" or "Artist Name,"
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

// Main export function
async function exportArtworkSpreadsheet() {
    console.log('Starting artwork export...');
    
    // Prepare main catalog data
    const mainArtworks = jsonData.map((item, index) => ({
        id: String(index + 1).padStart(3, '0'),
        title: item.title || '',
        artist: extractArtistFromTitle(item.title || ''),
        price: '', // To be filled by head artist
        dimensions: '', // To be filled by head artist
        medium: '', // To be filled by head artist
        year: '', // To be filled by head artist
        description: '', // To be filled by head artist
        category: 'Main Catalog',
        status: 'Available',
        local_image_path: item.local_image || '',
        online_image_url: item.image || '',
        product_url: item.url || '',
        notes: 'From main product catalog',
        image_notes: 'Head artist: please verify and add missing image'
    }));

    // Get backup images
    const backupImages = getBackupImages();
    const backupArtworks = backupImages.map((item, index) => ({
        id: 'B' + String(index + 1).padStart(3, '0'),
        title: item.filename.replace(/\.(jpeg|jpg|JPG)$/, '').replace(/_/g, ' '),
        artist: item.artist || 'Unknown',
        price: '', // To be filled by head artist
        dimensions: '', // To be filled by head artist
        medium: '', // To be filled by head artist
        year: '', // To be filled by head artist
        description: '', // To be filled by head artist
        category: item.category,
        status: 'Needs Review',
        local_image_path: item.path,
        online_image_url: '',
        product_url: '',
        notes: `From backup folder - ${item.category}`,
        image_notes: 'Head artist: please add title, pricing, and details'
    }));

    // Combine all artworks
    const allArtworks = [...mainArtworks, ...backupArtworks];

    // Create CSV writer
    const csvWriter = createCsvWriter({
        path: path.join(__dirname, '../artwork-inventory-for-review.csv'),
        header: [
            { id: 'id', title: 'ID' },
            { id: 'title', title: 'TITLE (Head Artist: Update)' },
            { id: 'artist', title: 'ARTIST (Head Artist: Verify)' },
            { id: 'price', title: 'PRICE (Head Artist: Add)' },
            { id: 'dimensions', title: 'DIMENSIONS (Head Artist: Add)' },
            { id: 'medium', title: 'MEDIUM (Head Artist: Add)' },
            { id: 'year', title: 'YEAR (Head Artist: Add)' },
            { id: 'description', title: 'DESCRIPTION (Head Artist: Add)' },
            { id: 'category', title: 'CATEGORY' },
            { id: 'status', title: 'STATUS' },
            { id: 'local_image_path', title: 'IMAGE FILE PATH' },
            { id: 'online_image_url', title: 'ONLINE IMAGE URL' },
            { id: 'product_url', title: 'PRODUCT PAGE URL' },
            { id: 'notes', title: 'NOTES' },
            { id: 'image_notes', title: 'IMAGE INSTRUCTIONS' }
        ]
    });

    // Write CSV file
    await csvWriter.writeRecords(allArtworks);
    
    console.log(`✅ Export completed!`);
    console.log(`📊 Total artworks exported: ${allArtworks.length}`);
    console.log(`📁 Main catalog items: ${mainArtworks.length}`);
    console.log(`📁 Backup items: ${backupArtworks.length}`);
    console.log(`💾 File saved as: artwork-inventory-for-review.csv`);
    console.log(`\n📋 Summary by category:`);
    
    const categoryStats = allArtworks.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
    }, {});
    
    Object.entries(categoryStats).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} items`);
    });
    
    console.log(`\n🎨 Instructions for Head Artist:`);
    console.log(`1. Open artwork-inventory-for-review.csv in Excel or Google Sheets`);
    console.log(`2. Review each artwork image using the IMAGE FILE PATH column`);
    console.log(`3. Fill in missing information in columns marked "Head Artist: Add"`);
    console.log(`4. Verify and correct titles and artist names where needed`);
    console.log(`5. Add pricing for each piece`);
    console.log(`6. Update status if any pieces are sold or unavailable`);
}

// Run the export
exportArtworkSpreadsheet().catch(console.error);