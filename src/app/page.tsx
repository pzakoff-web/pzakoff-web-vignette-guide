import Link from "next/link";
import Planner from "@/components/Planner";
import { COUNTRIES } from "@/data/countries";
import { fmt } from "@/lib/dates";

const SCAM_FAQ = [
  { q: "Как да разпозная фалшив сайт за винетки?", a: "Официалните сайтове са на държавни домейни или на държавния пътен оператор: shop.asfinag.at (Австрия), via.admin.ch (Швейцария), edalnice.gov.cz (Чехия), eznamka.sk (Словакия), ematrica.nemzetiutdij.hu (Унгария), etoll.ro (Румъния), web.bgtoll.bg (България). Сайтове с имена като „official-vignette“, „e-vinjeta“ или „vignette-online“ обикновено са посредници, които добавят такси." },
  { q: "Незаконни ли са посредниците?", a: "Не винаги — в Швейцария например посредниците имат право на надценка, ако ясно се представят като независими. Но плащате повече за същото. Унгарският оператор официално предупреждава (22.09.2026) за сайтове, които купуват винетката от свое име, препродават я с неизгоден курс и понякога с грешен срок." },
  { q: "Купих от посредник. Валидна ли е винетката ми?", a: "Проверете по регистрационния номер на официалния сайт — например Унгария и Чехия имат безплатна проверка. Ако я няма, свържете се с банката си за оспорване на плащането." },
  { q: "Защо австрийската ми годишна винетка не важи?", a: "Купени онлайн от физическо лице, двумесечната и годишната винетка в Австрия важат чак от 18-ия ден след покупката. Еднодневната и 10-дневната важат веднага, а стикерът от пункт за продажба — също веднага." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: SCAM_FAQ.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function Home() {
  const vign = COUNTRIES.filter(c => c.products?.length);
  const tolls = COUNTRIES.filter(c => !c.products?.length);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="hero">
        <div className="wrap">
          <h1>Кои винетки ми трябват?</h1>
          <p className="lead">Въведете маршрута и датите. Ще ви кажем кои винетки и такси ви трябват, за какъв срок е най-евтино и къде да ги купите — <b>само от официалните държавни сайтове</b>, без посредници и надценки.</p>
        </div>
      </section>
      <main className="wrap">
        <Planner />

        <section id="darzhavi" className="block">
          <h2>Винетки по държави</h2>
          <div className="grid-c">
            {vign.map(c => (
              <Link key={c.code} href={`/${c.slug}/`} className="card country">
                <span className="flag" aria-hidden>{c.flag}</span>
                <span><b>{c.name}</b><span className="muted small">{c.status === "unverified" ? "за проверка" : `проверено ${fmt(c.checkedAt)}`}</span></span>
              </Link>
            ))}
          </div>
          <h3>Тол такси и мостове</h3>
          <div className="grid-c">
            {tolls.map(c => (
              <Link key={c.code} href={`/${c.slug}/`} className="card country">
                <span className="flag" aria-hidden>{c.flag}</span>
                <span><b>{c.name}</b><span className="muted small">{c.system === "none" ? "без такса за коли" : "такса по участъци"}</span></span>
              </Link>
            ))}
          </div>
        </section>

        <section id="izmami" className="block prose">
          <h2>Как да не платите повече за винетка</h2>
          {SCAM_FAQ.map(f => (
            <details key={f.q} className="faq"><summary>{f.q}</summary><p>{f.a}</p></details>
          ))}
        </section>
      </main>
    </>
  );
}
