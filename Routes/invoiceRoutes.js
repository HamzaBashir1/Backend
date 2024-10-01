import express from 'express';
import {
  createInvoice,
  getInvoiceById,
  getAllInvoices,
  updateInvoice,
  deleteInvoice
} from '../Controllers/InvoiceController.js'; // Adjust the path as needed

const router = express.Router();

// Create a new invoice
router.post('/invoices', createInvoice);

// Retrieve an invoice by ID
router.get('/invoices/:id', getInvoiceById);

// List all invoices
router.get('/invoices', getAllInvoices);

// Update an invoice by ID
router.put('/invoices/:id', updateInvoice);

// Delete an invoice by ID
router.delete('/invoices/:id', deleteInvoice);

export default router;
