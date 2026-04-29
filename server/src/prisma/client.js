// require('dotenv').config();
// const {createPool} = require("mariadb");
// const {PrismaMariaDb} = require("@prisma/adapter-mariadb");
// const {PrismaClient} = require("@prisma/client");

// console.log("DB_USER:", process.env.DB_USER);
// console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "✓ có password" : "✗ KHÔNG CÓ PASSWORD");
// console.log("DB_HOST:", process.env.DB_HOST);
// const pool = createPool({
//     host: process.env.DB_HOST || 'localhost',
//     user: process.env.DB_USER || 'root',
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     port: 3306
// });

// const adapter = new PrismaMariaDb(pool);
// const prisma = new PrismaClient({adapter});

// module.exports = prisma;

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;