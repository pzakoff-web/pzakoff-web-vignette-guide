import type { Lang } from "@/lib/i18n";

export function PrivacyView({ lang }: { lang: Lang }) {
  if (lang === "en") return (
    <main className="wrap prose">
      <h1>Privacy</h1>
      <p>We don't collect personal data and have no accounts. The route is calculated in your browser: the places you enter are sent to a place-search service (Photon by komoot, and Nominatim by OpenStreetMap) and to a routing service (OSRM), and the map is loaded from OpenStreetMap. These services see the request, not who you are.</p>
      <p>The site may show ads via Google AdSense. Google and its partners use cookies to show ads; you can manage them in <a href="https://adssettings.google.com" rel="noopener">Google Ad Settings</a>. Where required, you'll see a consent banner.</p>
      <p>We don't sell vignettes and receive no commission from their sale.</p>
    </main>
  );
  return (
    <main className="wrap prose">
      <h1>Поверителност</h1>
      <p>Не събираме лични данни и нямаме акаунти. Маршрутът се изчислява в браузъра ви: въведените места се изпращат към услуги за търсене на места (Photon на komoot и Nominatim на OpenStreetMap) и към услуга за маршрути (OSRM), а картата се зарежда от OpenStreetMap. Тези услуги виждат заявката, но не и кой сте.</p>
      <p>Сайтът може да показва реклами чрез Google AdSense. Google и партньорите му използват бисквитки за показване на реклами; можете да ги управлявате в <a href="https://adssettings.google.com" rel="noopener">настройките за реклами на Google</a>. Когато се изисква, ще видите банер за съгласие.</p>
      <p>Не продаваме винетки и не получаваме комисиона от продажбите им.</p>
    </main>
  );
}
