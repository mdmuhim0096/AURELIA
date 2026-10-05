import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";

import AppProviders from "@/components/providers/AppProviders";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchOverlay from "@/components/layout/SearchOverlay";
import MotionSystem from "@/components/experience/MotionSystem";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000"
  ),

  title: {
    default: `${APP_NAME} — Premium Commerce`,
    template: `%s | ${APP_NAME}`,
  },

  description:
    "A premium, performance-first commerce experience.",

  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description:
      "Premium commerce, engineered for speed.",
  },

  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
    >
      <body>
        <AppRouterCacheProvider
          options={{
            enableCssLayer: true,
          }}
        >
          <AppProviders>
            <Header />

            <SearchOverlay />

            <MotionSystem />

            <main>{children}</main>

            <Footer />
          </AppProviders>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}