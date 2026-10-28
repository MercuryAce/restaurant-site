# Kimo's Kitchen

A first-party Hawaiian diner site: public menu, bag, checkout, events, and a kitchen admin for dishes, prices, tickets and delivery connectors.

This is a revival of a 2017 static Bootstrap site. The mascot, copy and cartoon plates are new. 

## Run it

```bash
cd web
cp .env.example .env.local   # already created for local dev
# edit ADMIN_PASSWORD and SESSION_SECRET before you go live
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

Kitchen login (change this):

- email: `admin@kimoskitchen.local`
- password: `AlohaKitchen-ChangeMe!`

SQLite database: `web/data/kimos.db` (created on first request).

```bash
yarn build && yarn start
```

## What is live today

- Public site in the 2017 Aloha / vintage voice (Molle headings, sky-blue, cherry red, cartoon chef)
- Menu with UK 14-allergen labels
- Guest bag + collection/delivery checkout (pay on fulfilment)
- Events
- Contact inbox
- Admin: tickets, menu/prices, events, settings, password
- Just Eat / Deliveroo / Uber Eats **adapters**: storefront links, dry-run menu export, signed webhook intake
- Privacy, cookies, terms, allergen pages
- Signed httpOnly cookies, hashed admin password, login rate limit, CSP-friendly headers

## Delivery platforms

Those companies have partner APIs. They do **not** let a random website post an order onto Just Eat. Once a kitchen is onboarded:

1. Put credentials in `.env.local` (see `.env.example`).
2. Point each platform’s webhook to `/api/webhooks/justeat` (or `deliveroo` / `ubereats`) with the matching secret.
3. Paste the public storefront URL in Admin → Settings so guests can jump out.
4. Use **Dry-run menu export** until the partner account is approved — live menu push stays off on purpose.

## Before you trade

- Register the food business with the local authority
- Rewrite About, address, phone, hours
- Change the admin password
- Set a long `SESSION_SECRET`
- Put the site on HTTPS
- Photograph your own food if you want it to look like *your* kitchen
