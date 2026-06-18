DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS orders;

CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

INSERT INTO customers (id, name, country) VALUES
  (1, 'Acme', 'US'),
  (2, 'Globex', 'DE'),
  (3, 'Initech', 'US'),
  (4, 'Umbrella', 'UK');

INSERT INTO orders (id, customer_id, amount, status) VALUES
  (1, 1, 1200.00, 'paid'),
  (2, 1, 300.50, 'paid'),
  (3, 2, 900.00, 'pending'),
  (4, 3, 1500.00, 'paid'),
  (5, 3, 250.00, 'refunded'),
  (6, 4, 2000.00, 'paid'),
  (7, 2, 100.00, 'paid');
