import LoginForm from '@/app/components/LoginForm'

export default function Page() {
  return (
    <main
      className="flex items-center justify-center p-4 overflow-hidden bg-gradient-to-b from-[#111315] via-[#0f1012] to-[#0c0c0d]"
      style={{ height: 'calc(100vh - var(--header-height))' }}
    >
      <div className="absolute left-6 top-6">
        <div className="text-2xl font-extrabold tracking-tight text-white">IPSUM</div>
      </div>

      <section className="w-full max-w-lg mx-auto">
        <div className="w-full flex items-center justify-center">
          <LoginForm />
        </div>
      </section>
    </main>
  )
}