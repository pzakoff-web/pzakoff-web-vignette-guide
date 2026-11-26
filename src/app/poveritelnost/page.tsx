import type { Metadata } from "next";
export const metadata: Metadata = { title: "Поверителност", alternates: { canonical: "/poveritelnost/" } };
export default function Privacy() {
  return (
    <main className="wrap prose">
      <h1>Поверителност</h1>
      <p>Не събираме лични данни и нямаме акаунти. Маршрутът се изчислява в браузъра ви: въведените места се изпращат към услуга за търсене на места (Photon, komoot) и към услуга за маршрути (OSRM), а картата се зарежда от OpenStreetMap. Тези услуги виждат заявката, но не и кой сте.</p>
      <p>Сайтът може да показва реклами чрез Google AdSense. Google и партньорите му използват бисквитки за показване на реклами; можете да ги управлявате в <a href="https://adssettings.google.com" rel="noopener">настройките за реклами на Google</a>. Когато се изисква, ще видите банер за съгласие.</p>
      <p>Не продаваме винетки и не получаваме комисиона от продажбите им.</p>
    </main>
  );
}
