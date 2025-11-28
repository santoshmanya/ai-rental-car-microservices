const db = require('../../../database/db');
const redis = require('../../../database/redis');

class ReportController {
    // Revenue report
    async getRevenueReport(req, res) {
        try {
            const { startDate, endDate } = req.query;

            const cacheKey = `revenue:${startDate}:${endDate}`;
            const cached = await redis.get(cacheKey);
            if (cached) {
                return res.json(JSON.parse(cached));
            }

            const result = await db.query(
                `SELECT 
          DATE(p.transaction_date) as date,
          COUNT(p.id) as transaction_count,
          SUM(p.amount) as total_revenue,
          AVG(p.amount) as average_transaction
         FROM payments p
         WHERE p.payment_status = 'completed'
         AND p.transaction_date >= $1
         AND p.transaction_date <= $2
         GROUP BY DATE(p.transaction_date)
         ORDER BY date DESC`,
                [startDate, endDate]
            );

            const report = {
                period: { start: startDate, end: endDate },
                data: result.rows,
                summary: {
                    totalRevenue: result.rows.reduce((sum, row) => sum + parseFloat(row.total_revenue), 0),
                    totalTransactions: result.rows.reduce((sum, row) => sum + parseInt(row.transaction_count), 0),
                }
            };

            await redis.set(cacheKey, JSON.stringify(report), 3600);
            res.json(report);
        } catch (error) {
            console.error('Revenue report error:', error);
            res.status(500).json({ error: { message: 'Failed to generate revenue report' } });
        }
    }

    // Vehicle utilization report
    async getUtilizationReport(req, res) {
        try {
            const result = await db.query(
                `SELECT 
          v.id, v.make, v.model, v.year, v.license_plate,
          vc.name as category,
          COUNT(r.id) as total_reservations,
          SUM(EXTRACT(DAY FROM (r.dropoff_date - r.pickup_date))) as total_days_rented,
          AVG(EXTRACT(DAY FROM (r.dropoff_date - r.pickup_date))) as avg_rental_duration
         FROM vehicles v
         LEFT JOIN reservations r ON v.id = r.vehicle_id AND r.status IN ('confirmed', 'active', 'completed')
         JOIN vehicle_categories vc ON v.category_id = vc.id
         GROUP BY v.id, v.make, v.model, v.year, v.license_plate, vc.name
         ORDER BY total_reservations DESC`
            );

            res.json(result.rows);
        } catch (error) {
            console.error('Utilization report error:', error);
            res.status(500).json({ error: { message: 'Failed to generate utilization report' } });
        }
    }

    // Popular categories report
    async getPopularCategories(req, res) {
        try {
            const result = await db.query(
                `SELECT 
          vc.name as category,
          vc.daily_rate,
          COUNT(r.id) as reservation_count,
          SUM(r.total_amount) as total_revenue
         FROM vehicle_categories vc
         LEFT JOIN vehicles v ON vc.id = v.category_id
         LEFT JOIN reservations r ON v.id = r.vehicle_id AND r.status IN ('confirmed', 'active', 'completed')
         GROUP BY vc.id, vc.name, vc.daily_rate
         ORDER BY reservation_count DESC`
            );

            res.json(result.rows);
        } catch (error) {
            console.error('Popular categories error:', error);
            res.status(500).json({ error: { message: 'Failed to get popular categories' } });
        }
    }

    // Dashboard summary
    async getDashboardSummary(req, res) {
        try {
            const [
                totalVehicles,
                availableVehicles,
                activeReservations,
                totalRevenue,
                recentReservations
            ] = await Promise.all([
                db.query('SELECT COUNT(*) FROM vehicles'),
                db.query("SELECT COUNT(*) FROM vehicles WHERE status = 'available'"),
                db.query("SELECT COUNT(*) FROM reservations WHERE status IN ('confirmed', 'active')"),
                db.query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'completed'"),
                db.query(`SELECT r.*, u.first_name, u.last_name, v.make, v.model
                  FROM reservations r
                  JOIN users u ON r.user_id = u.id
                  JOIN vehicles v ON r.vehicle_id = v.id
                  ORDER BY r.created_at DESC
                  LIMIT 10`)
            ]);

            res.json({
                totalVehicles: parseInt(totalVehicles.rows[0].count),
                availableVehicles: parseInt(availableVehicles.rows[0].count),
                activeReservations: parseInt(activeReservations.rows[0].count),
                totalRevenue: parseFloat(totalRevenue.rows[0].total),
                recentReservations: recentReservations.rows
            });
        } catch (error) {
            console.error('Dashboard summary error:', error);
            res.status(500).json({ error: { message: 'Failed to get dashboard summary' } });
        }
    }
}

module.exports = new ReportController();
