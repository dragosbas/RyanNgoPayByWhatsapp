import Image from "next/image";
import { HeroSignup } from "@/components/hero-signup";
import { copy } from "@/content/copy";

export default function HomePage() {
  return (
    <div className="hero">
      <HeroSignup />
      <div className="hero-media">
        <Image
          src={copy.home.imageSrc}
          alt={copy.home.imageAlt}
          fill
          priority
          sizes="(max-width: 860px) 100vw, 58vw"
          className="hero-photo"
        />
      </div>
    </div>
  );
}
