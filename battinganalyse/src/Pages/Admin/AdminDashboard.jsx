import React from "react";

const AdminDashboard = () => {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <header className="px-6 md:px-16 py-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </header>
      <main className="flex-grow px-6 md:px-16 py-10">
        <h2 className="text-2xl font-semibold mb-4">Welcome to the Admin Panel</h2>
        <p className="text-zinc-400">
          Here you can manage the platform, view analytics, and oversee user activities.
        </p>
        {/* Additional admin functionalities can be added here */}
      </main>
    </div>
  );
};

export default AdminDashboard;