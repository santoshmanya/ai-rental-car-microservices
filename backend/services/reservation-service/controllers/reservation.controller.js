const db = require('../../../database/db');
const axios = require('axios');

class ReservationController {
    // Create new reservation
    async createReservation(req, res) {
        const client = await db.getClient();

        try {
            const {
                userId,
                vehicleId,
                pickupLocationId,
                dropoffLocationId,
                pickupDate,
                dropoffDate,
                notes
            } = req.body;

            await client.query('BEGIN');

            // Check vehicle availability
            const availabilityCheck = await client.query(
                `SELECT id, status FROM vehicles WHERE id = $1 FOR UPDATE`,
                [vehicleId]
            );

            if (availabilityCheck.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: { message: 'Vehicle not found' } });
            }

            if (availabilityCheck.rows[0].status !== 'available') {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: { message: 'Vehicle is not available' } });
            }

            // Check for overlapping reservations
            const overlapCheck = await client.query(
                `SELECT id FROM reservations
         WHERE vehicle_id = $1
         AND status NOT IN ('cancelled', 'completed')
         AND (
           (pickup_date <= $2 AND dropoff_date >= $2)
           OR (pickup_date <= $3 AND dropoff_date >= $3)
           OR (pickup_date >= $2 AND dropoff_date <= $3)
         )`,
                [vehicleId, pickupDate, dropoffDate]
            );

            if (overlapCheck.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: { message: 'Vehicle is already reserved for these dates' } });
            }

            // Calculate total amount
            const categoryResult = await client.query(
                `SELECT vc.daily_rate, vc.deposit_amount
         FROM vehicles v
         JOIN vehicle_categories vc ON v.category_id = vc.id
         WHERE v.id = $1`,
                [vehicleId]
            );

            const { daily_rate, deposit_amount } = categoryResult.rows[0];
            const days = Math.ceil((new Date(dropoffDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24));
            const totalAmount = daily_rate * days;

            // Create reservation
            const reservationResult = await client.query(
                `INSERT INTO reservations (user_id, vehicle_id, pickup_location_id, dropoff_location_id,
                                    pickup_date, dropoff_date, status, total_amount, deposit_amount, notes)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, $9)
         RETURNING *`,
                [userId, vehicleId, pickupLocationId, dropoffLocationId, pickupDate, dropoffDate,
                    totalAmount, deposit_amount, notes]
            );

            await client.query('COMMIT');

            res.status(201).json(reservationResult.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Create reservation error:', error);
            res.status(500).json({ error: { message: 'Failed to create reservation' } });
        } finally {
            client.release();
        }
    }

    // Get all reservations (with filters)
    async getAllReservations(req, res) {
        try {
            const { userId, vehicleId, status, page = 1, limit = 20 } = req.query;

            const offset = (page - 1) * limit;
            let query = `
        SELECT r.*, 
               u.email as user_email, u.first_name, u.last_name,
               v.make, v.model, v.year, v.license_plate,
               pl.name as pickup_location_name,
               dl.name as dropoff_location_name
        FROM reservations r
        JOIN users u ON r.user_id = u.id
        JOIN vehicles v ON r.vehicle_id = v.id
        JOIN locations pl ON r.pickup_location_id = pl.id
        JOIN locations dl ON r.dropoff_location_id = dl.id
        WHERE 1=1
      `;
            const params = [];
            let paramCount = 1;

            if (userId) {
                query += ` AND r.user_id = $${paramCount}`;
                params.push(userId);
                paramCount++;
            }

            if (vehicleId) {
                query += ` AND r.vehicle_id = $${paramCount}`;
                params.push(vehicleId);
                paramCount++;
            }

            if (status) {
                query += ` AND r.status = $${paramCount}`;
                params.push(status);
                paramCount++;
            }

            query += ` ORDER BY r.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
            params.push(limit, offset);

            const result = await db.query(query, params);

            // Get total count
            let countQuery = 'SELECT COUNT(*) FROM reservations r WHERE 1=1';
            const countParams = [];
            let countParamCount = 1;

            if (userId) {
                countQuery += ` AND r.user_id = $${countParamCount}`;
                countParams.push(userId);
                countParamCount++;
            }

            if (vehicleId) {
                countQuery += ` AND r.vehicle_id = $${countParamCount}`;
                countParams.push(vehicleId);
                countParamCount++;
            }

            if (status) {
                countQuery += ` AND r.status = $${countParamCount}`;
                countParams.push(status);
                countParamCount++;
            }

            const countResult = await db.query(countQuery, countParams);
            const total = parseInt(countResult.rows[0].count);

            res.json({
                reservations: result.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Get reservations error:', error);
            res.status(500).json({ error: { message: 'Failed to get reservations' } });
        }
    }

    // Get reservation by ID
    async getReservationById(req, res) {
        try {
            const { id } = req.params;

            const result = await db.query(
                `SELECT r.*, 
                u.email as user_email, u.first_name, u.last_name, u.phone,
                v.make, v.model, v.year, v.license_plate, v.color,
                vc.name as category_name,
                pl.name as pickup_location_name, pl.address as pickup_address,
                dl.name as dropoff_location_name, dl.address as dropoff_address
         FROM reservations r
         JOIN users u ON r.user_id = u.id
         JOIN vehicles v ON r.vehicle_id = v.id
         JOIN vehicle_categories vc ON v.category_id = vc.id
         JOIN locations pl ON r.pickup_location_id = pl.id
         JOIN locations dl ON r.dropoff_location_id = dl.id
         WHERE r.id = $1`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: { message: 'Reservation not found' } });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Get reservation error:', error);
            res.status(500).json({ error: { message: 'Failed to get reservation' } });
        }
    }

    // Update reservation status
    async updateReservationStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: { message: 'Invalid status' } });
            }

            const result = await db.query(
                'UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *',
                [status, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: { message: 'Reservation not found' } });
            }

            // Observer pattern: Notify other services about status change
            this.notifyStatusChange(result.rows[0]);

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Update reservation status error:', error);
            res.status(500).json({ error: { message: 'Failed to update reservation status' } });
        }
    }

    // Cancel reservation
    async cancelReservation(req, res) {
        const client = await db.getClient();

        try {
            const { id } = req.params;

            await client.query('BEGIN');

            const result = await client.query(
                'UPDATE reservations SET status = $1 WHERE id = $2 AND status NOT IN ($3, $4) RETURNING *',
                ['cancelled', id, 'completed', 'cancelled']
            );

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: { message: 'Cannot cancel this reservation' } });
            }

            // Process refund if payment was made
            const paymentResult = await client.query(
                'SELECT id, amount FROM payments WHERE reservation_id = $1 AND payment_status = $2',
                [id, 'completed']
            );

            if (paymentResult.rows.length > 0) {
                // Call payment service to process refund
                // This would be done via API gateway in production
                console.log('Refund needed for payment:', paymentResult.rows[0].id);
            }

            await client.query('COMMIT');

            res.json(result.rows[0]);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Cancel reservation error:', error);
            res.status(500).json({ error: { message: 'Failed to cancel reservation' } });
        } finally {
            client.release();
        }
    }

    // Observer pattern implementation
    notifyStatusChange(reservation) {
        // In a real implementation, this would publish events to a message queue
        // or notify other services via webhooks
        console.log('Reservation status changed:', {
            id: reservation.id,
            status: reservation.status,
            vehicleId: reservation.vehicle_id
        });
    }
}

module.exports = new ReservationController();
