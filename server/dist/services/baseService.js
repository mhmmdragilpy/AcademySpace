import { query } from "../db/index.js";
export class BaseService {
    tableName;
    constructor(tableName) {
        this.tableName = tableName;
    }
    async findAll() {
        const result = await query(`SELECT * FROM ${this.tableName}`);
        return result.rows;
    }
    async findById(id) {
        const result = await query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
        return result.rows[0] || null;
    }
    async create(data) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
        const sql = `INSERT INTO ${this.tableName} (${fields.join(", ")}) VALUES (${placeholders}) RETURNING *`;
        const result = await query(sql, values);
        return result.rows[0];
    }
    async update(id, data) {
        const fields = Object.keys(data);
        if (fields.length === 0)
            return this.findById(id);
        const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(", ");
        const values = Object.values(data);
        values.push(id);
        const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;
        const result = await query(sql, values);
        return result.rows[0] || null;
    }
    async delete(id) {
        const result = await query(`DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`, [id]);
        return result.rows[0] || null;
    }
}
//# sourceMappingURL=baseService.js.map