const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// View products and categories
router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProductById);

// Create / Edit / Delete (Purchaser or Admin)
router.post('/', authorize('admin', 'purchaser'), productController.createProduct);
router.put('/:id', authorize('admin', 'purchaser'), productController.updateProduct);
router.delete('/:id', authorize('admin', 'purchaser'), productController.deleteProduct);

module.exports = router;
