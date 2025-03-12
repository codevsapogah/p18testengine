const { sendQuizCompletionEmail, sendCoachNotificationEmail, sendEmail } = require('../utils/email');
const { supabase } = require('../utils/supabase');
const { generateGridPDF } = require('../utils/pdfGenerator');

// Send completion email to user
exports.sendCompletionEmail = async (req, res) => {
  try {
    const { quizId, clientEmail, clientName, language } = req.body;
    
    console.log(`Sending completion email for quiz ${quizId} to ${clientEmail}`);
    
    if (!quizId || !clientEmail || !clientName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Generate a results URL - use grid format directly
    const resultUrl = `${process.env.CLIENT_URL}/results/grid/${quizId}`;
    
    // Get quiz data to generate PDF
    const { data: quizData, error: quizError } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', quizId)
      .single();
    
    if (quizError) {
      console.error('Error fetching quiz data for PDF:', quizError);
      return res.status(500).json({ message: 'Failed to fetch quiz data for PDF' });
    }
    
    console.log(`Quiz data retrieved for PDF generation:`, {
      id: quizData.id,
      created_at: quizData.created_at,
      hasCalculatedResults: !!quizData.calculated_results,
      calculatedResultsLength: quizData.calculated_results ? Object.keys(quizData.calculated_results).length : 0
    });
    
    // Generate PDF
    let pdfBuffer = null;
    try {
      // Base URL for permalinks in the PDF
      const baseUrl = process.env.CLIENT_URL || 'https://p18.kz';
      console.log(`Generating PDF with baseUrl: ${baseUrl}, language: ${language || 'ru'}, quizId: ${quizId}`);
      pdfBuffer = await generateGridPDF(quizData, language || 'ru', quizId, baseUrl);
      console.log(`PDF generated successfully, buffer size: ${pdfBuffer ? pdfBuffer.length : 0} bytes`);
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      // Continue without PDF if generation fails
    }
    
    // Send the email with PDF attachment
    const emailSendResult = await sendQuizCompletionEmail({
      to: clientEmail,
      name: clientName,
      quizId,
      resultUrl,
      language: language || 'ru',
      pdfBuffer,
      fileName: null // Let the email utility determine filename based on data
    });
    
    console.log(`Email sent successfully with message ID: ${emailSendResult.messageId}`);
    console.log(`PDF was ${pdfBuffer ? 'attached' : 'not attached'} to the email`);
    
    res.status(200).json({
      message: 'Email sent successfully',
      pdfIncluded: !!pdfBuffer,
      messageId: emailSendResult.messageId
    });
  } catch (error) {
    console.error('Error sending completion email:', error);
    return res.status(500).json({ message: 'Failed to send completion email' });
  }
};

// Send notification to coach
exports.sendCoachNotification = async (req, res) => {
  try {
    const { quizId, clientName, coachEmail, coachName, language } = req.body;
    
    if (!quizId || !clientName || !coachEmail) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Generate a results URL for the coach - use grid format directly
    const resultUrl = `${process.env.CLIENT_URL}/results/grid/${quizId}`;
    
    // Get quiz data to generate PDF
    const { data: quizData, error: quizError } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', quizId)
      .single();
    
    if (quizError) {
      console.error('Error fetching quiz data for PDF:', quizError);
      return res.status(500).json({ message: 'Failed to fetch quiz data for PDF' });
    }
    
    // Generate PDF
    let pdfBuffer = null;
    try {
      // Base URL for permalinks in the PDF
      const baseUrl = process.env.CLIENT_URL || 'https://p18.kz';
      pdfBuffer = await generateGridPDF(quizData, language || 'ru', quizId, baseUrl);
      console.log('Coach PDF generated successfully');
    } catch (pdfError) {
      console.error('Error generating coach PDF:', pdfError);
      // Continue without PDF if generation fails
    }
    
    // Send the email with PDF attachment
    await sendCoachNotificationEmail({
      to: coachEmail,
      coachName: coachName || 'Coach',
      clientName,
      resultUrl,
      language: language || 'ru',
      pdfBuffer,
      fileName: null // Let the email utility determine filename based on data
    });
    
    // Update the database to indicate coach notification was sent
    const { error } = await supabase
      .from('quiz_results')
      .update({ coach_notified: true, coach_notified_at: new Date() })
      .eq('id', quizId);
      
    if (error) throw error;
    
    return res.status(200).json({ message: 'Coach notification sent successfully' });
  } catch (error) {
    console.error('Error sending coach notification:', error);
    return res.status(500).json({ message: 'Failed to send coach notification' });
  }
};

// Test email route (for admins only)
exports.testEmail = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { to, subject, text } = req.body;
    
    if (!to || !subject || !text) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Send test email
    await sendEmail({
      to,
      subject,
      text,
      html: `<p>${text}</p>`
    });
    
    return res.status(200).json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({ message: 'Failed to send test email' });
  }
}; 