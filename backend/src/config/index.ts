
export const databaseConfig = {
  client: 'pg',
  version: '12',
  connection: {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
  pool: {
    min: 1,
    max: 2, // keep this low for Render free-tier
  },
}