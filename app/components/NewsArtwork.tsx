import Image from "next/image";
import type { NewsItem } from "../newsData";

type NewsArtworkProps = {
  item: NewsItem;
  priority?: boolean;
};

const newsDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export default function NewsArtwork({ item, priority = false }: NewsArtworkProps) {
  return (
    <div className="qf-news-art">
      <Image
        src={item.image}
        alt={item.imageAlt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 86vw, (max-width: 1100px) 48vw, 31vw"
      />
      <i aria-hidden="true" />
      <time dateTime={item.date}>{newsDate.format(new Date(`${item.date}T00:00:00Z`))}</time>
    </div>
  );
}
