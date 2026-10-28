"use client";

import { useActionState } from "react";
import { login, type AuthState } from "@/app/actions/auth";
import { sendMessage, type ContactState } from "@/app/actions/contact";
import { placeOrder, type OrderState } from "@/app/actions/order";
import { formatPounds } from "@/lib/money";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {} as AuthState);
  return (
    <form action={action} className="panel mx-auto max-w-md space-y-4 p-6">
      <h1 className="mt-0">Kitchen login</h1>
      {state.error ? <p className="text-cherry">{state.error}</p> : null}
      <label className="block text-sm font-bold">
        Email
        <input className="field mt-1" type="email" name="email" autoComplete="username" required />
      </label>
      <label className="block text-sm font-bold">
        Password
        <input
          className="field mt-1"
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </label>
      <button className="btn" disabled={pending} type="submit">
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState(sendMessage, {} as ContactState);
  if (state.ok) {
    return (
      <div className="panel p-6">
        <h2 className="mt-0">Mahalo — we have it</h2>
        <p>A note is sitting in the kitchen inbox. We will write back to the address you gave.</p>
      </div>
    );
  }
  return (
    <form action={action} className="panel space-y-3 p-6">
      {state.error ? <p className="text-cherry">{state.error}</p> : null}
      <label className="block text-sm font-bold">
        Name
        <input className="field mt-1" name="name" required maxLength={80} />
      </label>
      <label className="block text-sm font-bold">
        Email
        <input className="field mt-1" type="email" name="email" required />
      </label>
      <label className="block text-sm font-bold">
        Phone (optional)
        <input className="field mt-1" name="phone" />
      </label>
      <label className="block text-sm font-bold">
        Message
        <textarea className="field mt-1 min-h-32" name="message" required minLength={10} />
      </label>
      <button className="btn" disabled={pending} type="submit">
        {pending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}

export function CheckoutForm({
  subtotal,
  deliveryFee,
  deliveryMin,
  deliveryEnabled,
  zones,
}: {
  subtotal: number;
  deliveryFee: number;
  deliveryMin: number;
  deliveryEnabled: boolean;
  zones: string;
}) {
  const [state, action, pending] = useActionState(placeOrder, {} as OrderState);
  return (
    <form action={action} className="panel space-y-3 p-6">
      <h2 className="mt-0">Checkout</h2>
      <p className="text-sm">
        Pay when you collect, or to the rider. Card-online sits on the later list — this kitchen
        runs on honour and a till.
      </p>
      {state.error ? <p className="text-cherry">{state.error}</p> : null}
      <label className="block text-sm font-bold">
        Name
        <input className="field mt-1" name="name" required maxLength={80} />
      </label>
      <label className="block text-sm font-bold">
        Email
        <input className="field mt-1" type="email" name="email" required />
      </label>
      <label className="block text-sm font-bold">
        Phone
        <input className="field mt-1" name="phone" required />
      </label>
      <fieldset className="space-y-2">
        <legend className="text-sm font-bold">How shall we send it?</legend>
        <label className="flex gap-2">
          <input type="radio" name="fulfilment" value="collection" defaultChecked />
          Collection
        </label>
        <label className="flex gap-2">
          <input type="radio" name="fulfilment" value="delivery" disabled={!deliveryEnabled} />
          Delivery
          {deliveryEnabled
            ? ` (+${formatPounds(deliveryFee)}, min ${formatPounds(deliveryMin)}, zones ${zones})`
            : " (paused)"}
        </label>
      </fieldset>
      <label className="block text-sm font-bold">
        Street
        <input className="field mt-1" name="address" />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block text-sm font-bold">
          City
          <input className="field mt-1" name="city" defaultValue="London" />
        </label>
        <label className="block text-sm font-bold">
          Postcode
          <input className="field mt-1" name="postcode" />
        </label>
      </div>
      <label className="block text-sm font-bold">
        Notes / allergies
        <textarea className="field mt-1 min-h-24" name="notes" />
      </label>
      <label className="flex gap-2 text-sm">
        <input type="checkbox" name="allergens_ok" required />I have read the allergen
        information and will tell the kitchen about allergies.
      </label>
      <label className="flex gap-2 text-sm">
        <input type="checkbox" name="terms_ok" required />I agree to the{" "}
        <a href="/legal/terms">terms of sale</a>.
      </label>
      <p className="font-bold">To pay: {formatPounds(subtotal)} plus delivery if chosen.</p>
      <button className="btn" disabled={pending || subtotal === 0} type="submit">
        {pending ? "Placing…" : "Place order"}
      </button>
    </form>
  );
}
