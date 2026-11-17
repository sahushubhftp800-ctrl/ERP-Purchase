const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { authenticate, authorize } = require('../middleware/auth');

// All vendor operations require authentication
router.use(authenticate);

// View vendors
router.get('/', vendorController.getVendors);
router.get('/:id', vendorController.getVendorById);

// Create / Edit / Delete (Purchaser or Admin)
router.post('/', authorize('admin', 'purchaser'), vendorController.createVendor);
router.put('/:id', authorize('admin', 'purchaser'), vendorController.updateVendor);
router.delete('/:id', authorize('admin', 'purchaser'), vendorController.deleteVendor);

module.exports = router;
