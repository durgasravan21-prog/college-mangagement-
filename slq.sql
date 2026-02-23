CREATE DATABASE vendor_platform;

\c vendor_platform;

-- Enable security extensions
CREATE EXTENSION pgcrypto;

-- USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer', -- 'admin', 'vendor'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VENDORS TABLE (Business Verification)
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    business_name VARCHAR(255),
    government_id VARCHAR(255), -- Tax ID / GST
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCTS TABLE (Inventory)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    vendor_id INT REFERENCES vendors(id),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ORDERS TABLE (Secure Ledger)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    vendor_id INT REFERENCES vendors(id),
    total_amount DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);