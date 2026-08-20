import { getHistory } from '@/lib/actions';
import HomeClient from '@/components/HomeClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const runs = await getHistory();
  return <HomeClient initialRuns={runs} />;
}
