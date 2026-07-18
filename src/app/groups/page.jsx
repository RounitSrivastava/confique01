// /groups/page.jsx  (SERVER COMPONENT)

import AppContainer from "./AppContainer";

export const dynamic = "force-dynamic";

import { Suspense } from "react";

export default function GroupsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-text-1">Loading...</div>}>
      <AppContainer />
    </Suspense>
  );
}
