import { Suspense } from 'react';
import PlanosContent from './PlanosContent';

export default function PlanosPage() {
  return (
    <Suspense>
      <PlanosContent />
    </Suspense>
  );
}
