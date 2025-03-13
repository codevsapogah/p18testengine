const express = require('express');
const router = express.Router();
const { generateGridPDF } = require('../utils/pdfGenerator');

router.post('/generate', async (req, res) => {
  try {
    const { userData, language, quizId } = req.body;

    if (!userData || !language) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    // Generate PDF buffer
    const pdfBuffer = await generateGridPDF(userData, language, quizId, process.env.APP_URL);

    // Create filename
    const date = new Date(userData.created_at);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const safeName = userData.user_name.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_').toLowerCase();
    const filename = `${safeName}_${dateStr}_grid_p18.pdf`;

    // Send PDF as download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error handling PDF:', error);
    res.status(500).json({ error: 'Operation failed' });
  }
});

module.exports = router; 