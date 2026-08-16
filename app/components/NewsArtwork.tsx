import Image from "next/image";
import type { NewsItem } from "../newsData";

type NewsArtworkProps = {
  item: NewsItem;
  index: number;
  priority?: boolean;
};

export default function NewsArtwork({ item, index, priority = false }: NewsArtworkProps) {
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
      <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
    </div>
  );
}
