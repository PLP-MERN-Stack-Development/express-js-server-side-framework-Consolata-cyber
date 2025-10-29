const products = require('../data/products');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/products
exports.getAllProducts = asyncHandler(async (req, res) => {
  let result = [...products];
  const { category, search, page = 1, limit = 10 } = req.query;

  if (category) {
    result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }

  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  const paginated = result.slice(start, end);

  res.json({
    page: Number(page),
    limit: Number(limit),
    total: result.length,
    data: paginated,
  });
});

// GET /api/products/:id
exports.getProductById = asyncHandler(async (req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.json(product);
});

// POST /api/products
exports.createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  const newProduct = { id: uuidv4(), name, description, price, category, inStock };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) throw new AppError('Product not found', 404);
  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
});

// DELETE /api/products/:id
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) throw new AppError('Product not found', 404);
  products.splice(index, 1);
  res.status(204).send();
});

// GET /api/products/stats
exports.getProductStats = asyncHandler(async (req, res) => {
  const stats = products.reduce((acc, p) => {
    const cat = p.category || 'uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  res.json({ total: products.length, byCategory: stats });
});
