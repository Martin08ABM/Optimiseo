import Header from '@/src/components/Header';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col px-4 py-2 min-h-screen bg-linear-to-b from-slate-900 via-zinc-950 to-black">
      <Header />
      <ResetPasswordForm />
    </div>
  );
}
