export type NewsItem = {
  date: string;
  title: string;
  blurb: string;
  tag: string;
};

export const newsItems: readonly NewsItem[] = [
  { date: "2026-05", title: "qFund in New York", blurb: "Meetings with investors and strategic partners across the New York Deep Tech ecosystem.", tag: "Ecosystem" },
  { date: "2026-04", title: "Israel Tech Week, Miami", blurb: "qFund joined Israel Tech Week in Miami, connecting Israeli-related Deep Tech founders with US partners.", tag: "Ecosystem" },
  { date: "2025-11", title: "VC delegation to Korea", blurb: "qFund led a venture delegation to Korea, opening strategic and industrial channels for portfolio companies.", tag: "Delegation" },
  { date: "2025-11", title: "VC delegation to Japan", blurb: "qFund led a venture delegation to Japan, building partner and customer access in advanced industry and electronics.", tag: "Delegation" },
];

export function formatNewsDate(date: string) {
  const [year, month] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}
