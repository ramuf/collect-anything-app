import { redirect } from 'next/navigation';

export default async function ProjectPage({ params }: { params: any }) {
  const { uuid } = await params;
  redirect(`/dashboard/projects/${uuid}/forms`);
}
