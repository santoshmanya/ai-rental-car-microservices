const db = require('../../../database/db');

class CategoryController {
    // Get all categories
    async getAllCategories(req, res) {
        try {
            const result = await db.query(
                'SELECT * FROM vehicle_categories ORDER BY daily_rate ASC'
            );

            res.json(result.rows);
        } catch (error) {
            console.error('Get categories error:', error);
            res.status(500).json({ error: { message: 'Failed to get categories' } });
        }
    }

    // Get category by ID
    async getCategoryById(req, res) {
        try {
            const { id } = req.params;

            const result = await db.query(
                'SELECT * FROM vehicle_categories WHERE id = $1',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: { message: 'Category not found' } });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Get category error:', error);
            res.status(500).json({ error: { message: 'Failed to get category' } });
        }
    }

    // Create category (admin only)
    async createCategory(req, res) {
        try {
            const {
                name,
                description,
                dailyRate,
                weeklyRate,
                monthlyRate,
                depositAmount,
                passengerCapacity,
                luggageCapacity
            } = req.body;

            const result = await db.query(
                `INSERT INTO vehicle_categories (name, description, daily_rate, weekly_rate, 
                                         monthly_rate, deposit_amount, passenger_capacity, 
                                         luggage_capacity)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
                [name, description, dailyRate, weeklyRate, monthlyRate, depositAmount,
                    passengerCapacity, luggageCapacity]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Create category error:', error);
            res.status(500).json({ error: { message: 'Failed to create category' } });
        }
    }

    // Update category (admin only)
    async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const allowedFields = [
                'name', 'description', 'daily_rate', 'weekly_rate', 'monthly_rate',
                'deposit_amount', 'passenger_capacity', 'luggage_capacity'
            ];

            const setClause = [];
            const values = [];
            let paramCount = 1;

            Object.keys(updates).forEach(key => {
                const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                if (allowedFields.includes(snakeKey)) {
                    setClause.push(`${snakeKey} = $${paramCount}`);
                    values.push(updates[key]);
                    paramCount++;
                }
            });

            if (setClause.length === 0) {
                return res.status(400).json({ error: { message: 'No valid fields to update' } });
            }

            values.push(id);

            const result = await db.query(
                `UPDATE vehicle_categories SET ${setClause.join(', ')} WHERE id = $${paramCount} RETURNING *`,
                values
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: { message: 'Category not found' } });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Update category error:', error);
            res.status(500).json({ error: { message: 'Failed to update category' } });
        }
    }

    // Delete category (admin only)
    async deleteCategory(req, res) {
        try {
            const { id } = req.params;

            // Check if any vehicles use this category
            const vehicleCheck = await db.query(
                'SELECT COUNT(*) FROM vehicles WHERE category_id = $1',
                [id]
            );

            if (parseInt(vehicleCheck.rows[0].count) > 0) {
                return res.status(400).json({
                    error: { message: 'Cannot delete category with associated vehicles' }
                });
            }

            const result = await db.query(
                'DELETE FROM vehicle_categories WHERE id = $1 RETURNING id',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: { message: 'Category not found' } });
            }

            res.json({ message: 'Category deleted successfully' });
        } catch (error) {
            console.error('Delete category error:', error);
            res.status(500).json({ error: { message: 'Failed to delete category' } });
        }
    }
}

module.exports = new CategoryController();
