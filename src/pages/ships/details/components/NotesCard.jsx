import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import DetailCard from "@/components/detail/DetailCard";

export default function NotesCard({ id }) {
  const storageKey = `vessel-detail:${id}`;

  function readSavedNote() {
    if (typeof window === "undefined") return "";

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
      return typeof saved.note === "string" ? saved.note : "";
    } catch {
      return "";
    }
  }

  const [note, setNote] = useState(readSavedNote);
  const [editing, setEditing] = useState(false);

  function saveNote(event) {
    event.preventDefault();

    const savedNote = note.trim();

    try {
      localStorage.setItem(storageKey, JSON.stringify({ note: savedNote }));
    } catch {
      // Keep the note in state if local storage is unavailable.
    }

    setNote(savedNote);
    setEditing(false);
  }

  return (
    <DetailCard title="Notes">
      {editing ? (
        <form onSubmit={saveNote}>
          <label
            htmlFor={`vessel-note-${id}`}
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Private note
          </label>

          <textarea
            id={`vessel-note-${id}`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            maxLength={5000}
            className="w-full rounded-md border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
            placeholder="Add a note about this vessel..."
          />

          <div className="mt-3 flex gap-2">
            <button
              className="rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white"
              type="submit"
            >
              Save note
            </button>

            <button
              className="rounded-md border px-3 py-2 text-sm"
              type="button"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Notes are saved on this device.
          </p>
        </form>
      ) : (
        <div className="text-center">
          <MessageSquarePlus className="mx-auto text-slate-400" size={26} />

          <p className="my-3 whitespace-pre-wrap text-sm text-slate-600">
            {note || "Keep your vessel notes in one place"}
          </p>

          <button
            className="rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white"
            type="button"
            onClick={() => setEditing(true)}
          >
            {note ? "Edit note" : "Add a note"}
          </button>

          <p className="mt-2 text-xs text-slate-500">
            Private · saved on this device
          </p>
        </div>
      )}
    </DetailCard>
  );
}
