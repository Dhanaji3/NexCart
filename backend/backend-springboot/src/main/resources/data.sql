-- Sample Products Data for E-Commerce Backend
-- Load with development profile or manually insert

INSERT INTO products (sku, name, description, price, stock, category, image_url, active, created_at, updated_at) VALUES
('LAPTOP-001', 'Premium Laptop Pro', 'High-performance 15-inch laptop with Intel i9 processor, 32GB RAM, 1TB SSD. Perfect for developers and content creators.', 1299.99, 25, 'Electronics', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MONITOR-001', '4K Monitor 27"', 'Professional 27-inch 4K monitor with 99% sRGB color accuracy. Ideal for photo/video editing and gaming.', 599.99, 15, 'Electronics', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MOUSE-001', 'Wireless Mouse Pro', 'Ergonomic wireless mouse with precision tracking and long battery life (up to 18 months).', 49.99, 100, 'Accessories', 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('KEYBOARD-001', 'Mechanical Gaming Keyboard', 'RGB mechanical keyboard with customizable switches, aluminum frame, and programmable keys.', 129.99, 50, 'Accessories', 'https://images.unsplash.com/photo-1587829191301-bbb047e67d19?w=500&h=500&fit=crop', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('HEADPHONES-001', 'Active Noise Cancellation Headphones', 'Premium wireless headphones with active noise cancellation, 30-hour battery, premium sound quality.', 299.99, 40, 'Audio', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('WEBCAM-001', '4K Webcam', 'Crystal clear 4K webcam with auto-focus and noise-cancelling microphone. Perfect for streaming and video calls.', 149.99, 30, 'Electronics', 'https://images.unsplash.com/photo-1598649956327-fdd2e7cb3f30?w=500&h=500&fit=crop', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USB-HUB-001', 'USB-C Hub Multiport', 'All-in-one USB-C hub with HDMI, USB 3.0, SD card reader, and power delivery up to 100W.', 79.99, 60, 'Accessories', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&h=500&fit=crop', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STAND-001', 'Monitor Arm Stand', 'Height-adjustable monitor stand with tilt, swivel, and rotation. Supports up to 32" monitors.', 89.99, 35, 'Accessories', 'https://images.unsplash.com/photo-1593642532400-2682a8a6b541?w=500&h=500&fit=crop', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CHAIR-001', 'Ergonomic Office Chair', 'Premium ergonomic chair with lumbar support, adjustable height, and breathable mesh backrest.', 399.99, 20, 'Furniture', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('DESK-001', 'Electric Standing Desk', 'Adjustable height desk with motor, memory presets, and sturdy construction. 140cm wide.', 499.99, 15, 'Furniture', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=500&fit=crop', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('STORAGE-001', 'External SSD 2TB', 'High-speed 2TB external SSD with USB 3.1, compact design, and shock resistance.', 199.99, 45, 'Storage', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=500&fit=crop', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('BACKUP-001', 'Portable Hard Drive 4TB', 'Reliable 4TB backup hard drive with automatic backup software and password protection.', 129.99, 55, 'Storage', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=500&fit=crop', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('PHONE-001', 'Smartphone Pro Max', 'Latest flagship smartphone with 6.7" display, 5G, advanced camera system, and 12GB RAM.', 1199.99, 18, 'Mobile', 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&h=500&fit=crop', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('TABLET-001', 'Tablet Ultra', '12.9-inch tablet with powerful processor, 8GB RAM, stylus support, and all-day battery.', 799.99, 22, 'Mobile', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=500&fit=crop', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CHARGER-001', 'Fast Charging Dock', 'Multi-device fast charging dock supporting phones, tablets, and AirPods simultaneously.', 59.99, 80, 'Accessories', 'https://images.unsplash.com/photo-1591290621749-9c1efb2c2b47?w=500&h=500&fit=crop', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('SPEAKER-001', 'Bluetooth Speaker Pro', 'Portable bluetooth speaker with 360-degree sound, waterproof design, and 20-hour battery life.', 149.99, 42, 'Audio', 'https://images.unsplash.com/photo-1589003077984-894e133814c9?w=500&h=500&fit=crop', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CAMERA-001', 'Mirrorless Camera 4K', 'Professional mirrorless camera with 4K video, 24MP sensor, and advanced autofocus system.', 1599.99, 12, 'Electronics', 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500&h=500&fit=crop', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('LENS-001', 'Wide Angle Lens 24mm', 'Premium wide-angle lens with f/2.8 aperture, perfect for landscape and architectural photography.', 799.99, 8, 'Electronics', 'https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=500&h=500&fit=crop', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('TRIPOD-001', 'Professional Video Tripod', 'Heavy-duty tripod with fluid head, ball bearing mechanism, and adjustable height up to 6 feet.', 249.99, 28, 'Accessories', 'https://images.unsplash.com/photo-1606933248051-5ce98154ca2d?w=500&h=500&fit=crop', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('LIGHTING-001', 'LED Studio Lighting Kit', 'Complete lighting kit with 3 LED panels, color temperature control, and adjustable brightness.', 399.99, 18, 'Accessories', 'https://images.unsplash.com/photo-1609034227505-5876f6aa4e90?w=500&h=500&fit=crop', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create test users
-- Note: passwords are hashed using bcrypt (password: test123 for all)
INSERT INTO users (email, password, first_name, last_name, role, created_at, updated_at) VALUES
('admin@example.com', '$2a$10$Vf3.hC6zL9KyZKq8kJxRauU4HU6RlFZ5WbjFHqQxG2p/c2RQfCKsW', 'Admin', 'User', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('customer@example.com', '$2a$10$Vf3.hC6zL9KyZKq8kJxRauU4HU6RlFZ5WbjFHqQxG2p/c2RQfCKsW', 'John', 'Customer', 'CUSTOMER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('alice@example.com', '$2a$10$Vf3.hC6zL9KyZKq8kJxRauU4HU6RlFZ5WbjFHqQxG2p/c2RQfCKsW', 'Alice', 'Johnson', 'CUSTOMER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('bob@example.com', '$2a$10$Vf3.hC6zL9KyZKq8kJxRauU4HU6RlFZ5WbjFHqQxG2p/c2RQfCKsW', 'Bob', 'Smith', 'CUSTOMER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create dummy orders
-- Order 1: Laptop and Monitor
INSERT INTO orders (user_id, total_price, status, created_at, updated_at) VALUES
(2, 1899.98, 'DELIVERED', CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP - INTERVAL '25 days');
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 1299.99),
(1, 2, 1, 599.99);

-- Order 2: Gaming Setup
INSERT INTO orders (user_id, total_price, status, created_at, updated_at) VALUES
(3, 879.96, 'SHIPPED', CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP - INTERVAL '15 days');
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(2, 4, 1, 129.99),
(2, 5, 1, 299.99),
(2, 3, 2, 49.99);

-- Order 3: Office Setup
INSERT INTO orders (user_id, total_price, status, created_at, updated_at) VALUES
(4, 989.97, 'PROCESSING', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '8 days');
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(3, 9, 1, 399.99),
(3, 10, 1, 499.99),
(3, 8, 1, 89.99);

-- Order 4: Mobile Devices
INSERT INTO orders (user_id, total_price, status, created_at, updated_at) VALUES
(2, 2399.97, 'DELIVERED', CURRENT_TIMESTAMP - INTERVAL '45 days', CURRENT_TIMESTAMP - INTERVAL '40 days');
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(4, 13, 1, 1199.99),
(4, 14, 1, 799.99),
(4, 15, 1, 59.99);

-- Order 5: Storage and Backup
INSERT INTO orders (user_id, total_price, status, created_at, updated_at) VALUES
(3, 329.98, 'DELIVERED', CURRENT_TIMESTAMP - INTERVAL '55 days', CURRENT_TIMESTAMP - INTERVAL '50 days');
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(5, 11, 1, 199.99),
(5, 12, 1, 129.99);

-- Order 6: Photography Equipment
INSERT INTO orders (user_id, total_price, status, created_at, updated_at) VALUES
(4, 3049.96, 'SHIPPED', CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '10 days');
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(6, 17, 1, 1599.99),
(6, 18, 1, 799.99),
(6, 19, 1, 249.99),
(6, 20, 1, 399.99);

-- Note: Use bcrypt password generator to create proper password hashes
-- Example: https://www.bcryptcalculator.com/
-- Current password for all test users: test123
