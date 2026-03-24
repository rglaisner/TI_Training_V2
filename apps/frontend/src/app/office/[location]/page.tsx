import { notFound } from 'next/navigation';
import { OfficeLocationClient } from '@/components/office/OfficeLocationClient';
import type { LocationId } from '@/lib/officeLocations';
import { locationIdSchema, OFFICE_LOCATION_MANIFEST } from '@/lib/officeLocations';

export function generateStaticParams(): { location: LocationId }[] {
  return OFFICE_LOCATION_MANIFEST.map((entry) => ({ location: entry.id }));
}

export default function OfficeLocationPage({ params }: { params: { location: string } }) {
  const parsed = locationIdSchema.safeParse(params.location);
  if (!parsed.success) {
    notFound();
  }
  return <OfficeLocationClient locationId={parsed.data} />;
}
