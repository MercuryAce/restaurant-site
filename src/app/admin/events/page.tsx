import { AdminChrome } from "@/components/AdminChrome";
import { deleteEvent, saveEvent } from "@/app/actions/admin";
import { getDb } from "@/lib/db";

export const metadata = { title: "Events admin" };

export default function AdminEventsPage() {
  const events = getDb()
    .prepare("SELECT * FROM events ORDER BY starts_at")
    .all() as {
    id: number;
    title: string;
    summary: string;
    body: string;
    starts_at: string;
    image: string | null;
  }[];

  return (
    <AdminChrome>
      <h1 className="mt-0">Events</h1>
      <form action={saveEvent} className="panel grid gap-3 p-5 md:grid-cols-2">
        <label className="block text-sm font-bold">
          Title
          <input className="field mt-1" name="title" required />
        </label>
        <label className="block text-sm font-bold">
          Starts (ISO)
          <input className="field mt-1" name="starts_at" placeholder="2026-11-14T19:00:00" required />
        </label>
        <label className="block text-sm font-bold md:col-span-2">
          Summary
          <input className="field mt-1" name="summary" />
        </label>
        <label className="block text-sm font-bold md:col-span-2">
          Body
          <textarea className="field mt-1" name="body" />
        </label>
        <label className="block text-sm font-bold">
          Image
          <input className="field mt-1" name="image" defaultValue="/images/dance.jpg" />
        </label>
        <button className="btn self-end" type="submit">
          Add event
        </button>
      </form>
      <ul className="mt-8 space-y-4">
        {events.map((event) => (
          <li key={event.id} className="panel p-4">
            <p className="display text-2xl">{event.title}</p>
            <p className="text-sm">{event.starts_at}</p>
            <p>{event.summary}</p>
            <form action={deleteEvent}>
              <input type="hidden" name="id" value={event.id} />
              <button className="btn mt-2 text-sm" type="submit">
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>
    </AdminChrome>
  );
}
