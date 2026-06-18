-- Demo warehouse schema for the SQL analyst agent
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(id),
  status TEXT CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
  total_usd NUMERIC(12, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  sku TEXT,
  quantity INT,
  unit_price_usd NUMERIC(12, 2)
);