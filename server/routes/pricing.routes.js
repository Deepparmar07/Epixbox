const router = require('express').Router();
const { PriceList, Product, Photo, Gallery } = require('../models/index');
const requireAuth = require('../middleware/auth.middleware');

// Fallback demo products when the DB is unavailable so the public shop remains usable
const DEMO_PRODUCTS = [
  { id: 'demo-print-1', category: 'prints', name: '8x10 Lustre', size: '8x10', paper_type: 'Lustre', price_cents: 1800 },
  { id: 'demo-print-2', category: 'prints', name: '11x14 Fine Art', size: '11x14', paper_type: 'Fine Art', price_cents: 3200 },
  { id: 'demo-digital-1', category: 'digital', name: 'Web Download', size: 'Web', paper_type: '', price_cents: 2500 },
];

// GET /api/pricing/photo/:photoId (public)
router.get('/photo/:photoId', async (req, res, next) => {
  try {
    const photo = await Photo.findByPk(req.params.photoId, {
      attributes: ['id', 'user_id'],
      include: [{ model: Gallery, attributes: ['id', 'visibility'] }],
    });

    if (!photo) return res.status(404).json({ error: 'Photo not found' });
    if (photo.Gallery && photo.Gallery.visibility === 'private') {
      return res.status(403).json({ error: 'Pricing is not available for this photo' });
    }

    let priceList = await PriceList.findOne({
      where: { user_id: photo.user_id, is_default: true },
      order: [['created_at', 'ASC']],
    });

    if (!priceList) {
      priceList = await PriceList.findOne({
        where: { user_id: photo.user_id },
        order: [['created_at', 'ASC']],
      });
    }

    if (!priceList) return res.json([]);

    const products = await Product.findAll({
      where: { price_list_id: priceList.id, is_active: true },
      order: [['sort_order', 'ASC']],
    });

    const response = products.map((p) => {
      const width = Number(p.width_in || 0);
      const height = Number(p.height_in || 0);
      const size = width > 0 && height > 0 ? `${width}x${height}` : p.name;

      return {
        id: p.id,
        category: p.category,
        name: p.name,
        size,
        paper_type: p.paper_type,
        price_cents: p.price_cents,
        photographer_id: photo.user_id,
      };
    });

    // If there are no products for this photographer, fall back to demo products
    if (!response || response.length === 0) {
      const fallback = DEMO_PRODUCTS.map((p) => ({ ...p, photographer_id: photo.user_id }));
      return res.json(fallback);
    }

    res.json(response);
  } catch (err) {
    // If the DB is unreachable (development convenience), return demo products so the public storefront still works
    const msg = String(err?.message || '')
    if (msg.includes('ECONNREFUSED') || msg.toLowerCase().includes('connection') || (err.name && err.name.toLowerCase().includes('sequelize'))) {
      console.warn('Pricing route fallback activated due to DB error:', msg);
      return res.json(DEMO_PRODUCTS);
    }
    next(err);
  }
});

router.use(requireAuth);

// GET /api/pricing/lists
router.get('/lists', async (req, res, next) => {
  try {
    const lists = await PriceList.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Product, order: [['sort_order', 'ASC']] }],
    });
    res.json(lists);
  } catch (err) { next(err); }
});

// POST /api/pricing/lists
router.post('/lists', async (req, res, next) => {
  try {
    const { name, is_default } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const list = await PriceList.create({ user_id: req.user.id, name, is_default: is_default || false });
    res.status(201).json(list);
  } catch (err) { next(err); }
});

// PUT /api/pricing/lists/:id
router.put('/lists/:id', async (req, res, next) => {
  try {
    const list = await PriceList.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!list) return res.status(404).json({ error: 'Price list not found' });
    await list.update({ name: req.body.name, is_default: req.body.is_default });
    res.json(list);
  } catch (err) { next(err); }
});

// DELETE /api/pricing/lists/:id
router.delete('/lists/:id', async (req, res, next) => {
  try {
    const list = await PriceList.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!list) return res.status(404).json({ error: 'Price list not found' });
    await list.destroy();
    res.json({ message: 'Price list deleted' });
  } catch (err) { next(err); }
});

// GET /api/pricing/lists/:id/products
router.get('/lists/:id/products', async (req, res, next) => {
  try {
    const list = await PriceList.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!list) return res.status(404).json({ error: 'Price list not found' });
    const products = await Product.findAll({ where: { price_list_id: req.params.id }, order: [['sort_order', 'ASC']] });
    res.json(products);
  } catch (err) { next(err); }
});

// POST /api/pricing/lists/:id/products
router.post('/lists/:id/products', async (req, res, next) => {
  try {
    const list = await PriceList.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!list) return res.status(404).json({ error: 'Price list not found' });
    const { category, name, description, width_in, height_in, paper_type, price_cents, is_active, sort_order } = req.body;
    if (!category || !name || price_cents == null) {
      return res.status(400).json({ error: 'category, name, and price_cents are required' });
    }
    const product = await Product.create({ price_list_id: req.params.id, category, name, description, width_in, height_in, paper_type, price_cents, is_active, sort_order });
    res.status(201).json(product);
  } catch (err) { next(err); }
});

// PUT /api/pricing/lists/:id/products/:pid
router.put('/lists/:id/products/:pid', async (req, res, next) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.pid, price_list_id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.update(req.body);
    res.json(product);
  } catch (err) { next(err); }
});

// DELETE /api/pricing/lists/:id/products/:pid
router.delete('/lists/:id/products/:pid', async (req, res, next) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.pid, price_list_id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
