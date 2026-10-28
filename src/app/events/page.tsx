import Image from "next/image";
import { PublicShell } from "@/components/PublicShell";
import { getDb } from "@/lib/db";

export const metadata = { title: "Events" };

export default function EventsPage() {
  const events = getDb()
    .prepare(
      "SELECT id, title, summary, body, starts_at, image FROM events WHERE published = 1 ORDER BY starts_at",
    )
    .all() as {
    id: number;
    title: string;
    summary: string;
    body: string;
    starts_at: string;
    image: string | null;
  }[];

  return (
    <PublicShell>
      <p className="rock text-cherry">Memory lane, still moving</p>
      <h1 className="text-5xl">Events</h1>
      <p className="max-w-2xl">
        Vintage nights, tea services, and whatever the kitchen pins on the door. Dates are
        examples — change them in Admin.
      </p>
      <div className="mt-8 space-y-6">
        {events.map((event) => (
          <article key={event.id} className="panel grid overflow-hidden p-0 md:grid-cols-2">
            {event.image ? (
              <Image
                src={event.image}
                alt=""
                width={800}
                height={560}
                className="h-full max-h-80 w-full object-cover"
              />
            ) : null}
            <div className="p-6">
              <p className="rock text-sm text-cherry">
                {new Date(event.starts_at).toLocaleString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <h2 className="mt-2">{event.title}</h2>
              <p className="font-bold">{event.summary}</p>
              <p>{event.body}</p>
            </div>
          </article>
        ))}
      </div>
    </PublicShell>
  );
}
