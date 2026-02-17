import React from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-green-700">
          AI Cricket Coach
        </h1>

        <div className="space-x-4">
          <button className="px-4 py-2 text-green-700 font-medium">
            Login
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Intelligent AI System for Cricket Skill Development
        </h2>

        <p className="max-w-2xl text-lg text-gray-600 mb-8">
          Analyze batting techniques using angle-based computer vision.
          Get personalized feedback and practice drills to improve your
          cricket performance.
        </p>

        <div className="flex gap-4">
          <button className="px-6 py-3 bg-green-600 text-white rounded-2xl text-lg font-semibold hover:bg-green-700 transition">
            Get Started
          </button>

          <button className="px-6 py-3 border border-green-600 text-green-700 rounded-2xl text-lg font-semibold hover:bg-green-50 transition">
            Learn More
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-semibold mb-2">
              Pose Detection
            </h3>
            <p className="text-gray-600">
              Detect key body and bat positions using computer vision.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-semibold mb-2">
              Angle Analysis
            </h3>
            <p className="text-gray-600">
              Identify technical mistakes with precise angle measurements.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-semibold mb-2">
              Personalized Drills
            </h3>
            <p className="text-gray-600">
              Get custom practice drills to improve batting performance.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 bg-white border-t">
        <p className="text-gray-500">
          © 2026 AI Cricket Skill Development System
        </p>
      </footer>
    </div>
  );
}