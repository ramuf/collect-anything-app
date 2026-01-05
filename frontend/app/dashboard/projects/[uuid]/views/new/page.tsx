import ViewBuilder from '../components/ViewBuilder'

export default async function NewViewPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  return <ViewBuilder projectId={uuid} />
}
