const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// List all orders & single order details
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);

// Download PO PDF
router.get('/:id/pdf', orderController.getOrderPdf);

// Create Purchase Order (Purchasers and Admins)
router.post('/', authorize('admin', 'purchaser'), orderController.createOrder);

// Update Draft Purchase Order
router.put('/:id', authorize('admin', 'purchaser'), orderController.updateOrder);

// Workflow state transition (Submit, Approve, Reject, Cancel, Receive)
// Controller handles specific role checks for Approve/Reject vs Submit
router.patch('/:id/status', orderController.updateOrderStatus);

// Delete Draft Purchase Order
router.delete('/:id', authorize('admin', 'purchaser'), orderController.deleteOrder);

module.exports = router;
