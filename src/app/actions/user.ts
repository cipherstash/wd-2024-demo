"use server";
import { Encrypted } from "@/lib/crypto";
import { Pool } from "pg";

const TABLE_NAME = "wd_users";

export type User = {
  firstName: string;
  lastName: string;
  email: string;
};

export async function createUser({ firstName, lastName, email }: Encrypted<User>) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const client = await pool.connect();
  await client.query(
    `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (first_name text, last_name text, email text)`,
  );
  await client.query(
    `INSERT INTO ${TABLE_NAME} (first_name, last_name, email) VALUES ($1, $2, $3)`,
    [firstName, lastName, email],
  );

  // Don't do this - SQLi demo
  //await client.query(`INSERT INTO users (firstName, lastName, email) VALUES ('${firstName}', '${lastName}', '${email}')`)
}

export async function listUsers(): Promise<Encrypted<User>[]> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const client = await pool.connect();
  const result = await client.query(
    `SELECT first_name as "firstName", last_name as "lastName", email FROM ${TABLE_NAME}`,
  );
  console.log("Rows", result.rows)
  return result.rows;
}
