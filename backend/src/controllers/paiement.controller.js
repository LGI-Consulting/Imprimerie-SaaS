import pool from "../config/db.js";

/**
 * Create a payment and its associated facture
 */
export const createPayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { amount, client_id, payment_method, description } = req.body;

    if (!amount || !client_id || !payment_method) {
      return res.status(400).json({ error: 'Amount, client ID, and payment method are required' });
    }

    await client.query('BEGIN');

    const paymentQuery = `
      INSERT INTO payments(amount, client_id, payment_method, description, payment_date)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
    const paymentResult = await client.query(paymentQuery, [amount, client_id, payment_method, description]);
    const payment = paymentResult.rows[0];

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const factureQuery = `
      INSERT INTO factures(payment_id, client_id, amount, issue_date, due_date, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const factureResult = await client.query(factureQuery, [
      payment.id, client_id, amount, issueDate, dueDate, 'paid'
    ]);
    const facture = factureResult.rows[0];

    await client.query('COMMIT');

    res.status(201).json({
      payment,
      facture,
      message: 'Payment processed and invoice generated successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  } finally {
    client.release();
  }
};

/**
 * Get all payments
 */
export const getAllPayments = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payments ORDER BY payment_date DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

/**
 * Get a payment by ID with its associated facture
 */
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const factureResult = await pool.query('SELECT * FROM factures WHERE payment_id = $1', [id]);
    const facture = factureResult.rows[0] || null;

    res.status(200).json({
      payment: result.rows[0],
      facture
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
};

/**
 * Update a payment and its associated facture (if amount changes)
 */
export const updatePayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { amount, client_id, payment_method, description, status } = req.body;

    const checkResult = await client.query('SELECT * FROM payments WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await client.query('BEGIN');

    const updateQuery = `
      UPDATE payments
      SET amount = $1, client_id = $2, payment_method = $3, description = $4, status = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;
    const result = await client.query(updateQuery, [amount, client_id, payment_method, description, status, id]);

    if (amount) {
      await client.query(
        'UPDATE factures SET amount = $1, updated_at = NOW() WHERE payment_id = $2',
        [amount, id]
      );
    }

    await client.query('COMMIT');

    res.status(200).json({
      payment: result.rows[0],
      message: 'Payment updated successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  } finally {
    client.release();
  }
};

/**
 * Delete a payment and its associated facture
 */
export const deletePayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    const checkResult = await client.query('SELECT * FROM payments WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await client.query('BEGIN');
    await client.query('DELETE FROM factures WHERE payment_id = $1', [id]);
    await client.query('DELETE FROM payments WHERE id = $1', [id]);
    await client.query('COMMIT');

    res.status(200).json({ message: 'Payment and associated invoice deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  } finally {
    client.release();
  }
};

/**
 * Get all factures
 */
export const getAllFactures = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM factures ORDER BY issue_date DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

/**
 * Get a facture by ID with its associated payment
 */
export const getFactureById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM factures WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const paymentResult = await pool.query('SELECT * FROM payments WHERE id = $1', [result.rows[0].payment_id]);
    const payment = paymentResult.rows[0] || null;

    res.status(200).json({
      facture: result.rows[0],
      payment
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

/**
 * Update a facture
 */
export const updateFacture = async (req, res) => {
  try {
    const { id } = req.params;
    const { issue_date, due_date, status } = req.body;

    const checkResult = await pool.query('SELECT * FROM factures WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const result = await pool.query(
      'UPDATE factures SET issue_date = $1, due_date = $2, status = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [issue_date, due_date, status, id]
    );

    res.status(200).json({
      facture: result.rows[0],
      message: 'Invoice updated successfully'
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
};

/**
 * Delete a facture (only if not linked to a payment)
 */
export const deleteFacture = async (req, res) => {
  try {
    const { id } = req.params;

    const checkResult = await pool.query('SELECT * FROM factures WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const facture = checkResult.rows[0];
    if (facture.payment_id) {
      return res.status(400).json({
        error: 'Cannot delete invoice that is associated with a payment. Delete the payment first.'
      });
    }

    await pool.query('DELETE FROM factures WHERE id = $1', [id]);
    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};
