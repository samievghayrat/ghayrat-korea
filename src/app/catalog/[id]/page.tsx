import CatalogCarDetailClient from '@/components/detail/CatalogCarDetailClient';
import { getSnapshotCarDetail } from '@/lib/encar-api';

export const dynamic = 'force-dynamic';

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initialCar = /^\d+$/.test(id) ? await getSnapshotCarDetail(id) : null;
  return <CatalogCarDetailClient key={id} initialCar={initialCar} />;
}
