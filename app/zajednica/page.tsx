import { redirect } from 'next/navigation';

// Community page - redirect to blog for now
export default function ZajednicaPage() {
  // Redirect to blog until social feed is fully functional
  redirect('/blog');
}
