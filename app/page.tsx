import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-acai-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-acai-800 tracking-tight">
            🫐 Degusty Açaí
          </h1>
          <p className="mt-2 text-slate-600">
            Controle operacional — estoque, vendas, gastos e clima
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            href="/dashboard"
            title="Dashboard"
            description="Visão geral do dia, metas e ponto de equilíbrio"
            emoji="📊"
          />
          <Card
            href="/estoque"
            title="Estoque"
            description="Ciclos de estoque, litros e custos"
            emoji="📦"
          />
          <Card
            href="/vendas"
            title="Vendas"
            description="Registro diário de copos e faturamento"
            emoji="💰"
          />
          <Card
            href="/gastos"
            title="Gastos"
            description="Despesas e situação financeira"
            emoji="🧾"
          />
          <Card
            href="/clima"
            title="Clima"
            description="Registro de temperatura e chuva"
            emoji="🌤️"
          />
          <Card
            href="/parametros"
            title="Parâmetros"
            description="Números fixos do negócio"
            emoji="⚙️"
          />
        </div>

        <footer className="mt-16 text-center text-sm text-slate-400">
          Degusty Açaí • App em evolução • Contexto no Notion
        </footer>
      </div>
    </main>
  );
}

function Card({
  href,
  title,
  description,
  emoji,
}: {
  href: string;
  title: string;
  description: string;
  emoji: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-acai-300 hover:shadow-md"
    >
      <div className="text-3xl mb-3">{emoji}</div>
      <h2 className="text-lg font-semibold text-slate-800 group-hover:text-acai-700">
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </Link>
  );
}
