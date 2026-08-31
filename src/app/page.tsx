import Link from "next/link";
import { Fraunces, Manrope } from "next/font/google";
import { createClient } from "@/utils/supabase/server"; // adjust path if different

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className={`${fraunces.variable} ${manrope.variable}`}>
      <main className="min-h-screen bg-[#EEF4F2] text-[#17241E] [font-family:var(--font-body)] flex flex-col">
        {/* Nav */}
        <header className="flex items-center justify-between px-6 md:px-12 py-6">
          <span className="text-lg font-semibold tracking-tight [font-family:var(--font-display)]">
            Reframe-AI
          </span>
        </header>

        {/* Hero */}
        <section className="flex-1 flex flex-col md:flex-row items-center gap-12 md:gap-16 px-6 md:px-12 py-10 md:py-20 max-w-6xl mx-auto w-full">
          {/* Text side */}
          <div className="flex-1 max-w-xl">
            <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#3F7268]">
              A quiet space, built on CBT
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl leading-[1.1] font-medium [font-family:var(--font-display)]">
              Notice the thought.
              <br />
              Rewrite the story.
            </h1>
            <p className="mt-5 text-base md:text-lg text-[#3E4A44] leading-relaxed">
              Reframe-AI helps you catch the thoughts that spiral, and walks
              you through reframing them — one small, guided step at a time.
              No judgment, no waiting room.
            </p>

            <div className="mt-8">
              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-[#E2A83D] text-[#17241E] font-semibold hover:bg-[#D69A2C] transition-colors"
                >
                  Continue
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-[#E2A83D] text-[#17241E] font-semibold hover:bg-[#D69A2C] transition-colors"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>

          {/* Signature element: flip card */}
          <div className="flex-1 flex justify-center w-full max-w-sm [perspective:1200px]">
            <div className="group relative w-full h-56 [transform-style:preserve-3d] transition-transform duration-700 ease-out hover:[transform:rotateY(180deg)]">
              {/* Front: distorted thought */}
              <div className="absolute inset-0 rounded-2xl bg-white border border-[#D9D2C7] p-6 flex flex-col justify-between [backface-visibility:hidden] shadow-sm">
                <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#B9AFA4]">
                  The thought
                </span>
                <p className="text-lg leading-snug text-[#5B564D] line-through decoration-[#B9AFA4]">
                  &ldquo;I&apos;m never going to get this right.&rdquo;
                </p>
                <span className="text-xs text-[#B9AFA4]">hover to reframe →</span>
              </div>

              {/* Back: reframed thought */}
              <div className="absolute inset-0 rounded-2xl bg-[#3F7268] text-white p-6 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-sm">
                <span className="text-xs font-semibold tracking-[0.14em] uppercase text-[#CFE3DD]">
                  Reframed
                </span>
                <p className="text-lg leading-snug">
                  &ldquo;I&apos;m still learning this, and that&apos;s
                  allowed.&rdquo;
                </p>
                <span className="text-xs text-[#CFE3DD]">that&apos;s the idea</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quiet feature notes */}
        <section className="px-6 md:px-12 py-10 border-t border-[#D9E2DE]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm text-[#3E4A44]">
            <div className="border-l-2 border-[#3F7268] pl-4">
              Talk it through with a chatbot grounded in CBT.
            </div>
            <div className="border-l-2 border-[#3F7268] pl-4">
              Track your mood and see the shape of your week.
            </div>
            <div className="border-l-2 border-[#3F7268] pl-4">
              Get exercises that fit what you're actually feeling.
            </div>
          </div>
        </section>

        <footer className="px-6 md:px-12 py-6 text-xs text-[#7A8781]">
          Reframe-AI · built for students, not a replacement for real support
        </footer>
      </main>
    </div>
  );
}