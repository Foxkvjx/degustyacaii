"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MobileNav from "../components/MobileNav";
import { supabase } from "../../lib/supabase";
import { ChevronLeft, ChevronRight, Download, ExternalLink, MapPin, RefreshCw, Sun, ThermometerSun, Umbrella } from "lucide-react";

type Event = { id: string; work_date: string; title: string; location: string | null; notes: string | null };
type WeatherDay = { date: string; max: number; min: number; rain: number; rainProb: number; wind: number; code: number };
type Place = { name: string; lat: number; lon: number };

const places: Place[] = [
  { name: "Rio Grande da Serra", lat: -23.7446, lon: -46.3983 },
  { name: "Santo André", lat: -23.6639, lon: -46.5383 },
];
const monthNames = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const weekdays = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const pretty = (s: string) => new Date(`${s}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

function weatherStatus(w?: WeatherDay) {
  if (!w) return { label: "Sem previsão", tone: "bg-slate-100 text-slate-500", dot: "bg-slate-300" };
  if (w.rain >= 5 || w.rainProb >= 60 || w.wind >= 35 || w.max >= 35 || w.max <= 14) return { label: "Ruim", tone: "bg-red-100 text-red-700", dot: "bg-red-500" };
  if (w.rain >= 1 || w.rainProb >= 30 || w.wind >= 25 || w.max >= 32 || w.max <= 17) return { label: "Ameno", tone: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-500" };
  return { label: "Bom", tone: "bg-green-100 text-green-700", dot: "bg-green-500" };
}
function weatherText(code: number) {
  if (code >= 95) return "Trovoada";
  if (code >= 80) return "Pancadas de chuva";
  if (code >= 61) return "Chuva";
  if (code >= 51) return "Garoa";
  if (code >= 45) return "Neblina";
  if (code >= 3) return "Nublado";
  if (code >= 1) return "Parcialmente nublado";
  return "Ensolarado";
}

export default function Calendario() {
  const now = new Date();
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [events, setEvents] = useState<Event[]>([]);
  const [weather, setWeather] = useState<WeatherDay[]>([]);
  const [place, setPlace] = useState(places[0]);
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState(key(now));

  async function loadEvents() {
    const { data, error } = await supabase.from("work_calendar_events").select("id,work_date,title,location,notes").order("work_date", { ascending: true });
    if (error) setError(error.message); else setEvents((data ?? []) as Event[]);
    setLoading(false);
  }
  async function loadWeather() {
    setWeatherLoading(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=America%2FSao_Paulo&forecast_days=16`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Não foi possível atualizar a previsão.");
      const data = await res.json();
      setWeather(data.daily.time.map((date: string, i: number) => ({ date, max: data.daily.temperature_2m_max[i], min: data.daily.temperature_2m_min[i], rain: data.daily.precipitation_sum[i], rainProb: data.daily.precipitation_probability_max[i], wind: data.daily.wind_speed_10m_max[i], code: data.daily.weather_code[i] })));
    } catch (e) { setError(e instanceof Error ? e.message : "Erro ao carregar previsão."); }
    setWeatherLoading(false);
  }
  useEffect(() => { loadEvents(); }, []);
  useEffect(() => { loadWeather(); }, [place]);

  const weatherMap = useMemo(() => new Map(weather.map(w => [w.date, w])), [weather]);
  const eventMap = useMemo(() => new Map(events.map(e => [e.work_date, e])), [events]);
  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first); start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  }, [month]);
  const selectedWeather = weatherMap.get(selected);
  const selectedEvent = eventMap.get(selected);

  async function toggleWork(date: string) {
    setError(null);
    const existing = eventMap.get(date);
    if (existing) {
      const { error } = await supabase.from("work_calendar_events").delete().eq("id", existing.id);
      if (error) setError(error.message); else setEvents(v => v.filter(e => e.id !== existing.id));
    } else {
      const { data, error } = await supabase.from("work_calendar_events").insert({ work_date: date, title: "Trabalho / Venda", location: place.name }).select("id,work_date,title,location,notes").single();
      if (error) setError(error.message); else if (data) setEvents(v => [...v, data as Event].sort((a,b) => a.work_date.localeCompare(b.work_date)));
    }
  }

  function exportIcs() {
    const body = events.map(e => `BEGIN:VEVENT\nUID:${e.id}@degustyacai\nDTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").replace(/\\.\\d{3}/,"")}\nDTSTART;VALUE=DATE:${e.work_date.replace(/-/g,"")}\nSUMMARY:${e.title}\nLOCATION:${e.location ?? ""}\nEND:VEVENT`).join("\n");
    const blob = new Blob([`BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Degusty Acai//Calendario//PT-BR\nCALSCALE:GREGORIAN\n${body}\nEND:VCALENDAR`], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "degusty-calendario.ics"; a.click(); URL.revokeObjectURL(url);
  }

  function googleEvent() {
    const start = `${selected.replace(/-/g,"")}T100000`; const end = `${selected.replace(/-/g,"")}T180000`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(selectedEvent?.title ?? "Trabalho / Venda - Degusty Açaí")}&dates=${start}/${end}&location=${encodeURIComponent(selectedEvent?.location ?? place.name)}&details=${encodeURIComponent("Planejamento de trabalho/venda pelo Degusty Açaí")}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return <main className="min-h-screen bg-slate-50 pb-24 sm:pb-0"><div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
    <Link href="/" className="text-sm text-slate-500">← Início</Link>
    <header className="mt-4 flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-400">Planejamento</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Calendário</h1><p className="mt-1 text-sm text-slate-500">Dias de trabalho, clima e planejamento de vendas.</p></div><button onClick={loadWeather} disabled={weatherLoading} className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black" aria-label="Atualizar previsão"><RefreshCw size={17} className={weatherLoading ? "animate-spin" : ""}/></button></header>
    {error && <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    <section className="mt-5 flex flex-wrap items-center gap-2"><MapPin size={16} className="text-slate-400"/><select value={place.name} onChange={e => setPlace(places.find(p => p.name === e.target.value) ?? places[0])} className="rounded-xl bg-white px-3 py-2 text-sm"><option>Rio Grande da Serra</option><option>Santo André</option></select><span className="text-xs text-slate-400">Previsão para até 16 dias</span></section>
    <section className="mt-5 rounded-[28px] bg-white p-4 shadow-sm sm:p-6"><div className="flex items-center justify-between gap-3"><button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()-1, 1))} className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100" aria-label="Mês anterior"><ChevronLeft size={18}/></button><div className="text-center"><h2 className="text-lg font-semibold capitalize">{monthNames[month.getMonth()]} {month.getFullYear()}</h2><p className="mt-1 text-xs text-slate-400">Toque no dia para selecionar ou marcar trabalho</p></div><button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()+1, 1))} className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100" aria-label="Próximo mês"><ChevronRight size={18}/></button></div>
      <div className="mt-5 grid grid-cols-7 gap-1">{weekdays.map(d=><div key={d} className="py-2 text-center text-[10px] font-semibold uppercase text-slate-400">{d}</div>)}{cells.map(d=>{const date=key(d), inside=d.getMonth()===month.getMonth(), w=weatherMap.get(date), status=weatherStatus(w), ev=eventMap.get(date), active=selected===date;return <button key={date} type="button" onClick={()=>{setSelected(date); toggleWork(date);}} title={w ? `${weatherText(w.code)} · ${w.max}°C · chuva ${w.rainProb}%` : "Sem previsão"} className={`relative min-h-[74px] rounded-xl p-2 text-left transition sm:min-h-[92px] ${inside?"":"opacity-35"} ${active?"ring-2 ring-black dark:ring-white":""} ${status.tone}`}><span className="text-xs font-semibold">{d.getDate()}</span>{w&&<><span className={`absolute right-2 top-2 h-2 w-2 rounded-full ${status.dot}`}/><span className="mt-4 block text-[10px] font-medium">{w.max}° / {w.min}°</span><span className="mt-1 block truncate text-[9px] opacity-70">{status.label}</span></>}{ev&&<span className="absolute bottom-2 left-2 rounded-md bg-black px-1.5 py-0.5 text-[9px] font-semibold text-white dark:bg-white dark:text-black">TRABALHO</span>}</button>})}</div>
    </section>
    <section className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-green-50 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-green-700"><Sun size={17}/>Bom para vender</div><p className="mt-1 text-xs text-green-700/70">Pouca chuva, temperatura favorável e vento controlado.</p></div><div className="rounded-2xl bg-yellow-50 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-yellow-800"><ThermometerSun size={17}/>Ameno</div><p className="mt-1 text-xs text-yellow-800/70">Condição intermediária. Vale avaliar o movimento.</p></div><div className="rounded-2xl bg-red-50 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-red-700"><Umbrella size={17}/>Ruim para vender</div><p className="mt-1 text-xs text-red-700/70">Chuva, vento forte ou temperatura pouco favorável.</p></div></section>
    <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-slate-400">Dia selecionado</p><h2 className="mt-1 text-lg font-semibold capitalize">{pretty(selected)}</h2>{selectedWeather ? <p className="mt-1 text-sm text-slate-500">{weatherText(selectedWeather.code)} · {selectedWeather.max}°C / {selectedWeather.min}°C · chuva {selectedWeather.rainProb}%</p> : <p className="mt-1 text-sm text-slate-500">A previsão ainda não está disponível para este dia.</p>}</div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${weatherStatus(selectedWeather).tone}`}>{weatherStatus(selectedWeather).label}</span></div><div className="mt-4 flex flex-wrap gap-2"><button onClick={()=>toggleWork(selected)} className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-black">{selectedEvent ? "Desmarcar trabalho" : "Marcar como trabalho"}</button><button onClick={exportIcs} disabled={!events.length} className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold disabled:opacity-40"><Download size={16}/>Exportar calendário</button><button onClick={googleEvent} className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold"><ExternalLink size={16}/>Abrir no Google Calendar</button></div><p className="mt-3 text-xs text-slate-400">As marcações ficam salvas no Supabase. O Google Calendar é aberto para adicionar o dia ao seu calendário pessoal.</p></section>
  </div><MobileNav/></main>;
}
