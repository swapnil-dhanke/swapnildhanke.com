// TEMPORARY preview route for isolated ConstellationField development.
// Delete this route (src/app/dev/constellation) once the component is
// wired into the real pages.

import { ConstellationField } from "@/components/ConstellationField";

export default function ConstellationPreviewPage() {
  return <ConstellationField />;
}
