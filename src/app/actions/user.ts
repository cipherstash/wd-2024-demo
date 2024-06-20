'use server'
import { EncryptedUser } from "@/components/createUserForm"
import { Pool } from 'pg'

const TABLE_NAME = 'wd_users'

export async function create({firstName, lastName, email}: EncryptedUser) {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
    const client = await pool.connect();
    await client.query(`CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (first_name text, last_name text, email text)`);
    await client.query(`INSERT INTO ${TABLE_NAME} (first_name, last_name, email) VALUES ($1, $2, $3)`, [
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
    const result = await client.query(`SELECT first_name as "firstName", last_name as "lastName", email FROM ${TABLE_NAME}`)
    return result.rows
}