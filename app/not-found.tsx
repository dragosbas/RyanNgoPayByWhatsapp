import Link from "next/link";
import { copy } from "@/content/copy";

export default function NotFound() {
  return (
    <div className="page">
      <div className="wrap prose">
        <h1>{copy.notFound.title}</h1>
        <p>
          <Link href="/">{copy.notFound.home}</Link>
        </p>
      </div>
    </div>
  );
}
