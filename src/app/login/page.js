'use client';

import { useRouter } from 'next/navigation';
import LoginForm from '@/app/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <LoginForm onSuccess={() => router.push('/')} />
    </main>
  );
}
