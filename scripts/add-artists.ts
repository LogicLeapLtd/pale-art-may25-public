import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

const artists = [
  {
    name: "Steve Tootell",
    title: "Potter & Creative Educator",
    biography: "Steve Tootell is an internationally renowned potter and educator whose career spans more than 45 years. Originally from Bolton, England, Steve has taught and exhibited across the UK, Japan, the USA, Brazil, and France. After leading the Creative and Performing Arts department at the International School of the Sacred Heart in Tokyo for over three decades, he now runs Apple Tree Studios in Denbigh, North Wales. Steve's artistic influences are global, including British, Indian, Australian, Japanese, Korean, American, and Brazilian traditions. His practice features wood-fired earthenware, Raku with Japanese glazes, and innovative stoneware and slipware techniques.",
    portfolioUrl: null,
    featured: true
  },
  {
    name: "Nick Elphick",
    title: "Contemporary Sculptor",
    biography: "Nick Elphick is a British sculptor known for his bold, expressive work in contemporary sculpture. With a background in fine art, Nick explores the human form through a unique blend of classical technique and modern concepts. His sculptures have been exhibited widely and have earned him recognition for pushing boundaries in both materials and subject matter. Nick's current projects include large-scale commissions and collaborative installations.",
    portfolioUrl: null,
    featured: true
  },
  {
    name: "Jo-Anna Duncalf",
    title: "Conceptual Ceramic Artist",
    biography: "Jo-Anna Duncalf is a conceptual ceramicist whose work draws on her Welsh roots and extensive international experience. Growing up in the Conwy Valley, she studied at Cardiff's Howard Gardens Art School and spent two years in Tokoname, Japan, mastering advanced ceramics. Jo-Anna has held artist residencies in New Zealand, Australia, and Thailand, and her practice often explores form, gender identity, and historical symbolism. She has received national awards and led art programmes at schools across the UK. Jo-Anna currently oversees the art programme at Palé Hall.",
    portfolioUrl: null,
    featured: true
  },
  {
    name: "Gareth Nash",
    title: "Contemporary Painter",
    biography: "Gareth Nash is a Welsh painter celebrated for his vibrant contemporary works. Active on the Welsh and UK art scenes, Gareth's paintings are characterized by dynamic compositions and thoughtful use of color. He has exhibited in a range of group and solo shows and continues to evolve his practice through both traditional and experimental approaches.",
    portfolioUrl: null,
    featured: true
  },
  {
    name: "Glen Farrelly",
    title: "Fine Art Painter",
    biography: "Glen Farrelly is a fine artist based in Wales whose work focuses on landscape, portraiture, and abstraction. With a keen eye for atmosphere and texture, Glen's paintings capture both the beauty of the local environment and broader human experiences. His work has been shown in galleries throughout Wales and the UK, and he continues to explore new directions in his artistic journey.",
    portfolioUrl: null,
    featured: true
  },
  {
    name: "Andy Dobbie",
    title: "Mixed Media Artist",
    biography: "Andy Dobbie is a mixed media artist whose practice spans painting, sculpture, and installation. Known for his experimental approach and creative use of materials, Andy's work often examines personal narratives, memory, and transformation. He has exhibited widely and is recognized for his distinctive style that blends bold visuals with thought-provoking concepts.",
    portfolioUrl: null,
    featured: true
  },
  {
    name: "Mfikela Jean Samuel",
    title: "Contemporary Artist",
    biography: "Mfikela Jean Samuel is an emerging contemporary artist originally from South Africa, now exhibiting internationally. His practice is experimental and socially conscious, addressing themes of identity, heritage, and resilience. Mfikela's work has been featured in galleries around the world, reflecting both personal experience and global perspectives.",
    portfolioUrl: null,
    featured: true
  },
  {
    name: "Roman Nedopaka",
    title: "Painter & Fine Artist",
    biography: "Born in Ukraine and now based in North Wales, Roman Nedopaka is a painter specializing in oil portraiture and figurative work. He trained at the Taras Shevchenko Children's Art School and the National Academy of Fine Arts and Architecture in Kyiv, exhibiting internationally since 2005. Roman's art is distinguished by classical techniques and evocative lighting, and he actively shares his craft through workshops and collaborations in Wales.",
    portfolioUrl: null,
    featured: false
  },
  {
    name: "Alla Chakir",
    title: "Painter & Mixed Media Artist",
    biography: "Alla Chakir, mother of Roman Nedopaka, is a Ukrainian artist now living and working in North Wales. Her mixed media work draws deeply on themes of heritage, memory, and cultural resilience, often shaped by her experiences of displacement. Alla has exhibited alongside Roman in several Welsh galleries, contributing to a shared narrative that blends personal and collective histories.",
    portfolioUrl: null,
    featured: false
  }
]

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function addArtists() {
  try {
    console.log('🎨 Starting artist migration...')
    
    for (const artistData of artists) {
      const slug = createSlug(artistData.name)
      
      // Check if artist already exists
      const existingArtist = await prisma.artist.findUnique({
        where: { slug }
      })
      
      if (existingArtist) {
        console.log(`⚡ Updating existing artist: ${artistData.name}`)
        await prisma.artist.update({
          where: { slug },
          data: {
            ...artistData,
            slug,
            updatedAt: new Date()
          }
        })
      } else {
        console.log(`🆕 Creating new artist: ${artistData.name}`)
        await prisma.artist.create({
          data: {
            id: nanoid(),
            ...artistData,
            slug,
            updatedAt: new Date()
          }
        })
      }
    }
    
    console.log('✅ Artist migration completed successfully!')
    
    // Display summary
    const totalArtists = await prisma.artist.count()
    const featuredArtists = await prisma.artist.count({ where: { featured: true } })
    
    console.log(`📊 Total artists: ${totalArtists}`)
    console.log(`⭐ Featured artists: ${featuredArtists}`)
    
  } catch (error) {
    console.error('❌ Error during artist migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  addArtists().catch(console.error)
}

export { addArtists }