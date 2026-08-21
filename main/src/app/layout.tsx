import type { Metadata } from "next"
import "./global.css"

export const metadata: Metadata = {
  title: "GeMUNi — Source-backed MUN Research",
  description:
    "AI-powered research reports for Model UN delegates, tailored to your country, committee, and agenda — with every claim traced to verified sources.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  )
}