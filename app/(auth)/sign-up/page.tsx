import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <main className="flex flex-1 items-center px-6 py-12">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden border border-border bg-surface-lowest md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="hidden border-r border-border bg-surface-low p-10 md:block">
          <p className="mb-16 font-mono text-[10px] tracking-[0.18em] text-text-tertiary uppercase">
            Start with a clear record
          </p>
          <h1 className="max-w-sm font-serif text-4xl leading-tight tracking-tight text-text-primary">
            Make progress visible.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-text-secondary">
            Bring issues and projects into one focused workspace built for small engineering teams.
          </p>
        </section>

        <section className="p-8 sm:p-10">
          <div className="mx-auto max-w-md">
            <p className="font-mono text-[10px] tracking-[0.18em] text-text-tertiary uppercase">
              Create an account
            </p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight text-text-primary">
              Join Origin
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Set up your account to start tracking issues.
            </p>
            <div className="my-7 border-t border-border-hairline" />
            <SignUpForm />
          </div>
        </section>
      </div>
    </main>
  );
}
