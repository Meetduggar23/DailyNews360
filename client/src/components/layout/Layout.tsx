import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { BackToTop } from "@/components/common/BackToTop";
import { ReadingLens } from "@/components/reading-lens/ReadingLens";
import { useThemeStore } from "@/stores/theme.store";

function OfflineBanner() {
  const [offline, setOffline] = React.useState(
    () => typeof window !== "undefined" && !window.navigator.onLine,
  );

  React.useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="bg-accent px-4 py-1.5 text-center font-sans text-xs font-semibold uppercase tracking-wide text-white">
      You&rsquo;re offline — showing the latest cached stories.
    </div>
  );
}

export function Layout() {
  const location = useLocation();
  const init = useThemeStore((state) => state.init);

  React.useEffect(() => {
    init();
  }, [init]);

  // Scroll to top on route change; to hash targets when one is present.
  React.useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname, location.hash]);

  return (
    <div className="flex min-h-screen flex-col">
      <OfflineBanner />
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-1 pb-16 lg:pb-0"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
      <MobileNav />
      <BackToTop />
      <ReadingLens />
    </div>
  );
}