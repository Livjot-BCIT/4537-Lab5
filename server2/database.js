import mysql from 'mysql2/promise';

export class Database {
    constructor(user, password) {
        this.connection = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: user,
            password: password,
            database: process.env.DB_NAME || 'patients_db',
            waitForConnections: true,
            connectionLimit: 5,

            // Require an encrypted connection to Azure MySQL
            ssl: {
                rejectUnauthorized: true
            }
        });
    }

    async query(sql, values = []) {
        return this.connection.execute(sql, values);
    }
}
