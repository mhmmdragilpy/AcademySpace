import { Pool, type QueryResult } from 'pg';
import { pool } from '../db/index.js';

export abstract class BaseRepository<T> {
    protected abstract tableName: string;
    protected abstract primaryKey: string;
    protected db: Pool;

    constructor() {
        this.db = pool;
    }

    public async query(text: string, params?: any[]): Promise<QueryResult> {
        return this.db.query(text, params);
    }

    async findAll(): Promise<T[]> {
        const query = `SELECT * FROM "${this.tableName}"`;
        const result = await this.query(query);
        return result.rows;
    }

    async findById(id: number | string): Promise<T | null> {
        const query = `SELECT * FROM "${this.tableName}" WHERE "${this.primaryKey}" = $1`;
        const result = await this.query(query, [id]);
        return result.rows[0] || null;
    }

    async create(data: Partial<T>): Promise<T> {
        const keys = Object.keys(data);
        const values = Object.values(data);

        if (keys.length === 0) {
            throw new Error('No data provided to create');
        }

        const indices = keys.map((_, i) => `$${i + 1}`).join(', ');
        const columns = keys.map(k => `"${k}"`).join(', ');

        const query = `
      INSERT INTO "${this.tableName}" (${columns})
      VALUES (${indices})
      RETURNING *
    `;

        const result = await this.query(query, values);
        return result.rows[0];
    }

    async update(id: number | string, data: Partial<T>): Promise<T | null> {
        const keys = Object.keys(data);
        const values = Object.values(data);

        if (keys.length === 0) return this.findById(id);

        const setClause = keys.map((key, i) => `"${key}" = $${i + 1}`).join(', ');

        // Add ID as the last parameter
        const query = `
      UPDATE "${this.tableName}"
      SET ${setClause}
      WHERE "${this.primaryKey}" = $${keys.length + 1}
      RETURNING *
    `;

        const result = await this.query(query, [...values, id]);
        return result.rows[0] || null;
    }

    async delete(id: number | string): Promise<boolean> {
        const query = `DELETE FROM "${this.tableName}" WHERE "${this.primaryKey}" = $1`;
        const result = await this.query(query, [id]);
        return (result.rowCount || 0) > 0;
    }
}
