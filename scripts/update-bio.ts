import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const UPDATED_BIO = `Sir Kyffin Williams (1918-2006) was one of Wales' most celebrated artists, renowned for his powerful landscapes and portraits that captured the essence of Welsh identity. Born on Anglesey, Williams developed a distinctive style characterized by bold palette knife work and dramatic interpretations of the Welsh landscape, particularly the mountains of Snowdonia and the coastal scenes of Anglesey.

His work is held in major collections including the National Museum Wales, Tate, and the Royal Academy. Williams was elected to the Royal Academy in 1974 and was knighted in 1999 for his services to art. His paintings command significant prices at auction and are highly sought after by collectors worldwide.

This exceptional collection represents a significant portion of Sir Kyffin Williams' oeuvre, making it one of the most important private collections of his work available today.`

async function updateBio() {
  try {
    const updated = await prisma.artist.update({
      where: { slug: 'sir-kyffin-williams' },
      data: { biography: UPDATED_BIO }
    })
    console.log('✅ Updated Sir Kyffin Williams biography')
  } catch (error) {
    console.error('❌ Error updating biography:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateBio()