'use server'
import { EncryptedUser } from "@/components/createUserForm"
import { Pool } from 'pg'

export async function create({firstName, lastName, email}: EncryptedUser) {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
    const client = await pool.connect();
    await client.query("CREATE TABLE IF NOT EXISTS users (first_name text, last_name text, email text)");
    await client.query("INSERT INTO users (first_name, last_name, email) VALUES ($1, $2, $3)", [
        firstName,
        lastName,
        email,
    ]);

    // Don't do this - SQLi demo
    //await client.query(`INSERT INTO users (firstName, lastName, email) VALUES ('${firstName}', '${lastName}', '${email}')`)
}

export async function list(): Promise<EncryptedUser[]> {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    })
    const client = await pool.connect()
    const result = await client.query(`SELECT first_name as "firstName", last_name as "lastName", email FROM users`)
    return result.rows
}