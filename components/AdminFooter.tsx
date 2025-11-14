export default function AdminFooter() {
  return (
    <footer className="w-full bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-xs sm:text-sm opacity-80">
          © {new Date().getFullYear()} PlanGenie. All rights reserved.
        </div>
        <div className="text-xs opacity-60">
          Admin Console
        </div>
      </div>
    </footer>
  );
}

