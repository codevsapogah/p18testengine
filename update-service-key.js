const fs = require('fs');
const path = require('path');

const NEW_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYXJxaHNobWZyandlbGV6ZGJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDc3MDEyMCwiZXhwIjoyMDU2MzQ2MTIwfQ.eaqH9iXVlszMDy6-J8UTcXqJcPwmZodZpI00qCdOjmE';
const OLD_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYXJxaHNobWZyandlbGV6ZGJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDc3MDEyMCwiZXhwIjoyMDU2MzQ2MTIwfQ.1SJIYw5FMeVg8iQ-oMbPkQfJOXVwsUIQ7V-R4cLdtdI';

// Files to update
const filesToUpdate = [
  '.env',
  '.env.local',
  '.env.production',
  'server/utils/supabase.js',
  'fix_local_auth.js',
  'server/test-server.js',
  'src/supabase.js'
];

let updated = 0;

filesToUpdate.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file contains the old key
    if (content.includes(OLD_SERVICE_KEY)) {
      // Replace all occurrences of the old key with the new key
      const updatedContent = content.replace(new RegExp(OLD_SERVICE_KEY, 'g'), NEW_SERVICE_KEY);
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      
      console.log(`✅ Updated ${filePath}`);
      updated++;
    } else {
      console.log(`No changes needed in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
});

// Update .env.local directly if it exists
try {
  if (fs.existsSync('.env.local')) {
    let envContent = fs.readFileSync('.env.local', 'utf8');
    
    // Add or update SUPABASE_SERVICE_ROLE_KEY
    if (envContent.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
      envContent = envContent.replace(/SUPABASE_SERVICE_ROLE_KEY=.*/g, `SUPABASE_SERVICE_ROLE_KEY=${NEW_SERVICE_KEY}`);
    } else {
      envContent += `\nSUPABASE_SERVICE_ROLE_KEY=${NEW_SERVICE_KEY}\n`;
    }
    
    // Add or update REACT_APP_SUPABASE_SERVICE_ROLE_KEY
    if (envContent.includes('REACT_APP_SUPABASE_SERVICE_ROLE_KEY=')) {
      envContent = envContent.replace(/REACT_APP_SUPABASE_SERVICE_ROLE_KEY=.*/g, `REACT_APP_SUPABASE_SERVICE_ROLE_KEY=${NEW_SERVICE_KEY}`);
    } else {
      envContent += `REACT_APP_SUPABASE_SERVICE_ROLE_KEY=${NEW_SERVICE_KEY}\n`;
    }
    
    fs.writeFileSync('.env.local', envContent, 'utf8');
    console.log('✅ Updated .env.local directly');
  }
} catch (error) {
  console.error('Error updating .env.local directly:', error.message);
}

console.log(`\nUpdated ${updated} files with the new service role key.`);
console.log('Please restart your server for the changes to take effect.'); 