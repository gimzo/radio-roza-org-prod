import { shows } from '../data/shows';
import { stationDateAtNoonUTC, stationWeekday } from './time';

export type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

// Bez `frequency` emisija ide svaki tjedan.
export type Frequency =
  | { type: 'biweekly'; anchor: string } // "YYYY-MM-DD" — datum jednog emitiranja
  | { type: 'monthly'; weeks: number[] }; // 1–5 = n-ti taj dan u mjesecu, -1 = zadnji

// Raspored je mješavina glazbenih blokova i emisija. Blokove pokreće clockwheel i
// traju do sljedećeg bloka; emisije se ubacuju u queue preko bloka koji tada ide,
// kreću kad završi trenutna pjesma i traju okvirno `duration` minuta — nakon njih
// nastavlja isti blok. Unos s `duration` je emisija.
export interface Show {
  title: string;
  day: Day;
  show_start: string; // "HH:MM" 24-hour format
  frequency?: Frequency;
  duration?: number | [number, number]; // minute; raspon kad trajanje varira
  href?: string; // stranica emisije na /emisije
}

function parseTime(show_start: string): number {
  const [h, m] = show_start.split(':');
  return parseInt(h) * 60 + parseInt(m);
}

export const program: Show[] = [
  // { title: 'Bubanj i Bass', day: 'Sunday', show_start: '21:00' },
  { title: 'Chill Pill', day: 'Monday', show_start: '00:00' },
  { title: 'Chill Pill', day: 'Tuesday', show_start: '00:00' },
  { title: 'Chill Pill', day: 'Wednesday', show_start: '04:00' },
  { title: 'Chill Pill', day: 'Thursday', show_start: '04:00' },
  { title: 'Chill Pill', day: 'Sunday', show_start: '04:00' },
  {
    title: 'Da Cratez',
    day: 'Monday',
    show_start: '21:00',
    duration: 60,
    href: '/emisije/da-cratez',
  },
  {
    title: 'Depilacija',
    day: 'Sunday',
    show_start: '20:00',
    duration: 60,
    href: '/emisije/depilacija',
  },
  { title: 'Don Eladio', day: 'Tuesday', show_start: '11:00' },
  { title: 'Don Eladio', day: 'Sunday', show_start: '10:00' },
  { title: 'Dramorama', day: 'Thursday', show_start: '17:00', duration: 30 },
  {
    title: 'Fader',
    day: 'Friday',
    show_start: '20:00',
    frequency: { type: 'biweekly', anchor: '2026-09-11' },
    duration: 120,
    href: '/emisije/fader',
  },
  { title: 'Fjaka', day: 'Tuesday', show_start: '15:00' },
  { title: 'Fjaka', day: 'Thursday', show_start: '13:00' },
  { title: 'Fjaka', day: 'Friday', show_start: '11:00' },
  { title: 'Fjaka', day: 'Saturday', show_start: '08:00' },
  { title: 'Funkushima', day: 'Monday', show_start: '17:00' },
  { title: 'Funkushima', day: 'Tuesday', show_start: '19:00' },
  { title: 'Funkushima', day: 'Wednesday', show_start: '10:00' },
  { title: 'Funkushima', day: 'Friday', show_start: '13:00' },
  { title: 'Funkushima', day: 'Saturday', show_start: '14:00' },
  // { title: 'HEX.', day: 'Monday', show_start: '19:30' },
  {
    title: 'Izvorišta',
    day: 'Friday',
    show_start: '14:00',
    duration: 60,
    href: '/emisije/izvorista',
  },
  { title: 'Ja Biram', day: 'Tuesday', show_start: '23:00' },
  { title: 'Ja Biram', day: 'Saturday', show_start: '23:00' },
  { title: 'Kamenolom Dark', day: 'Thursday', show_start: '18:00' },
  { title: 'Kamenolom Dark', day: 'Saturday', show_start: '20:00' },
  { title: 'Kamenolom Light', day: 'Monday', show_start: '13:00' },
  { title: 'Kamenolom Light', day: 'Tuesday', show_start: '13:00' },
  { title: 'Kapuz', day: 'Tuesday', show_start: '08:00' },
  { title: 'Kapuz', day: 'Thursday', show_start: '10:00' },
  { title: 'Kapuz', day: 'Friday', show_start: '10:00' },
  { title: 'Kava sa šlagerom', day: 'Monday', show_start: '08:00' },
  { title: 'Kava sa šlagerom', day: 'Thursday', show_start: '08:00' },
  { title: 'Kava sa šlagerom', day: 'Friday', show_start: '08:00' },
  { title: 'Kuplung', day: 'Monday', show_start: '21:00' },
  { title: 'Kuplung', day: 'Wednesday', show_start: '00:00' },
  { title: 'Kuplung', day: 'Thursday', show_start: '00:00' },
  { title: 'Kuplung', day: 'Sunday', show_start: '23:00' },
  // { title: 'Mutant Disco', day: 'Monday', show_start: '21:00' },
  { title: 'Naftalina', day: 'Monday', show_start: '10:00', duration: 25 },
  { title: 'Naše Gore Riff - Electro', day: 'Wednesday', show_start: '23:00' },
  { title: 'Naše Gore Riff - Indie', day: 'Friday', show_start: '15:00' },
  { title: 'Naše Gore Riff - Indie', day: 'Saturday', show_start: '16:00' },
  { title: 'Naše Gore Riff - Ri Rock', day: 'Saturday', show_start: '21:00' },
  { title: 'Naše Gore Riff - Rock', day: 'Monday', show_start: '16:00' },
  { title: 'Naše Gore Riff - Rock', day: 'Thursday', show_start: '23:00' },
  { title: 'Okolo Naokolo - Afro', day: 'Tuesday', show_start: '17:00' },
  { title: 'Okolo Naokolo - Afro', day: 'Wednesday', show_start: '13:00' },
  { title: 'Okolo Naokolo - Afro', day: 'Sunday', show_start: '16:20' },
  { title: 'Okolo Naokolo - Istok', day: 'Thursday', show_start: '15:00' },
  {
    title: 'Pankeraj',
    day: 'Friday',
    show_start: '20:00',
    frequency: { type: 'biweekly', anchor: '2026-09-18' },
    duration: 120,
    href: '/emisije/pankeraj',
  },
  {
    title: 'Podzemna kulisa - Peperton specijal',
    day: 'Tuesday',
    show_start: '21:00',
    duration: 45,
  },
  { title: 'Potrensuljka', day: 'Saturday', show_start: '00:00' },
  { title: 'Ras Pashoy - Dubstep', day: 'Friday', show_start: '22:00' },
  { title: 'Ras Pashoy - Reggae/Dub', day: 'Wednesday', show_start: '16:00' },
  {
    title: 'Reality Check',
    day: 'Wednesday',
    show_start: '21:00',
    duration: [45, 60],
    href: '/emisije/reality-check',
  },
  { title: 'Ritmologija', day: 'Monday', show_start: '20:00' },
  { title: 'Ritmologija', day: 'Tuesday', show_start: '20:00' },
  { title: 'Ritmologija', day: 'Wednesday', show_start: '20:00' },
  { title: 'Ritmologija', day: 'Friday', show_start: '18:00' },
  { title: 'Ritmologija', day: 'Sunday', show_start: '12:00' },
  { title: 'Roža info', day: 'Thursday', show_start: '12:00', duration: 15 },
  { title: 'Space is the Place', day: 'Monday', show_start: '04:00' },
  { title: 'Space is the Place', day: 'Tuesday', show_start: '04:00' },
  { title: 'Space is the Place', day: 'Wednesday', show_start: '02:00' },
  { title: 'Space is the Place', day: 'Friday', show_start: '04:00' },
  { title: 'Space is the Place', day: 'Saturday', show_start: '06:00' },
  { title: 'Strujni Vod - Electro Breakbeat', day: 'Thursday', show_start: '00:00' },
  { title: 'Strujni Vod - Minimal House', day: 'Friday', show_start: '00:00' },
  { title: 'Strujni Vod - Techno', day: 'Sunday', show_start: '00:00' },
  // { title: 'Štošta', day: 'Saturday', show_start: '19:00', duration: 60, href: '/emisije/stosta' },
  { title: 'Yugofonija', day: 'Sunday', show_start: '18:00' },
];

export interface Block {
  title: string;
  description: string;
  tags: string[];
}

export const blocks: Block[] = [
  {
    title: 'Fjaka',
    description: 'Kad ti je život previše stresan, a krevet predaleko - sjedni i slušaj.',
    tags: ['Pop', 'Ambient', 'Jazz'],
  },
  {
    title: 'Kapuz',
    description: 'Kapuz svega ili maneštra, ponekada najbolje sjeda za odmor.',
    tags: ['Indie', 'R&B', 'Alt', 'Pop'],
  },
  {
    title: 'Kava sa šlagerom',
    description: 'Šlager hits koji idu uz jutarnju kavu - slatko i gorko.',
    tags: ['Šlager', 'Pop', 'Retro', 'Folk'],
  },
  {
    title: 'Kamenolom Light',
    description: 'Rock koji neće razbiti prozore, ali će razbuditi susjede. Odgovorno teškaštvo.',
    tags: ['Rock', 'Alternative', 'Indie Rock', 'Grunge'],
  },
  {
    title: 'Kamenolom Dark',
    description: 'Kad Light nije dovoljno - full metal jacket za uši. Nosači slušalica, oprez!',
    tags: ['Metal', 'Heavy Metal', 'Hard Rock', 'Doom', 'Sludge'],
  },
  {
    title: 'Naše Gore Riff - Ri Rock',
    description: 'Domaći rock koji lupa jače od rakije. Lokalpatriotska verzija.',
    tags: ['Rock', 'Domaći', 'Balkan', 'Alternative'],
  },
  {
    title: 'Naše Gore Riff - Indie',
    description: 'Indie zvukovi s naših prostora - alternativa alternativama, hipsterski approved.',
    tags: ['Indie', 'Alternative', 'Domaći', 'Lo-fi'],
  },
  {
    title: 'Naše Gore Riff - Electro',
    description: 'Kad rakija sretne sintetizator - električni Balkan za moderne nomade.',
    tags: ['Electro', 'Electronic', 'Balkan', 'Synth'],
  },
  {
    title: 'Naše Gore Riff - Rock',
    description: 'Domaći rock koji lupa jače od rakije. Balkanski riffovi bez granica.',
    tags: ['Rock', 'Hard Rock', 'Balkan', 'Domaći'],
  },
  {
    title: 'Don Eladio',
    description: 'Latino ritmovi po izboru našeg romantika Don Eladia.',
    tags: ['Latin', 'Cumbia', 'Bossa Nova', 'World Music'],
  },
  {
    title: 'Okolo Naokolo - Afro',
    description: 'Afrički ritmovi koji te tjeraju da plešeš, čak i kad misliš da ne znaš.',
    tags: ['Afrobeat', 'World Music', 'Funk', 'Rhythm'],
  },
  {
    title: 'Okolo Naokolo - Istok',
    description: 'Putovanje na Istok bez vize - od Balkana do Bliskog istoka zvukom.',
    tags: ['World Music', 'Balkan', 'Middle East', 'Folk', 'Ethno'],
  },
  {
    title: 'Funkushima',
    description: 'Radioaktivno funky - groove koji se ne zaustavlja, možda i zarazno.',
    tags: ['Funk', 'Groove', 'Soul', 'Disco'],
  },
  {
    title: 'Ritmologija',
    description: 'Znanstveno dokazano: ritam liječi. Doktor preporučuje bass i hi-hat.',
    tags: ['Electronic', 'Techno', 'House', 'Bass'],
  },
  {
    title: 'Kuplung',
    description: 'Glazba koja povezuje - kao dobar kuplung, sve ide glatko u pravom rhythm-u.',
    tags: ['Electronic', 'House', 'Disco', 'Funk'],
  },
  {
    title: 'Chill Pill',
    description: 'Audio sedativ za preživljavanje modernog života. Nuspojave: smirenost.',
    tags: ['Chillout', 'Ambient', 'Lo-fi', 'Downtempo'],
  },
  {
    title: 'Strujni Vod - Electro Breakbeat',
    description: 'Visokonaponski breakbeats - pazi, udara pod 220V groovea!',
    tags: ['Electro', 'Breakbeat', 'Electronic', 'Dance'],
  },
  {
    title: 'Strujni Vod - Techno',
    description: 'Tehno koji prolazi kroz žile kao električna struja - underground pure energy.',
    tags: ['Techno', 'Underground', 'Electronic', 'Industrial'],
  },
  {
    title: 'Strujni Vod - Minimal House',
    description: 'Manje je više, ali bass je dovoljno. Minimalistički hedonizam.',
    tags: ['Minimal', 'House', 'Electronic', 'Techno'],
  },
  {
    title: 'Potrensuljka',
    description: 'Glazba koja te trese kao dobar trening - cardio za uši, workout za dušu.',
    tags: ['Electronic', 'Dance', 'Bass', 'Energetic'],
  },
  {
    title: 'Space is the Place',
    description: 'Cosmic sounds za zemaljske bića - Houston, imamo funky problem!',
    tags: ['Jazz', 'Cosmic', 'Experimental', 'Ambient', 'Avant-garde'],
  },
  {
    title: 'Ras Pashoy - Reggae/Dub',
    description: 'One love, heavy bass - Jah blagoslovio ovaj soundsystem.',
    tags: ['Reggae', 'Dub', 'Roots', 'Bass'],
  },
  {
    title: 'Ras Pashoy - Dubstep',
    description: 'Kad dub sretne 2010-e - reggae roots sa sub-bass terapijom.',
    tags: ['Dubstep', 'Dub', 'Bass', 'Electronic'],
  },
  {
    title: 'Izvorišta',
    description: 'Povratak korijenima - tradicijski zvukovi koji te vezuju za zemlju i predke.',
    tags: ['Folk', 'Traditional', 'World Music', 'Ethno'],
  },
  {
    title: 'Depilacija',
    description: 'Glazba koja skida dlake i inhibicije - raw energy bez cenzure.',
    tags: ['Punk', 'Noise', 'Experimental', 'Raw', 'Post-punk'],
  },
  {
    title: 'Roža info',
    description: 'Sve što trebaš znati, a nisi znao da trebaš - informacije začinjene muzikom.',
    tags: ['Talk', 'Info', 'News', 'Culture'],
  },
  {
    title: 'Yugofonija',
    description: 'Nostalgija na vinilu - kad je Balkan bio jedan, a glazba bila zajednička.',
    tags: ['Retro', 'Yugo', 'Nostalgia', 'Pop', 'Rock'],
  },
  {
    title: 'Ja Biram',
    description: 'Demokracija na radiju - ti biraš, mi puštamo, svi uživamo.',
    tags: ['Mixed', 'Listener Request', 'Varied', 'Interactive'],
  },
  {
    title: 'Dramorama',
    description: 'Teatar za uši - kad riječi postaju glazba, a glazba postaje priča.',
    tags: ['Spoken Word', 'Theater', 'Culture', 'Storytelling'],
  },
  {
    title: 'Mutant Disco',
    description: 'Disco koji je mutirao u nešto bolje - evolucija plesa kroz zvuk.',
    tags: ['Disco', 'Funk', 'Post-Disco', 'Dance'],
  },
  {
    title: 'Bubanj i Bass',
    description: 'Dva najbolja prijatelja zvuka - jednostavno i nezaustavljivo.',
    tags: ['Drum & Bass', 'Electronic', 'Bass', 'Jungle'],
  },
  {
    title: 'HEX.',
    description:
      'Heavy and experimental donosi upravo takvu muziku. Radiofoničnost nije zagarantirana.',
    tags: ['Rock', 'Metal', 'Experimental'],
  },
  {
    title: 'Naftalina',
    description: 'Vintage vibes u režiji Sandra Bačića - staro zlato koje nikad ne izlazi iz mode.',
    tags: ['Oldies', 'Retro', 'Nostalgia', 'Vintage'],
  },
  {
    title: 'Fader',
    description:
      'Throwback iskopi, promocija novih singlova, vijesti, gosti, intervjui i 60 minutni mixevi za kraj emisije.',
    tags: ['DJ', 'Electronic', 'Mix', 'Dance', 'House'],
  },
  {
    title: 'Štošta',
    description: 'Kad ne znaš što očekivati, ali znaš da će biti dobro - audio rulet.',
    tags: ['Eclectic', 'Mixed', 'Varied', 'Surprise'],
  },
  {
    title: 'Reality Check',
    description: 'Provjera stvarnosti domaće scene po odabiru Dubravka Jagatića.',
    tags: ['Electronic', 'Hip-Hop', 'Alternative', 'Bass'],
  },
  {
    title: 'Podzemna kulisa - Peperton specijal',
    description:
      'Domaća underground scena je živa, Peperton vam donosi ono najnovije što nećete čuti na komercijalnim radijima.',
    tags: ['Underground', 'Alternative', 'Culture', 'Indie'],
  },
];

const DAYS_OF_WEEK: Day[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function parseMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function isInsert(show: Show): boolean {
  return show.duration !== undefined;
}

/** Najdulje okvirno trajanje emisije u minutama (0 za blokove). */
export function maxDuration(show: Show): number {
  const d = show.duration;
  return d === undefined ? 0 : Array.isArray(d) ? d[1] : d;
}

function fmtDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = min / 60;
  return `${Number.isInteger(h) ? h : h.toFixed(1).replace('.', ',')} h`;
}

/** "15 min", "2 h", "45–60 min" */
export function durationLabel(show: Show): string | null {
  const d = show.duration;
  if (d === undefined) return null;
  if (!Array.isArray(d)) return fmtDuration(d);
  const [a, b] = d;
  return a < 60 && b <= 60 ? `${a}–${b} min` : `${fmtDuration(a)} – ${fmtDuration(b)}`;
}

/** "~12:00" za emisije — kreću kad završi pjesma koja se tada vrti. */
export function startLabel(show: Show): string {
  return isInsert(show) ? `~${show.show_start}` : show.show_start;
}

/** Opis i tagovi: emisije sa stranicom uzimaju ih odande, ostalo iz `blocks`. */
export function showInfo(show: Show): { description: string; tags: string[] } | null {
  const page = show.href ? shows.find((s) => s.href === show.href) : undefined;
  if (page?.description) return { description: page.description, tags: page.tags };
  const block = blocks.find((b) => b.title === show.title);
  return block ? { description: block.description, tags: block.tags } : null;
}

/**
 * Što je u eteru u `minutes` (minute od ponoći) iz liste emisija koje taj dan idu:
 * emisija dok okvirno traje, inače zadnji započeti blok.
 */
export function currentEntry(dayShows: Show[], minutes: number): Show | null {
  const started = dayShows
    .filter((s) => parseMinutes(s.show_start) <= minutes)
    .sort((a, b) => parseMinutes(a.show_start) - parseMinutes(b.show_start));
  return (
    started.findLast((s) => isInsert(s) && minutes < parseMinutes(s.show_start) + maxDuration(s)) ??
    started.findLast((s) => !isInsert(s)) ??
    null
  );
}

/**
 * Ide li emisija na zadani datum (po vremenu studija). Za povremene emisije
 * provjerava tjedan; `date` može biti bilo koji trenutak tog dana.
 */
export function airsOn(show: Show, date: Date): boolean {
  if (stationWeekday(date) !== show.day) return false;
  const f = show.frequency;
  if (!f) return true;

  const day = stationDateAtNoonUTC(date);

  if (f.type === 'biweekly') {
    const anchor = new Date(`${f.anchor}T12:00:00Z`);
    const days = Math.round((day.getTime() - anchor.getTime()) / 86_400_000);
    return days % 14 === 0;
  }

  const d = day.getUTCDate();
  const daysInMonth = new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth() + 1, 0)
  ).getUTCDate();
  return f.weeks.includes(Math.ceil(d / 7)) || (d + 7 > daysInMonth && f.weeks.includes(-1));
}

export const sortedByDay: Show[] = [...program].sort((a, b) => a.day.localeCompare(b.day));

export function getProgramOnWeekday(day: Day): Show[] {
  return program.filter((show) => show.day === day);
}

export function getCurrentShow(): (Show & { startTimeMinutes: number }) | null {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }) as Day;
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const todayProgram = getProgramOnWeekday(currentDay);
  if (!todayProgram.length) return null;

  const startedShows = todayProgram
    .map((show) => ({ ...show, startTimeMinutes: parseTime(show.show_start) }))
    .filter((show) => show.startTimeMinutes <= currentTime)
    .sort((a, b) => b.startTimeMinutes - a.startTimeMinutes);

  return startedShows[0] ?? null;
}

export function getNextShow(): (Show & { startTimeMinutes: number }) | null {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }) as Day;
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const currentDayIndex = DAYS_OF_WEEK.indexOf(currentDay);

  const todayUpcoming = getProgramOnWeekday(currentDay)
    .map((show) => ({ ...show, startTimeMinutes: parseTime(show.show_start) }))
    .filter((show) => show.startTimeMinutes > currentTime)
    .sort((a, b) => a.startTimeMinutes - b.startTimeMinutes);

  if (todayUpcoming.length > 0) return todayUpcoming[0];

  for (let i = 1; i <= 7; i++) {
    const nextDay = DAYS_OF_WEEK[(currentDayIndex + i) % 7];
    const nextDayProgram = getProgramOnWeekday(nextDay);

    if (nextDayProgram.length > 0) {
      return nextDayProgram
        .map((show) => ({ ...show, startTimeMinutes: parseTime(show.show_start) }))
        .sort((a, b) => a.startTimeMinutes - b.startTimeMinutes)[0];
    }
  }

  return null;
}
