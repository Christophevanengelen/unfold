export function AppStoreBadges() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
      {/* App Store badge */}
      <a
        href="#"
        className="glass-btn flex h-14 w-44 items-center justify-center rounded-xl text-white"
        aria-label="Download on the App Store"
      >
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83" />
          </svg>
          <div className="text-left text-xs leading-tight">
            <span className="block text-[10px] opacity-80">Download on the</span>
            <span className="block text-base font-semibold">App Store</span>
          </div>
        </div>
      </a>
      {/* Google Play badge */}
      <a
        href="#"
        className="glass-btn flex h-14 w-44 items-center justify-center rounded-xl text-white"
        aria-label="Get it on Google Play"
      >
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path d="M3 20.5V3.5c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm.91-.91L19.59 12l-1.87-2.21-2.27 2.27 2.27 2.15zM6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z" />
          </svg>
          <div className="text-left text-xs leading-tight">
            <span className="block text-[10px] opacity-80">GET IT ON</span>
            <span className="block text-base font-semibold">Google Play</span>
          </div>
        </div>
      </a>
    </div>
  );
}
