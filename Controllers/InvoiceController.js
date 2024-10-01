import Invoice from '../models/Invoice.js'; // Adjust the path as needed
import Host from '../models/Host.js'; // Adjust the path as needed

// Create a new invoice
export const createInvoice = async (req, res) => {
  try {
    const { host, amount, status, dueDate } = req.body;

    // Ensure the host exists
    const existingHost = await Host.findById(host);
    if (!existingHost) {
      return res.status(404).json({ message: 'Host not found' });
    }

    const invoice = new Invoice({
      host,
      amount,
      status,
      dueDate
    });

    await invoice.save();
    return res.status(201).json({ message: 'Invoice created successfully', invoice });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Retrieve an invoice by ID
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id).populate('host').exec();

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    return res.status(200).json(invoice);
  } catch (error) {
    console.error('Error retrieving invoice:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// List all invoices
export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('host').exec();
    return res.status(200).json(invoices);
  } catch (error) {
    console.error('Error listing invoices:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update an invoice by ID
export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Ensure the host exists if it's being updated
    if (updates.host) {
      const existingHost = await Host.findById(updates.host);
      if (!existingHost) {
        return res.status(404).json({ message: 'Host not found' });
      }
    }

    const invoice = await Invoice.findByIdAndUpdate(id, updates, { new: true });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    return res.status(200).json({ message: 'Invoice updated successfully', invoice });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete an invoice by ID
export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Invoice.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    return res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
