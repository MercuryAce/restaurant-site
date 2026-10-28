"use client";

import { useEffect, useState } from "react";

export function CookieNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(localStorage.getItem("kk_cookies") !== "ok");
  }, []);

  if (!open) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-30 mx-auto max-w-xl panel p-4">
      <p className="text-sm">
        We only set essential cookies: your bag, and a login cookie if you are kitchen staff. No
        analytics. See the{" "}
        <a href="/legal/cookies">cookie note</a>.
      </p>
      <button
        className="btn mt-3 text-sm"
        type="button"
        onClick={() => {
          localStorage.setItem("kk_cookies", "ok");
          setOpen(false);
        }}
      >
        Fine by me
      </button>
    </div>
  );
}
