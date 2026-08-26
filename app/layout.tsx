import type { Metadata } from "next";
import { Bodoni_Moda } from "next/font/google";
import { Syne_Mono } from "next/font/google";
import { Special_Elite } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import { ThemeProvider } from "./components/ThemeProvider";
import { HeaderFadeIn } from "./components/Header/HeaderFadeIn";
import { BackgroundVideo } from "./components/Home/BackgroundVideo";
//import Script from "next/script";

const special_elite = Special_Elite({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-special_elite",
});

const syne_mono = Syne_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-syne_mono",
});

const bodoni_moda = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-bodoni_moda",
});

export const metadata: Metadata = {
  title: "SOCIETY.",
  description: "Uplifting culture through art and technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={syne_mono.variable} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/obq2ovg.css" />
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PHGVNLN7');
            `,
          }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=GTM-PHGVNLN7`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <ThemeProvider>
          <BackgroundVideo />
          <HeaderFadeIn />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
