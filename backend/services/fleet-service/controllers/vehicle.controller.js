const db = require('../../../database/db');
const redis = require('../../../database/redis');

class VehicleController {
    // Get all vehicles with filters
    async getAllVehicles(req, res) {
        try {
            const {
                status,
                categoryId,
                locationId,
                available,
                page = 1,
                limit = 20
            } = req.query;

            const offset = (page - 1) * limit;
            let query = `
        SELECT v.*, vc.name as category_name, vc.daily_rate, l.name as location_name
        FROM vehicles v
        JOIN vehicle_categories vc ON v.category_id = vc.id
        JOIN locations l ON v.location_id = l.id
        WHERE 1=1
      `;
            const params = [];
            let paramCount = 1;

            if (status) {
                query += ` AND v.status = $${paramCount}`;
                params.push(status);
                paramCount++;
            }

            if (categoryId) {
                query += ` AND v.category_id = $${paramCount}`;
                params.push(categoryId);
                paramCount++;
            }

            if (locationId) {
                query += ` AND v.location_id = $${paramCount}`;
                params.push(locationId);
                paramCount++;
            }

            if (available === 'true') {
                query += ` AND v.status = 'available'`;
            }

            query += ` ORDER BY v.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
            params.push(limit, offset);

            const result = await db.query(query, params);

            // Get total count
            let countQuery = 'SELECT COUNT(*) FROM vehicles v WHERE 1=1';
            const countParams = [];
            let countParamCount = 1;

            if (status) {
                countQuery += ` AND v.status = $${countParamCount}`;
                countParams.push(status);
                countParamCount++;
            }

            if (categoryId) {
                countQuery += ` AND v.category_id = $${countParamCount}`;
                countParams.push(categoryId);
                countParamCount++;
            }

            if (locationId) {
                countQuery += ` AND v.location_id = $${countParamCount}`;
                countParams.push(locationId);
                countParamCount++;
            }

            if (available === 'true') {
                countQuery += ` AND v.status = 'available'`;
            }

            const countResult = await db.query(countQuery, countParams);
            const total = parseInt(countResult.rows[0].count);

            res.json({
                vehicles: result.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get vehicles error:', error);
            res.status(500).json({ error: { message: 'Failed to get vehicles' } });
        }
    }

    // Get vehicle by ID
    async getVehicleById(req, res) {
        try {
            const { id } = req.params;

            // Try cache first
            const cached = await redis.get(`vehicle:${id}`);
            if (cached) {
                return res.json(JSON.parse(cached));
            }

            const result = await db.query(
                `SELECT v.*, vc.name as category_name, vc.daily_rate, vc.weekly_rate, vc.monthly_rate,
                vc.deposit_amount, vc.passenger_capacity, vc.luggage_capacity,
                l.name as location_name, l.address, l.city, l.state
         FROM vehicles v
         JOIN vehicle_categories vc ON v.category_id = vc.id
         JOIN locations l ON v.location_id = l.id
         WHERE v.id = $1`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: { message: 'Vehicle not found' } });
            }

            const vehicle = result.rows[0];

            // Cache for 1 hour
            await redis.set(`vehicle:${id}`, JSON.stringify(vehicle), 3600);

            res.json(vehicle);
        } catch (error) {
            console.error('Get vehicle error:', error);
            res.status(500).json({ error: { message: 'Failed to get vehicle' } });
        }
    }

    // Create new vehicle (admin only)
    async createVehicle(req, res) {
        try {
            const {
                categoryId,
                locationId,
                make,
                model,
                year,
                color,
                licensePlate,
                vin,
                mileage,
                transmission,
                fuelType,
                features,
                imageUrl
            } = req.body;

            const result = await db.query(
                `INSERT INTO vehicles (category_id, location_id, make, model, year, color, 
                               license_plate, vin, mileage, status, transmission, 
                               fuel_type, features, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'available', $10, $11, $12, $13)
         RETURNING *`,
                [categoryId, locationId, make, model, year, color, licensePlate, vin,
                    mileage || 0, transmission, fuelType, JSON.stringify(features), imageUrl]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Create vehicle error:', error);
            if (error.code === '23505') { // Unique violation
                return res.status(400).json({ error: { message: 'License plate or VIN already exists' } });
            }
            res.status(500).json({ error: { message: 'Failed to create vehicle' } });
        }
    }

    // Update vehicle (admin only)
    async updateVehicle(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const allowedFields = [
                'category_id', 'location_id', 'make', 'model', 'year', 'color',
                'license_plate', 'vin', 'mileage', 'status', 'transmission',
                'fuel_type', 'features', 'image_url'
            ];

            const setClause = [];
            const values = [];
            let paramCount = 1;

            Object.keys(updates).forEach(key => {
                const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                if (allowedFields.includes(snakeKey)) {
                    setClause.push(`${snakeKey} = $${paramCount}`);
                    values.push(snakeKey === 'features' ? JSON.stringify(updates[key]) : updates[key]);
                    paramCount++;
                }
            });

            if (setClause.length === 0) {
                return res.status(400).json({ error: { message: 'No valid fields to update' } });
            }

            values.push(id);

            const result = await db.query(
                `UPDATE vehicles SET ${setClause.join(', ')} WHERE id = $${paramCount} RETURNING *`,
                values
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: { message: 'Vehicle not found' } });
            }

            // Invalidate cache
            await redis.del(`vehicle:${id}`);

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Update vehicle error:', error);
            res.status(500).json({ error: { message: 'Failed to update vehicle' } });
        }
    }

    // Delete vehicle (admin only)
    async deleteVehicle(req, res) {
        try {
            const { id } = req.params;

            const result = await db.query(
                'DELETE FROM vehicles WHERE id = $1 RETURNING id',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: { message: 'Vehicle not found' } });
            }

            // Invalidate cache
            await redis.del(`vehicle:${id}`);

            res.json({ message: 'Vehicle deleted successfully' });
        } catch (error) {
            console.error('Delete vehicle error:', error);
            res.status(500).json({ error: { message: 'Failed to delete vehicle' } });
        }
    }

    // Check vehicle availability
    async checkAvailability(req, res) {
        try {
            const { id } = req.params;
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({ error: { message: 'Start and end dates are required' } });
            }

            // Check if vehicle exists and is available
            const vehicleResult = await db.query(
                'SELECT id, status FROM vehicles WHERE id = $1',
                [id]
            );

            if (vehicleResult.rows.length === 0) {
                return res.status(404).json({ error: { message: 'Vehicle not found' } });
            }

            const vehicle = vehicleResult.rows[0];

            if (vehicle.status !== 'available') {
                return res.json({ available: false, reason: `Vehicle is ${vehicle.status}` });
            }

            // Check for overlapping reservations
            const reservationResult = await db.query(
                `SELECT id FROM reservations
         WHERE vehicle_id = $1
         AND status NOT IN ('cancelled', 'completed')
         AND (
           (pickup_date <= $2 AND dropoff_date >= $2)
           OR (pickup_date <= $3 AND dropoff_date >= $3)
           OR (pickup_date >= $2 AND dropoff_date <= $3)
         )`,
                [id, startDate, endDate]
            );

            const available = reservationResult.rows.length === 0;

            res.json({
                available,
                ...(!available && { reason: 'Vehicle is already reserved for these dates' })
            });
        } catch (error) {
            console.error('Check availability error:', error);
            res.status(500).json({ error: { message: 'Failed to check availability' } });
        }
    }
}

module.exports = new VehicleController();
