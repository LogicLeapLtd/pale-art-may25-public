import { redirect } from 'next/navigation'

interface QRPageProps {
  params: Promise<{
    code: string
  }>
}

export default async function QRPage({ params }: QRPageProps) {
  const { code } = await params
  
  // Simply redirect to the collection page
  redirect(`/collection/${code}`)
}