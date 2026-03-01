import React from "react";

export default function About() {
  const ptSans = { fontFamily: "'PT Sans', sans-serif" };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col" style={ptSans}>
      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="px-6 md:px-16 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="text-[#42FF4E]">ProBat Insight</span>
          </h1>
          <p className="max-w-3xl mx-auto text-zinc-400 text-lg leading-relaxed">
            ProBat Insight is an AI-powered cricket analytics platform designed 
            to help players refine their batting technique using advanced pose 
            detection and angle-based analysis.
          </p>
        </section>

        {/* MISSION SECTION */}
        <section className="px-6 md:px-16 py-16 bg-[#0f0f0f]">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-[#42FF4E]">
                Our Mission
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Our mission is to bridge the gap between professional-level 
                cricket coaching and everyday players through intelligent AI analysis.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                We aim to provide instant, data-driven feedback that empowers 
                cricketers to continuously improve their technique and performance.
              </p>
            </div>

            <div className="bg-[#111] p-10 rounded-3xl border border-[#42FF4E]/20">
              <h3 className="text-xl font-bold mb-4 text-white">
                What Makes Us Different?
              </h3>
              <ul className="space-y-3 text-zinc-400">
                <li>✔ AI-based pose detection</li>
                <li>✔ Angle precision analysis</li>
                <li>✔ Instant performance feedback</li>
                <li>✔ Personalized improvement suggestions</li>
              </ul>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="px-6 md:px-16 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">
              How It <span className="text-[#42FF4E]">Works</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[#111] p-8 rounded-3xl border border-[#42FF4E]/20">
                <h3 className="text-xl font-bold mb-3 text-[#42FF4E]">1. Upload</h3>
                <p className="text-zinc-400">
                  Upload your cricket batting image or video for AI analysis.
                </p>
              </div>

              <div className="bg-[#111] p-8 rounded-3xl border border-[#42FF4E]/20">
                <h3 className="text-xl font-bold mb-3 text-[#42FF4E]">2. Analyze</h3>
                <p className="text-zinc-400">
                  Our AI detects body posture and calculates key angles.
                </p>
              </div>

              <div className="bg-[#111] p-8 rounded-3xl border border-[#42FF4E]/20">
                <h3 className="text-xl font-bold mb-3 text-[#42FF4E]">3. Improve</h3>
                <p className="text-zinc-400">
                  Receive actionable feedback to sharpen your technique.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}