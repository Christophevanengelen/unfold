// TODO: Replace placeholder App Store IDs before launch
// iOS: "id0000000000" → real App Store ID from Marie Ange
// Android: "app.unfold.momentum" → verify package name with Marie Ange
export function AppStoreBadges() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
      {/* App Store badge */}
      <a
        href="https://apps.apple.com/app/unfold-personal-timing/id0000000000"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-[52px] w-[168px] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
        aria-label="Download Unfold on the App Store"
      >
        {/* Apple logo — clean, standard mark */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 512"
          fill="currentColor"
          className="h-[22px] w-[18px] shrink-0"
        >
          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-27.1-46.5-42.5-82.5-46.1-33.6-3.5-70.1 20.2-83.7 20.2-14.3 0-46.4-19.1-71.9-18.5-40 .7-76.7 23.2-97.2 58.9-41.7 72.1-10.7 178.8 29.4 237.3 20.1 28.5 43.5 60.5 74.1 59.4 30.1-1.2 41.2-19.1 77.4-19.1 35.7 0 46.1 19.1 77.7 18.4 32.2-.5 52.5-28.5 72.2-57.1 13.3-19.4 23.2-39.5 28.2-50.7-1.2-.5-54.3-21.4-54.6-84.9zm-51.1-153.2C286.6 91.8 298.7 58 294.2 24c-29.2 1.8-63.5 20.1-83.5 44.1-18.2 21.5-34.7 56.3-29.8 89 32.3 2.4 65.4-16.9 85.7-43.6z" />
        </svg>
        <div className="text-left leading-tight">
          <span className="block text-[10px] font-normal tracking-wide opacity-70">Download on the</span>
          <span className="block text-[15px] font-semibold tracking-tight">App Store</span>
        </div>
      </a>

      {/* Google Play badge */}
      <a
        href="https://play.google.com/store/apps/details?id=app.unfold.momentum"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-[52px] w-[168px] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
        aria-label="Get Unfold on Google Play"
      >
        {/* Google Play triangle — clean, geometric */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          fill="currentColor"
          className="h-[22px] w-[20px] shrink-0"
        >
          <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
        </svg>
        <div className="text-left leading-tight">
          <span className="block text-[10px] font-normal tracking-wide opacity-70">GET IT ON</span>
          <span className="block text-[15px] font-semibold tracking-tight">Google Play</span>
        </div>
      </a>
    </div>
  );
}
