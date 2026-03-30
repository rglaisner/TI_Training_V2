import { redirect } from 'next/navigation';

/** Legacy path — consumer prototype uses /progress (mock) until integration. */
export default function TrackerRedirectPage() {
  redirect('/progress');
}
