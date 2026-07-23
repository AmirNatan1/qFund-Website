import Image from "next/image";

export default function BrandMark() {
  return (
    <span className="brand" aria-label="qFund">
      <Image
        className="brand-image"
        src="/qfund-logo.jpg"
        alt=""
        width="510"
        height="126"
        draggable="false"
        aria-hidden="true"
        unoptimized
      />
    </span>
  );
}
