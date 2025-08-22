#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Xplit Environment Setup\n');

const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), 'env.example');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists. This will overwrite it.');
  rl.question('Continue? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      setupEnvironment();
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  setupEnvironment();
}

function setupEnvironment() {
  console.log('\n📝 Please provide your Supabase configuration:\n');
  
  rl.question('Supabase Project URL: ', (supabaseUrl) => {
    rl.question('Supabase Anon Key: ', (supabaseAnonKey) => {
      rl.question('App Name (optional, default: Xplit): ', (appName) => {
        rl.question('App Version (optional, default: 1.0.0): ', (appVersion) => {
          
          const envContent = `# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=${supabaseUrl}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}

# App Configuration
EXPO_PUBLIC_APP_NAME=${appName || 'Xplit'}
EXPO_PUBLIC_APP_VERSION=${appVersion || '1.0.0'}
`;

          try {
            fs.writeFileSync(envPath, envContent);
            console.log('\n✅ Environment file created successfully!');
            console.log('📁 File location:', envPath);
            console.log('\n🔧 Next steps:');
            console.log('1. Set up your Supabase database (see ARCHITECTURE.md)');
            console.log('2. Run "npm start" to start the development server');
            console.log('3. Test the authentication flow in the app');
          } catch (error) {
            console.error('❌ Error creating .env file:', error.message);
          }
          
          rl.close();
        });
      });
    });
  });
}
