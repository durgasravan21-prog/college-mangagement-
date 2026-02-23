const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE: Verify Token ---
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

// --- ROUTES ---

// 1. Register Vendor (With Government Verification)
app.post('/api/register', async (req, res) => {
    const { email, password, businessName, governmentId } = req.body;

    try {
        // Mock Government Verification (In production, call external API)
        // Only accepts ID starting with "GOV" for demo
        const isGovValid = governmentId.startsWith('GOV');

        const hashedPassword = await bcrypt.hash(password, 10);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Insert User
            const userRes = await client.query(
                'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
                [email, hashedPassword, 'vendor']
            );
            const userId = userRes.rows[0].id;

            // Insert Vendor Profile
            await client.query(
                'INSERT INTO vendors (user_id, business_name, government_id, is_verified, verification_status) VALUES ($1, $2, $3, $4, $5)',
                [userId, businessName, governmentId, isGovValid, isGovValid ? 'verified' : 'rejected']
            );

            await client.query('COMMIT');
            res.json({ message: "Registration Successful", verified: isGovValid });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// 2. Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" });

        const validPassword = await bcrypt.compare(password, userRes.rows[0].password_hash);
        if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

        // Get Vendor Status
        const vendorRes = await pool.query('SELECT * FROM vendors WHERE user_id = $1', [userRes.rows[0].id]);

        const token = jwt.sign({
            id: userRes.rows[0].id,
            role: userRes.rows[0].role
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            role: userRes.rows[0].role,
            vendor: vendorRes.rows[0] || null
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Add Product (Inventory)
app.post('/api/products', authenticate, async (req, res) => {
    const { name, price, stock } = req.body;
    try {
        // Get vendor ID from user ID
        const vendorRes = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [req.userId]);
        if (vendorRes.rows.length === 0) return res.status(403).json({ error: "Vendor profile not found" });

        await pool.query(
            'INSERT INTO products (vendor_id, name, price, stock_quantity) VALUES ($1, $2, $3, $4)',
            [vendorRes.rows[0].id, name, price, stock]
        );
        res.json({ message: "Product Added" });
    } catch (err) {
        res.status(500).json({ error: "Failed to add product" });
    }
});

// 4. Get Products
app.get('/api/products', authenticate, async (req, res) => {
    try {
        const vendorRes = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [req.userId]);
        const products = await pool.query('SELECT * FROM products WHERE vendor_id = $1', [vendorRes.rows[0].id]);
        res.json(products.rows);
    } catch (err) {
        res.status(500).json({ error: "Error fetching products" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));