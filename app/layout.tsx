import type { Metadata } from "next";
import { Jost, Space_Mono, Zilla_Slab } from "next/font/google";
import { getTheme } from "@/lib/theme";
import { themeToStyle } from "@/lib/theme-tokens";
import { SITE } from "@/lib/site";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const zillaSlab = Zilla_Slab({
  variable: "--font-zilla-slab",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: {default: SITE.name, template: `%s | ${SITE.name}`},
  description: SITE.description,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme = await getTheme();

  return (
    <html
      lang="en"
      className={`${jost.variable} ${spaceMono.variable} ${zillaSlab.variable} h-full antialiased`}
      style={themeToStyle(theme)}
    >
      <body className="min-h-full flex flex-col bg-background text-text-primary font-serif">
        {children}
      </body>
    </html>
  );
}
