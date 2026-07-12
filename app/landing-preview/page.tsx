import { PreviewClient } from "./PreviewClient";

// Layout-upgrade experiment: product-first hero, product band, trust strip.
// Not linked from anywhere; noindex. The live landing page is untouched.
export const metadata = {
  title: "Skula — Landing Preview (layout upgrades)",
  robots: { index: false, follow: false },
};

export default function LandingPreviewPage() {
  return <PreviewClient />;
}
