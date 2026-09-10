import Link from "next/link";
import MobileNav from "./components/MobileNav";

const screens = [
  ["/dashboard", "Dashboard", "Visão geral do dia, metas e ponto de equilíbrio", "01"],
  ["/estoque", "Estoque", "Produtos, quantidades e custos", "02"],
  ["/vendas", "Vendas", "Registro diário e faturamento", "03"],
  ["/gastos", "Gastos", "Despesas e resultado operacional", "04"],
  ["/clima", "Clima", "Condições do dia e histórico", "05"],
  ["/calendario", "Calendário", "Dias de trabalho, clima e planejamento de vendas", "06"],
  ["/parametros", "Parâmetros", "Configurações do negócio", "07"],
];

const weatherLabels: Record<number, { label: string; icon: string }> = {
  0: { label: "céu limpo", icon: "☀️" },
  1: { label: "poucas nuvens", icon: "🌤️" },
  2: { label: "parcialmente nublado", icon: "⛅" },
  3: { label: "nublado", icon: "☁️" },
  45: { label: "neblina", icon: "🌫️" },
  48: { label: "neblina", icon: "🌫️" },
  51: { label: "garoa", icon: "🌦️" },
  53: { label: "garoa", icon: "🌦️" },
  55: { label: "garoa", icon: "🌧️" },
  61: { label: "chuva leve", icon: "🌧️" },
  63: { label: "chuva", icon: "🌧️" },
  65: { label: "chuva forte", icon: "🌧️" },
  80: { label: "pancadas de chuva", icon: "🌦️" },
  81: { label: "pancadas de chuva", icon: "🌦️" },
  82: { label: "pancadas fortes", icon: "⛈️" },
  95: { label: "trovoada", icon: "⛈️" },
  96: { label: "trovoada", icon: "⛈️" },
  99: { label: "trovoada", icon: "⛈️" },
};

async function getWeather() {
  try {
    const params = new URLSearchParams({
      latitude: "-23.6639",
      longitude: "-46.5383",
      current: "temperature_2m,weather_code,is_day",
      timezone: "America/Sao_Paulo",
    });

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      next: { revalidate: 1800 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      temperature: Math.round(data.current.temperature_2m),
      code: data.current.weather_code as number,
      isDay: Boolean(data.current.is_day),
    };
  } catch {
    return null;
  }
}

function getGreeting(hour: number) {
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function Home() {
  const weather = await getWeather();
  const now = new Date();
  const hour = Number(
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      hour12: false,
    }).format(now),
  );
  const time = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
  const condition = weatherLabels[weather?.code ?? 0] ?? { label: "clima indisponível", icon: "☀️" };

  return (
    <main className="min-h-screen bg-slate-50 pb-24 sm:pb-0">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <header className="mb-10 sm:mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{time}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-900 sm:text-5xl">
            {getGreeting(hour)}, Gabriel.
          </h1>
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 sm:text-base">
            <span>{condition.icon}</span>
            <span className="capitalize">{condition.label}</span>
            {weather && <span>· {weather.temperature}°C em Santo André</span>}
          </div>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Estoque, vendas, gastos, clima e calendário em um único painel.
          </p>
        </header>
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {screens.map(([href, title, description, number]) => <Link key={href} href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 active:scale-[0.99] sm:p-6 sm:hover:-translate-y-0.5 sm:hover:shadow-md"><div className="flex items-start justify-between gap-4"><span className="text-xs font-medium tabular-nums text-slate-400">{number}</span><span className="text-sm text-slate-400 transition-transform group-hover:translate-x-0.5">↗</span></div><h2 className="mt-8 text-lg font-semibold tracking-[-0.02em] text-slate-900">{title}</h2><p className="mt-2 text-sm leading-5 text-slate-500">{description}</p></Link>)}
        </section>
        <footer className="mt-10 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:mt-14">Degusty Açaí · Painel operacional</footer>
      </div><MobileNav />
    </main>
  );
}
