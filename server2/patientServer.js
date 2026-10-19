import http from 'node:http';
import { Database } from './Database.js';

const PORT = process.env.PORT || 3000;

export class PatientServer {
    constructor() {
        this.adminDB = new Database(
            process.env.DB_ADMIN_USER,
            process.env.DB_ADMIN_PASSWORD
        );
        this.readerDB = new Database(
            process.env.DB_READER_USER,
            process.env.DB_READER_PASSWORD
        );
        this.server = http.createServer(
            this.handleRequest.bind(this)
        );
    }

    async ensureTable() {
        await this.adminDB.query(`
            CREATE TABLE IF NOT EXISTS patient (
                patient_id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL
            ) ENGINE=InnoDB
        `);
    }

    async insertPatients() {
        await this.ensureTable();
        const patients = [
            ['John', 'Smith'],
            ['Jane', 'Doe']
        ];
        for (const patient of patients) {
            await this.adminDB.query(
                'INSERT INTO patient (first_name, last_name) VALUES (?, ?)',
                patient
            );
        }
    }
    async readPatients(sql) {
        return this.readerDB.query(sql);
    }

    async handleRequest(request, response) {
        const allowedOrigin = process.env.CLIENT_ORIGIN || '*';
        response.setHeader(
            'Access-Control-Allow-Origin',
            allowedOrigin
        );
        response.setHeader(
            'Access-Control-Allow-Methods',
            'GET, POST, OPTIONS'
        );
        response.setHeader(
            'Access-Control-Allow-Headers',
            'Content-Type'
        );
        if (request.method === 'OPTIONS') {
            response.writeHead(204);
            return response.end();
        }
        const url = new URL(
            request.url,
            `http://${request.headers.host}`
        );
        try {
            if (
                url.pathname === '/api/v1/insert' &&
                request.method === 'POST'
            ) {
                await this.insertPatients();
                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                return response.end(JSON.stringify({
                    message: 'Patient records inserted successfully'
                }));
            }
            if (
                url.pathname.startsWith('/api/v1/sql/') &&
                request.method === 'GET'
            ) {
                const encodedSql = url.pathname.slice(
                    '/api/v1/sql/'.length
                );
                const sql = decodeURIComponent(encodedSql)
                    .replace(/^"|"$/g, '');
                if (!sql.trim()) {
                    response.writeHead(400, {
                        'Content-Type': 'text/plain'
                    });

                    return response.end('Missing SQL query');
                }
                const [rows] = await this.readPatients(sql);
                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                return response.end(JSON.stringify(rows));
            }
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            return response.end('Endpoint not found');
        } catch (error) {
            console.error(error);

            response.writeHead(400, {
                'Content-Type': 'text/plain'
            });

            return response.end(
                'Request failed. Check the query and database permissions.'
            );
        }
    }
    start() {
        this.server.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    }
}