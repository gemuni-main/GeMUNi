import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/scroll-area"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <section className="hero">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Research smarter. Debate stronger.
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-xl mb-8">
                GeMUNi produces source-backed MUN research tailored to your country,
                committee, and agenda. Every claim is traced to verified sources,
                so you can debate with confidence.
              </p>
              <div className="flex flex-col sm-flex-row gap-4 mb-6">
                <Link href="/dashboard" className="btn btn-primary">
                  Start Research
                </Link>
                <Link href="#features" className="btn btn-outline">
                  Explore Features
                </Link>
              </div>
            </div>
            <Image
              src="/placeholder-hero.svg"
              alt="GeMUNi research platform"
              width={500}
              height={400}
              className="rounded-xl border opacity-80"
            />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">The Research Process</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🌍</div>
              <h3>Choose Country</h3>
              <p>Select your assigned nation and understand its position.</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🏛️</div>
              <h3>Choose Committee</h3>
              <p>Pick your committee and understand its mandate.</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3>Choose Agenda</h3>
              <p>Select the topic you'll debate.</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3>Generate Research</h3>
              <p>AI produces a source-backed research report.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Source Hierarchy & Trust
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 border rounded-lg">
              <div className="text-4xl mb-2">★★★★★</div>
              <div className="font-bold">UN / Official Government</div>
              <p className="text-sm text-muted-foreground">
                Highest authority, official positions and statements.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <div className="text-4xl mb-2">★★★★☆</div>
              <div className="font-bold">International Organization</div>
              <p className="text-sm text-muted-foreground">
                IO such as WHO, UNEP, UNICEF.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <div className="text-4xl mb-2">★★★☆☆</div>
              <div className="font-bold">NGO</div>
              <p className="text-sm text-muted-foreground">
                Non-governmental organizations and advocacy groups.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <div className="text-4xl mb-2">★★★☆☆</div>
              <div className="font-bold">Academic</div>
              <p className="text-sm text-muted-foreground">
                Peer-reviewed research and scholarly articles.
              </p>
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Sources are retrieved, associated with claims, and validated for
            correctness before being presented.
          </p>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">AI Research Reports</h3>
              <p className="text-muted-foreground">
                Generate comprehensive research reports with automated citation
                generation and validation.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Source-Backed Claims</h3>
              <p className="text-muted-foreground">
                Every factual claim is tied to a verified source with full metadata.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Citation Verification</h3>
              <p className="text-muted-foreground">
                Each citation is validated against source evidence. Invalid citations
                are flagged or regenerated.
              </p>
            </Card>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">MUN-Specific Tailoring</h3>
              <p className="text-muted-foreground">
                Reports are tailored to your country's diplomatic position, committee
                procedures, and agenda specifics.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Grounded AI Chat</h3>
              <p className="text-muted-foreground">
                Ask questions about your research and receive answers grounded in
                your saved sources and report.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Saved Projects</h3>
              <p className="text-muted-foreground">
                Store and revisit your research. Projects are private and belong
                exclusively to you.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}