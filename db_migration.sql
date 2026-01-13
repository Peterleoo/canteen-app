-- 数据库迁移脚本：canteen-app与canteen-admin系统对接
-- 目标：统一数据库结构，添加必要的关联关系和优化设计

-- 1. 创建用户表（如果不存在）
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    avatar TEXT,
    email VARCHAR(255) UNIQUE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0.00,
    department_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 创建食堂表（如果不存在）
CREATE TABLE IF NOT EXISTS canteens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    distance VARCHAR(20),
    status VARCHAR(20) DEFAULT 'OPEN',
    contact_phone VARCHAR(20),
    manager VARCHAR(255),
    capacity INTEGER,
    current_orders INTEGER DEFAULT 0,
    is_auto_accept_orders BOOLEAN DEFAULT false,
    auto_accept_delay INTEGER DEFAULT 0,
    weekday_open_time VARCHAR(10) DEFAULT '08:00',
    weekday_close_time VARCHAR(10) DEFAULT '20:00',
    weekend_open_time VARCHAR(10) DEFAULT '09:00',
    weekend_close_time VARCHAR(10) DEFAULT '18:00',
    stock_alert_threshold INTEGER DEFAULT 10,
    is_low_stock_notification BOOLEAN DEFAULT false,
    notification_phones TEXT[],
    is_delivery_active BOOLEAN DEFAULT true,
    delivery_radius DECIMAL(5, 2) DEFAULT 5.00,
    min_delivery_amount DECIMAL(10, 2) DEFAULT 20.00,
    delivery_fee DECIMAL(10, 2) DEFAULT 2.50,
    free_delivery_threshold DECIMAL(10, 2) DEFAULT 50.00,
    default_packaging_fee DECIMAL(10, 2) DEFAULT 0.50,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. 创建商品表（优化现有表）
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    category VARCHAR(50) NOT NULL,
    image TEXT NOT NULL,
    images TEXT[],
    stock INTEGER NOT NULL DEFAULT 0,
    stock_alert INTEGER DEFAULT 10,
    sales INTEGER DEFAULT 0,
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'ACTIVE',
    is_recommended BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_combo BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    canteen_id UUID REFERENCES canteens(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. 创建商品套餐子项表
CREATE TABLE IF NOT EXISTS combo_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. 创建订单表
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    canteen_id UUID REFERENCES canteens(id) ON DELETE SET NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    packaging_fee DECIMAL(10, 2) DEFAULT 0.00,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    delivery_method VARCHAR(20) NOT NULL,
    address_id UUID,
    address_detail TEXT,
    remark TEXT,
    cancel_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. 创建订单项表
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. 创建用户地址表
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    contact_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    area VARCHAR(255) NOT NULL,
    detail TEXT NOT NULL,
    tag VARCHAR(50) DEFAULT 'HOME',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. 创建索引优化
CREATE INDEX IF NOT EXISTS idx_products_canteen_id ON products(canteen_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_canteen_id ON orders(canteen_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);

-- 9. 更新现有表结构（如果需要）
-- 9.1 更新products表，添加缺少的字段
ALTER TABLE IF EXISTS products
    ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS images TEXT[],
    ADD COLUMN IF NOT EXISTS stock_alert INTEGER DEFAULT 10,
    ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_combo BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS canteen_id UUID REFERENCES canteens(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 9.2 更新orders表，添加缺少的字段
ALTER TABLE IF EXISTS orders
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS canteen_id UUID REFERENCES canteens(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS packaging_fee DECIMAL(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS address_id UUID,
    ADD COLUMN IF NOT EXISTS address_detail TEXT,
    ADD COLUMN IF NOT EXISTS remark TEXT,
    ADD COLUMN IF NOT EXISTS cancel_reason TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 10. 创建触发器，自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有表添加updated_at触发器
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN ('users', 'canteens', 'products', 'combo_items', 'orders', 'order_items', 'user_addresses') LOOP
        EXECUTE format('CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();', table_name, table_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 11. 初始化数据（可选）
-- 11.1 初始化默认用户
INSERT INTO users (id, username, name, phone, email, status)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'admin', '管理员', '13800138000', 'admin@example.com', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 11.2 初始化默认食堂
INSERT INTO canteens (id, name, address, status, is_delivery_active)
VALUES 
    ('00000000-0000-0000-0000-000000000001', '万科滨河道店', '滨河道1号', 'OPEN', true),
    ('00000000-0000-0000-0000-000000000002', '一食堂 (A区)', '教学楼A区东侧', 'OPEN', true),
    ('00000000-0000-0000-0000-000000000003', '二食堂 (B区)', '宿舍楼B区南侧', 'OPEN', true)
ON CONFLICT (id) DO NOTHING;

-- 12. 更新现有数据格式（如果需要）
-- 12.1 更新products表的status字段，确保使用正确的枚举值
UPDATE products SET status = 'ACTIVE' WHERE status NOT IN ('ACTIVE', 'INACTIVE');

-- 12.2 更新orders表的status字段，确保使用正确的枚举值
UPDATE orders SET status = 'PENDING' WHERE status NOT IN ('PENDING', 'PREPARING', 'DELIVERING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED');

-- 13. 添加外键约束（如果缺少）
-- 注意：如果表中已有数据，添加外键约束可能会失败，需要先清理或修复数据

-- 13.1 为products表添加canteen_id外键约束
DO $$
BEGIN
    BEGIN
        ALTER TABLE products ADD CONSTRAINT fk_products_canteen_id FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE SET NULL;
    EXCEPTION
        WHEN duplicate_object THEN
            -- 外键约束已存在，忽略错误
            NULL;
    END;
END;
$$ LANGUAGE plpgsql;

-- 13.2 为orders表添加user_id外键约束
DO $$
BEGIN
    BEGIN
        ALTER TABLE orders ADD CONSTRAINT fk_orders_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    EXCEPTION
        WHEN duplicate_object THEN
            -- 外键约束已存在，忽略错误
            NULL;
    END;
END;
$$ LANGUAGE plpgsql;

-- 13.3 为orders表添加canteen_id外键约束
DO $$
BEGIN
    BEGIN
        ALTER TABLE orders ADD CONSTRAINT fk_orders_canteen_id FOREIGN KEY (canteen_id) REFERENCES canteens(id) ON DELETE SET NULL;
    EXCEPTION
        WHEN duplicate_object THEN
            -- 外键约束已存在，忽略错误
            NULL;
    END;
END;
$$ LANGUAGE plpgsql;

-- 14. 清理旧表或字段（如果需要）
-- 注意：清理操作需要谨慎，确保不会丢失重要数据

-- 示例：删除不再使用的字段
-- ALTER TABLE IF EXISTS old_table DROP COLUMN IF EXISTS old_column;

-- 示例：删除不再使用的表
-- DROP TABLE IF EXISTS old_table;

-- 迁移完成
SELECT '数据库迁移完成' AS message;
