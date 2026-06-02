import { Suspense } from "react";
import CreateQuizClient from "./CreateQuizClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateQuizClient />
    </Suspense>
  );
}