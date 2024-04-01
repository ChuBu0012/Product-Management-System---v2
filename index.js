const express = require("express");
const app = express();
const mysql = require("mysql");
const port = 3000;

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "0012",
  database: "mydb",
});

con.connect((err) => {
  if (err) throw err;
  const query = `CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY, 
      name varchar(255) NOT NULL, 
      category VARCHAR(255),
      price FLOAT,
      stock INT);`;
  con.query(query, (err, results) => {
    if (err) throw err;
    console.log("Table created!");
  });
  console.log("Connected!");
});

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
};

const validateInputData = (req, res, next) => {
  const { name, price, stock } = req.body;

  if (!name || isNaN(price) || isNaN(stock)) {
    res.status(400).send("Invalid input data");
    return;
  }

  next();
};

const getProducts = (req, res) => {
  con.query("SELECT * FROM products", (err, results) => {
    if (err) {
      next(err);
      return;
    }
    res.json(results);
  });
};

const getProduct = (req, res) => {
  const id = req.params.id;
  con.query(`SELECT * FROM products WHERE id = ?`, [id], (err, results) => {
    if (err) {
      next(err);
      return;
    }
    res.json(results);
  });
};

const createProduct = (req, res) => {
  const { name, price, category, stock } = req.body;

  if (!name) {
    res.status(400).send("Name and price are required");
    return;
  } else if (isNaN(price)) {
    res.status(400).send("Price must be a number");
    return;
  } else if (isNaN(stock)) {
    res.status(400).send("Stock must be a number");
    return;
  }

  con.query(
    `INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)`,
    [name, category, price, stock],
    (err, results) => {
      if (err) {
        next(err);
        return;
      }
      res.json(results);
    }
  );
};

const updateProduct = (req, res) => {
  const id = req.params.id;

  con.query(`SELECT * FROM products WHERE id = ?`, [id], (err, results) => {
    if (err) {
      next(err);
      return;
    }
    if (results.length === 0) {
      res.status(404).send("Product not found");
      return;
    }

    const oldProduct = results[0];
    const {
      name = oldProduct.name,
      price = oldProduct.price,
      category = oldProduct.category,
      stock = oldProduct.stock,
    } = req.body;

    if (isNaN(price)) {
      res.status(400).send("Price must be a number");
      return;
    } else if (isNaN(stock)) {
      res.status(400).send("Stock must be a number");
      return;
    }

    con.query(
      `UPDATE products SET name = ?, category = ?, price = ?, stock = ? WHERE id = ?`,
      [name, category, price, stock, id],
      (err, updateResults) => {
        if (err) {
          next(err);
          return;
        }
        res.json(updateResults);
      }
    );
  });
};

const deleteProduct = (req, res) => {
  const id = req.params.id;
  con.query(`DELETE FROM products WHERE id = ?`, [id], (err, result) => {
    if (err) {
      next(err);
      return;
    }
    res.json(result);
  });
};

app.use(express.json());

// middleware handle error
app.use(errorHandler);

app.get("/products", getProducts);

app.get("/product/:id", getProduct);

app.post("/product", validateInputData, createProduct);

app.post("/product/:id", validateInputData, updateProduct);

app.delete("/product/:id", deleteProduct);

app.listen(port, () => {
  console.log("Server is running on port 3000");
});
