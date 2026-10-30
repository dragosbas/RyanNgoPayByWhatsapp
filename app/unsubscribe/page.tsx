import type { Metadata } from "next";
import { UnsubscribeForm } from "@/components/unsubscribe-form";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: copy.unsubscribe.metaTitle,
};

export default function UnsubscribePage() {
  return (
    <div className="page">
      <div className="wrap prose">
        <h1>{copy.unsubscribe.title}</h1>
        <p className="lede">{copy.unsubscribe.lede}</p>
        <UnsubscribeForm />
      </div>
    </div>
  );
}
