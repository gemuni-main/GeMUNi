import type { Metadata } from "next"
import "./global.css"

export const metadata: Metadata = {
  title: "GeMUNi — AI Research Assistant for Model United Nations",
  description:
    "Gather verified research from trusted international organizations with AI-generated summaries and citations for every point.",
}

const themeInit = `
(function() {
  try {
    var stored = localStorage.getItem('gemuni-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  )
}