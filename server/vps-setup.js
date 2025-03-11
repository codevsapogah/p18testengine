/**
 * VPS Multiple Projects Setup Helper
 * 
 * This script helps you determine the right configuration 
 * for running multiple projects on the same VPS.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for input
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setup() {
  console.log('\n=== VPS Multi-Project Configuration Helper ===\n');
  
  // Get project name
  const projectName = await question('Enter a name for this project: ');
  
  // Get domain information
  const domain = await question('Enter the domain for this project (e.g., p18.example.com): ');
  
  // Get port number
  const port = await question('Enter the port number for this project (e.g., 3031, 8080): ');
  
  // Get if SSL will be used
  const useSSL = (await question('Will this project use SSL/HTTPS? (y/n): ')).toLowerCase() === 'y';
  
  // Create production environment file
  const envContent = `NODE_ENV=production
PORT=${port}
JWT_SECRET=P18_a8s7d6f5g4h3j2k1l0q9w8e7r6t5y4u3i2o1p
CLIENT_URL=${useSSL ? 'https' : 'http'}://${domain}
SUPABASE_URL=https://pjarqhshmfrjwelezdbj.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYXJxaHNobWZyandlbGV6ZGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NzAxMjAsImV4cCI6MjA1NjM0NjEyMH0.3wbtZpbaISmV745HZ8gZxxuBM9ppUXTJxBSVtL-WpRg

# Email Configuration - Update with your actual email service
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-email-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=P18 Platform
`;

  // Create React environment file
  const reactEnvContent = `REACT_APP_API_URL=${useSSL ? 'https' : 'http'}://${domain}/api
REACT_APP_SUPABASE_URL=https://pjarqhshmfrjwelezdbj.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYXJxaHNobWZyandlbGV6ZGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NzAxMjAsImV4cCI6MjA1NjM0NjEyMH0.3wbtZpbaISmV745HZ8gZxxuBM9ppUXTJxBSVtL-WpRg
`;

  // Create Nginx configuration
  const nginxConfig = `server {
    ${useSSL ? '# Redirect HTTP to HTTPS\n    listen 80;\n    server_name ' + domain + ';\n    return 301 https://$host$request_uri;\n}\n\nserver {' : ''}
    ${useSSL ? '    listen 443 ssl;' : '    listen 80;'}
    server_name ${domain};
    
    ${useSSL ? '    # SSL configuration\n    ssl_certificate /etc/letsencrypt/live/' + domain + '/fullchain.pem;\n    ssl_certificate_key /etc/letsencrypt/live/' + domain + '/privkey.pem;\n    ssl_protocols TLSv1.2 TLSv1.3;\n    ssl_prefer_server_ciphers on;\n' : ''}
    
    location / {
        proxy_pass http://localhost:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}`;

  // Create PM2 configuration
  const pm2Config = {
    name: projectName,
    script: 'server.js',
    cwd: '/path/to/your/app/server',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: port
    }
  };

  const pm2ConfigJson = JSON.stringify({
    apps: [pm2Config]
  }, null, 2);

  // Write files
  fs.writeFileSync(path.join(__dirname, `.env.${projectName}`), envContent);
  fs.writeFileSync(path.join(__dirname, `../env.${projectName}`), reactEnvContent);
  fs.writeFileSync(path.join(__dirname, `${projectName}.nginx.conf`), nginxConfig);
  fs.writeFileSync(path.join(__dirname, `${projectName}.pm2.json`), pm2ConfigJson);

  console.log('\n=== Configuration Files Created ===');
  console.log(`1. Server .env file: server/.env.${projectName}`);
  console.log(`2. React .env file: .env.${projectName}`);
  console.log(`3. Nginx config: server/${projectName}.nginx.conf`);
  console.log(`4. PM2 config: server/${projectName}.pm2.json`);
  
  console.log('\n=== VPS Deployment Instructions ===');
  console.log('1. Upload your project to your VPS');
  console.log(`2. Copy .env.${projectName} to server/.env`);
  console.log(`3. Copy env.${projectName} to .env.production`);
  console.log('4. Build the React app: npm run build');
  console.log('5. Install server dependencies: cd server && npm install --production');
  console.log(`6. Start the server with PM2: pm2 start ${projectName}.pm2.json`);
  console.log(`7. Set up Nginx: sudo cp ${projectName}.nginx.conf /etc/nginx/sites-available/${domain}`);
  console.log(`8. Enable site: sudo ln -s /etc/nginx/sites-available/${domain} /etc/nginx/sites-enabled/`);
  console.log('9. Test Nginx config: sudo nginx -t');
  console.log('10. Reload Nginx: sudo systemctl reload nginx');
  
  if (useSSL) {
    console.log('\n=== SSL Setup with Certbot ===');
    console.log(`sudo certbot --nginx -d ${domain}`);
  }
  
  rl.close();
}

setup(); 