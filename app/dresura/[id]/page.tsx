import { redirect } from 'next/navigation';

interface DresuraTrainerRedirectPageProps {
  params: Promise<{ id: string }>;
}

export default async function DresuraTrainerRedirectPage({ params }: DresuraTrainerRedirectPageProps) {
  const { id } = await params;
  redirect(`/trener/${id}`);
}
