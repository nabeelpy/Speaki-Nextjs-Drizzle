import { db } from "@/db";
import { users } from "@/db/schema"; // ← this came from your DB!

export default async function Home() {
  const data = await db.select().from(users);

  return (
    <div>
      <h1>Data From PostgreSQL</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}