import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { GalaxyView } from '@/components/galaxy/GalaxyView';

export default async function GalaxyPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return <GalaxyView userId={session.user.id!} />;
}
