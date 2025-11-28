const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../../database/db');
const redis = require('../../../database/redis');

class AuthController {
    // Register new user
    async register(req, res) {
        try {
            const { email, password, firstName, lastName, phone, role = 'customer' } = req.body;

            // Check if user already exists
            const existingUser = await db.query(
                'SELECT id FROM users WHERE email = $1',
                [email]
            );

            if (existingUser.rows.length > 0) {
                return res.status(400).json({ error: { message: 'Email already registered' } });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Insert user
            const result = await db.query(
                `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, first_name, last_name, phone, role, created_at`,
                [email, passwordHash, firstName, lastName, phone, role]
            );

            const user = result.rows[0];

            // Generate tokens
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);

            // Store refresh token in Redis
            await redis.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60);

            res.status(201).json({
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    phone: user.phone,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: { message: 'Registration failed' } });
        }
    }

    // Login user
    async login(req, res) {
        try {
            console.log('Login attempt:', req.body.email);
            const { email, password } = req.body;

            // Find user
            console.log('Querying database for user...');
            const result = await db.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            console.log('Query result:', result.rows.length, 'users found');

            if (result.rows.length === 0) {
                console.log('User not found');
                return res.status(401).json({ error: { message: 'Invalid credentials' } });
            }

            const user = result.rows[0];
            console.log('User found:', user.email);

            // Verify password
            console.log('Verifying password...');
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            console.log('Password valid:', isValidPassword);

            if (!isValidPassword) {
                return res.status(401).json({ error: { message: 'Invalid credentials' } });
            }

            // Generate tokens
            console.log('Generating tokens...');
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);

            // Store refresh token in Redis
            console.log('Storing refresh token in Redis...');
            await redis.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60);
            console.log('Login successful!');

            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    phone: user.phone,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: { message: 'Login failed' } });
        }
    }

    // Refresh access token
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({ error: { message: 'Refresh token required' } });
            }

            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

            // Check if token exists in Redis
            const storedToken = await redis.get(`refresh_token:${decoded.id}`);

            if (!storedToken || storedToken !== refreshToken) {
                return res.status(401).json({ error: { message: 'Invalid refresh token' } });
            }

            // Get user
            const result = await db.query(
                'SELECT * FROM users WHERE id = $1',
                [decoded.id]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ error: { message: 'User not found' } });
            }

            const user = result.rows[0];

            // Generate new access token
            const accessToken = this.generateAccessToken(user);

            res.json({ accessToken });
        } catch (error) {
            console.error('Token refresh error:', error);
            res.status(401).json({ error: { message: 'Invalid refresh token' } });
        }
    }

    // Logout user
    async logout(req, res) {
        try {
            const userId = req.user.id;

            // Remove refresh token from Redis
            await redis.del(`refresh_token:${userId}`);

            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ error: { message: 'Logout failed' } });
        }
    }

    // Get current user
    async getCurrentUser(req, res) {
        try {
            const result = await db.query(
                'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = $1',
                [req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: { message: 'User not found' } });
            }

            const user = result.rows[0];

            res.json({
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                role: user.role,
                createdAt: user.created_at,
            });
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({ error: { message: 'Failed to get user' } });
        }
    }

    // Change password
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            // Get user
            const result = await db.query(
                'SELECT password_hash FROM users WHERE id = $1',
                [userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: { message: 'User not found' } });
            }

            const user = result.rows[0];

            // Verify current password
            const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

            if (!isValidPassword) {
                return res.status(401).json({ error: { message: 'Current password is incorrect' } });
            }

            // Hash new password
            const newPasswordHash = await bcrypt.hash(newPassword, 10);

            // Update password
            await db.query(
                'UPDATE users SET password_hash = $1 WHERE id = $2',
                [newPasswordHash, userId]
            );

            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ error: { message: 'Failed to change password' } });
        }
    }

    // Helper methods
    generateAccessToken(user) {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '24h' }
        );
    }

    generateRefreshToken(user) {
        return jwt.sign(
            {
                id: user.id,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
        );
    }
}

module.exports = new AuthController();
