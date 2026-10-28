import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";

export default function NotFound() {
  return (
    <PublicShell>
      <h1>That plate left the pass</h1>
      <p>
        <Link href="/">Back to the kitchen</Link>
      </p>
    </PublicShell>
  );
}
