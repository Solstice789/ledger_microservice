## Concurrency:

To prevent race conditions (multiple concurrent purchases), all ledger write operations (credits/purchases) run inside a single PostgreSQL transaction.
This transaction acquires a transaction-scoped advisory lock (hash of the x-user-id) and is executed via the pg_advisory_xact_lock function.
While holding the lock, the service calculates the current balance as SUM(amount_in_cents) from the ledger and only inserts the debit transaction if balance (cents) >= item price (cents).
This is handled on a per-user basis, preventing users' balances from going below zero under concurrent requests and allowing for balanced performance at scale.
The lock is automatically released when the transaction commits/rolls back.

## Item price changes over time:

Items are hardcoded in the codebase, but when creating a purchase (DEBIT) transaction, the service stores a snapshot of the item at purchase time,
via the item_id and amount_in_cents (the price of the item in that given time).

## Database indexes:

The following indexes were added:<br>
idx_ledger_user_id (user_id)<br>
idx_ledger_user_id_type (user_id, type)<br>

Tradeoff: Indexes improve read performance for our balance & purchase APIs, but they increase write cost and storage usage.
The tradeoff(s) are worth it here because balance checks are frequent and could be costly at scale, in its current implementation.

## Idempotency (design note):

I would add a normalized idempotency_keys table with a unique constraint on (user_id, key).<br>
The purchase logic would run in a single DB transaction where it would:<br>
1.) First attempt to insert the (user_id, key) row.<br>
2.) If it succeeds, then proceed with the advisory lock, balance check, and ledger insert.<br>
3.) Finally store the final outcome (status code and optional response metadata) in the idempotency row.<br>
If the insert fails due to the unique constraint, the handler would look up the existing row and return the previously stored outcome without creating a second ledger transaction.<br>
I would also store a request_hash (e.g., hash of { itemId }) to prevent reusing the same key for a different payload (return 409/422 if the hash differs).

## Running with Docker:

Simply run the following command - Ensure you first have docker installed (Docker Desktop for Windows):<br>
```docker-compose up --build```<br>
Note: The DB is seeded with 5 total transactions (3 CREDIT & 2 DEBIT) all from a single user (user_id = 856d9d7b-859a-4f92-b0f0-f3e89b5adf67) - This user has a balance of 1500 cents.<br>
That's it! On To Testing.

## If you prefer to run directly on your machine/dev:
Run a postgres server, expose port 5432, user:root, password:toor, db:ledger_microservice, host:localhost

Here is a docker command you to spin up a working postgres server:<br>
```docker run --name glover_ledger_db -e POSTGRES_USER=root -e POSTGRES_PASSWORD=toor -e POSTGRES_DB=ledger_microservice -p 5432:5432 -d postgres:alpine```<br>

Rename .env.example to .env:<br>
```mv .env.example .env```<br>

`npm install`<br>

Run Prisma migrations:<br>
`npx prisma migrate dev`<br>
`npx prisma generate`<br>

(Optional seed)<br>
`npx prisma db seed`<br>

`npm run start:dev`

## Testing:

http://localhost:3000/swagger-ui.html - main endpoint for testing the service (curl commands can also be found for each endpoint here - execute the endpoint once to view the curl command)<br>

https://www.uuidgenerator.net/ - might come in handy if you want to generate a UUIDv4 for testing different users.<br>

Note: If you ran the optional seeding step, you will 5 total transactions (3 CREDIT & 2 DEBIT) in the DB from a single user (user_id = 856d9d7b-859a-4f92-b0f0-f3e89b5adf67) and a balance of 1500 cents.