const {createPool} = require("mariadb");
const {PrismaMariaDb} = require("@prisma/adapter-mariadb");
const {PrismaClient} = require("@prisma/client");

const pool = createPool({
    uri: process.env.DATABASE_URL,
});

const adapter = new PrismaMariaDb(pool);
const prisma = new PrismaClient({adapter});

module.exports = prisma;