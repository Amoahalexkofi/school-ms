import { PreviewClient } from "./PreviewClient";

// Design experiment: the landing page re-skinned with the Stripe design
// language (awesome-design-md/stripe). Not linked from anywhere; noindex.
// The live landing page at / is untouched.
export const metadata = {
  title: "Skula — Landing Preview (Stripe skin)",
  robots: { index: false, follow: false },
};

export default function LandingPreviewPage() {
  return <PreviewClient />;
}
