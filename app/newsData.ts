export type NewsItem = {
  date: string;
  title: string;
  blurb: string;
  tag: string;
  artwork: "new-york" | "miami" | "korea" | "japan";
};

export const newsItems: readonly NewsItem[] = [
  { date: "2026-05", title: "qFund in New York", blurb: "Meetings with investors and strategic partners across the New York Deep Tech ecosystem.", tag: "Ecosystem", artwork: "new-york" },
  { date: "2026-04", title: "Tech Week, Miami", blurb: "qFund joined Tech Week in Miami, connecting Deep Tech startups with US partners.", tag: "Ecosystem", artwork: "miami" },
  { date: "2025-11", title: "VC delegation to Korea", blurb: "qFund led a venture delegation to Korea, opening strategic and industrial channels for portfolio companies.", tag: "Delegation", artwork: "korea" },
  { date: "2025-11", title: "VC delegation to Japan", blurb: "qFund led a venture delegation to Japan, building partner and customer access in advanced industry and electronics.", tag: "Delegation", artwork: "japan" },
];

export function formatNewsDate(date: string) {
  const [year, month] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}
