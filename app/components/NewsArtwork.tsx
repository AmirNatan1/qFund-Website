import type { NewsItem } from "../newsData";

type NewsArtworkProps = {
  item: NewsItem;
  index: number;
};

export default function NewsArtwork({ item, index }: NewsArtworkProps) {
  const variant = item.artwork;

  return (
    <div className={`qf-news-art qf-news-art-${variant}`} role="img" aria-label={`${item.title} editorial illustration`}>
      <svg viewBox="0 0 640 420" aria-hidden="true">
        <defs>
          <linearGradient id={`wash-${variant}-${index}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d7f0df" />
            <stop offset="1" stopColor="#f5e9d8" />
          </linearGradient>
          <pattern id={`grid-${variant}-${index}`} width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#1f5b49" strokeOpacity="0.12" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="640" height="420" fill={`url(#wash-${variant}-${index})`} />
        <rect width="640" height="420" fill={`url(#grid-${variant}-${index})`} />

        {variant === "new-york" ? (
          <g className="qf-news-drawing">
            <path d="M76 332H564" />
            <path d="M112 332V238H154V332M170 332V194H222V332M238 332V250H278V332M296 332V126H342V332M363 332V218H410V332M428 332V164H484V332M500 332V264H536V332" />
            <path className="qf-route" d="M86 116C188 42 360 40 545 128" />
            <circle cx="86" cy="116" r="7" /><circle cx="545" cy="128" r="7" />
          </g>
        ) : null}

        {variant === "miami" ? (
          <g className="qf-news-drawing">
            <circle cx="472" cy="126" r="58" />
            <path d="M72 300C160 258 234 344 322 300S484 258 568 302" />
            <path d="M72 328C160 286 234 372 322 328S484 286 568 330" />
            <path d="M110 272V188H155V272M174 272V224H218V272M240 272V154H292V272M316 272V206H366V272" />
            <path className="qf-route" d="M94 112C214 44 350 66 430 132" />
            <circle cx="94" cy="112" r="7" /><circle cx="430" cy="132" r="7" />
          </g>
        ) : null}

        {variant === "korea" ? (
          <g className="qf-news-drawing">
            <path d="M322 92C276 116 260 158 278 192C294 221 274 252 292 294C306 328 338 346 352 318C368 286 350 252 372 224C400 186 376 128 322 92Z" />
            <path d="M106 302C198 226 246 204 286 202M367 218C438 216 493 242 548 292" />
            <path className="qf-route" d="M94 132C194 62 426 56 546 142" />
            <circle cx="94" cy="132" r="7" /><circle cx="546" cy="142" r="7" />
            <circle cx="324" cy="201" r="38" /><circle cx="324" cy="201" r="76" />
          </g>
        ) : null}

        {variant === "japan" ? (
          <g className="qf-news-drawing">
            <path d="M242 122C272 108 294 132 282 154C270 174 290 186 278 206C264 228 230 208 240 184C250 162 218 142 242 122Z" />
            <path d="M316 176C346 154 378 174 364 204C352 228 376 240 356 266C336 292 294 270 310 242C326 218 290 196 316 176Z" />
            <path d="M386 264C406 248 430 260 424 280C418 298 438 302 424 318C408 336 378 320 388 300C398 284 370 278 386 264Z" />
            <path className="qf-route" d="M88 118C204 42 428 54 550 146" />
            <circle cx="88" cy="118" r="7" /><circle cx="550" cy="146" r="7" />
            <path d="M102 326H540" />
          </g>
        ) : null}
      </svg>
      <span>{String(index + 1).padStart(2, "0")}</span>
    </div>
  );
}
