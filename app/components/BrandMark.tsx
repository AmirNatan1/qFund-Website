import Image from "next/image";

export default function BrandMark() {
  return (
    <span className="brand" aria-label="qFund">
      <Image
        className="brand-image"
        src="/qfund-logo.png"
        alt=""
        width="178"
        height="78"
        draggable="false"
        aria-hidden="true"
        unoptimized
      />
    </span>
  );
}
