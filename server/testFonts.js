const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

console.log('Testing font loading for PDF generation...');

// Check for font files
const fontsDir = path.join(__dirname, 'fonts');
console.log(`Checking for fonts in: ${fontsDir}`);

try {
  if (!fs.existsSync(fontsDir)) {
    console.log('Fonts directory does not exist. Creating it...');
    fs.mkdirSync(fontsDir, { recursive: true });
  }
  
  // Check Roboto fonts
  const robotoRegularPath = path.join(fontsDir, 'Roboto-Regular.ttf');
  const robotoBoldPath = path.join(fontsDir, 'Roboto-Bold.ttf');
  
  if (fs.existsSync(robotoRegularPath)) {
    console.log('✅ Roboto-Regular.ttf found');
    const stats = fs.statSync(robotoRegularPath);
    console.log(`   File size: ${Math.round(stats.size / 1024)} KB`);
  } else {
    console.log('❌ Roboto-Regular.ttf not found');
  }
  
  if (fs.existsSync(robotoBoldPath)) {
    console.log('✅ Roboto-Bold.ttf found');
    const stats = fs.statSync(robotoBoldPath);
    console.log(`   File size: ${Math.round(stats.size / 1024)} KB`);
  } else {
    console.log('❌ Roboto-Bold.ttf not found');
  }
  
  // Test loading fonts in jsPDF
  console.log('\nTesting font loading in jsPDF...');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    encoding: 'UTF-8'
  });
  
  // Try to load Roboto fonts
  if (fs.existsSync(robotoRegularPath)) {
    try {
      const robotoRegularFont = fs.readFileSync(robotoRegularPath, { encoding: 'base64' });
      doc.addFileToVFS('Roboto-Regular.ttf', robotoRegularFont);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      console.log('✅ Successfully added Roboto-Regular to jsPDF');
      
      if (fs.existsSync(robotoBoldPath)) {
        const robotoBoldFont = fs.readFileSync(robotoBoldPath, { encoding: 'base64' });
        doc.addFileToVFS('Roboto-Bold.ttf', robotoBoldFont);
        doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
        console.log('✅ Successfully added Roboto-Bold to jsPDF');
      }
      
      // Test rendering some text
      doc.setFont('Roboto');
      doc.text('Testing Roboto Font - Cyrillic: Привет мир!', 20, 20);
      doc.text('Testing Roboto Font - Kazakh: Сәлем Әлем!', 20, 30);
      
      // Output test PDF
      const testPdfPath = path.join(__dirname, 'font-test.pdf');
      fs.writeFileSync(testPdfPath, doc.output());
      console.log(`✅ Test PDF created at: ${testPdfPath}`);
      
    } catch (fontError) {
      console.error('❌ Error loading fonts in jsPDF:', fontError.message);
    }
  } else {
    console.log('⚠️ Skipping jsPDF test as Roboto fonts are not available');
  }
  
} catch (error) {
  console.error('Error during font test:', error);
} 