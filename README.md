## Concurrency

To prevent race conditions (multiple concurrent purchases), all ledger write operations (credits/purchases) run inside a single PostgreSQL transaction.
This transaction acquires a transaction-scoped advisory lock (hash of the x-user-id) and executed via the pg_advisory_xact_lock function.
While holding the lock, the service calculates the current balance as SUM(amount_in_cents) from the ledger and only inserts the debit transaction if balance (cents) > item price (cents).
This is handled on a per-user basis, preventing users' balances from going below zero under concurrent requests and allowing for balanced performance at scale.
The lock is automatically released when the transaction commits/rolls back.

Price changes over time

Items are hardcoded in the codebase, but when creating a purchase (DEBIT) transaction the service stores a snapshot of the item at purchase time,
via the item_id and amount_in_cents (the price of the item in that given time).

## Database indexes:

The following indexes were added:
idx_ledger_user_id (user_id)
idx_ledger_user_id_type (user_id, type)

Tradeoff: Indexes improve read performance for our balance & purchase APIs, but they increase write cost increase storage usage.
The tradeoff(s) are worth it here because balance checks are frequent and could be costly at scale, in its current implementation.

## Idempotency (design note)
I would add a normalized idempotency_keys table with a unique constraint on (user_id, key).
The purchase logic would run in a single DB transaction where it would:
1.) First attempt to insert the (user_id, key) row.
2.) If it succeeds, then proceed with the advisory lock, balance check, and ledger insert.
3.) Finally store the final outcome (status code and optional response metadata) in the idempotency row.
If the insert fails due to the unique constraint, the handler would look up the existing row and return the previously stored outcome without creating a second ledger transaction.
I would also store a request_hash (e.g., hash of { itemId }) to prevent reusing the same key for a different payload (return 409/422 if the hash differs).

## Running the microservice
How to run locally:
Run postgres server, expose port 5432, user:root, password:toor, db:ledger_microservice, host:localhost

Here is the docker command to spin up a working postgres server:
docker run --name glover_ledger_db -e POSTGRES_USER=root -e POSTGRES_PASSWORD=toor -e POSTGRES_DB=ledger_microservice -p 5432:5432 -d postgres:alpine

Rename .env.example to .env

Run Prisma migrations:
npx prisma migrate dev
npx prisma generate

(Optional seed)
npx prisma db seed

npm install
npm run start:dev