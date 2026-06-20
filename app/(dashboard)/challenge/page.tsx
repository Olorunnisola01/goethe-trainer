import { Suspense } from 'react';
import { ChallengeClient } from './ChallengeClient';

export const metadata = { title: 'Quiz-Duell' };

export default function ChallengePage() {
  return (
    <Suspense fallback={null}>
      <ChallengeClient />
    </Suspense>
  );
}
