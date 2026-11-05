/**
 * FraudShield AI - Database Seed Script (Supabase)
 * Creates sample users and transactions for testing.
 * Run: node seed.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { supabase } = require('./config/db');

const generateTxnId = () => 'TXN-' + crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 5);

const seed = async () => {
  console.log('🌱 Seeding FraudShield AI database...\n');

  try {
    // Create users
    const salt = await bcrypt.genSalt(10);
    const hashedAdmin = await bcrypt.hash('admin123', salt);
    const hashedUser = await bcrypt.hash('user123', salt);

    const users = [
      { name: 'Admin User', email: 'admin@fraudshield.com', password: hashedAdmin, role: 'admin' },
      { name: 'John Doe', email: 'user1@test.com', password: hashedUser, role: 'user' },
      { name: 'Jane Smith', email: 'user2@test.com', password: hashedUser, role: 'user' },
    ];

    // Upsert users
    for (const user of users) {
      const { data: existing } = await supabase.from('users').select('id').eq('email', user.email).single();
      if (!existing) {
        const { error } = await supabase.from('users').insert(user);
        if (error) console.log(`  User ${user.email}: ${error.message}`);
        else console.log(`  ✅ Created user: ${user.email} (${user.role})`);
      } else {
        console.log(`  ⏭️  User ${user.email} already exists`);
      }
    }

    // Get user IDs
    const { data: allUsers } = await supabase.from('users').select('id, email, role');
    const userMap = {};
    allUsers.forEach(u => { userMap[u.email] = u.id; });

    const regularUsers = allUsers.filter(u => u.role === 'user');
    if (regularUsers.length === 0) { console.log('No regular users found'); return; }

    // Create sample transactions
    const types = ['purchase', 'transfer', 'withdrawal', 'deposit', 'payment', 'refund'];
    const methods = ['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'crypto', 'other'];
    const locations = ['New York, US', 'London, UK', 'Mumbai, India', 'Tokyo, Japan', 'Sydney, AU', 'Berlin, DE', 'Paris, FR', 'Toronto, CA'];
    const merchants = ['Amazon', 'Walmart', 'Target', 'Starbucks', 'Shell Gas', 'Netflix', 'Apple Store', 'Best Buy'];
    const riskLevels = ['LOW', 'LOW', 'LOW', 'LOW', 'MEDIUM', 'MEDIUM', 'HIGH'];

    console.log('\n  Creating sample transactions...');
    let created = 0;

    for (let i = 0; i < 50; i++) {
      const userId = regularUsers[i % regularUsers.length].id;
      const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
      const riskScore = riskLevel === 'LOW' ? Math.floor(Math.random() * 30) :
                        riskLevel === 'MEDIUM' ? 30 + Math.floor(Math.random() * 40) :
                        70 + Math.floor(Math.random() * 30);
      const isFraud = riskLevel === 'HIGH' && Math.random() > 0.5;
      const amount = riskLevel === 'HIGH' ? (5000 + Math.random() * 15000).toFixed(2) :
                     riskLevel === 'MEDIUM' ? (1000 + Math.random() * 5000).toFixed(2) :
                     (10 + Math.random() * 1000).toFixed(2);

      const daysAgo = Math.floor(Math.random() * 30);
      const txnDate = new Date(Date.now() - daysAgo * 86400000).toISOString();

      const reasons = [];
      if (riskLevel !== 'LOW') {
        if (parseFloat(amount) > 5000) reasons.push('High transaction amount');
        if (Math.random() > 0.5) reasons.push('Unusual transaction pattern');
        if (riskLevel === 'HIGH') reasons.push('Multiple risk factors detected');
      }

      const txn = {
        transaction_id: generateTxnId(),
        user_id: userId,
        amount: parseFloat(amount),
        type: types[Math.floor(Math.random() * types.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        country: locations[Math.floor(Math.random() * locations.length)].split(', ')[1] || 'US',
        currency: 'USD',
        payment_method: methods[Math.floor(Math.random() * methods.length)],
        merchant_name: merchants[Math.floor(Math.random() * merchants.length)],
        status: 'completed',
        risk_score: riskScore,
        risk_level: riskLevel,
        prediction: riskLevel === 'HIGH' ? 'Potential Fraud' : riskLevel === 'MEDIUM' ? 'Suspicious Transaction' : 'Normal Transaction',
        is_fraud: isFraud,
        reasons: reasons,
        analyzed_at: txnDate,
        created_at: txnDate,
      };

      const { data: insertedTxn, error } = await supabase.from('transactions').insert(txn).select('id').single();
      if (error) { console.log(`    ⚠️  Txn ${i+1}: ${error.message}`); continue; }
      created++;

      // Create alert for risky transactions
      if (riskLevel !== 'LOW' && insertedTxn) {
        await supabase.from('fraud_alerts').insert({
          transaction_id: insertedTxn.id,
          user_id: userId,
          alert_type: riskLevel === 'HIGH' ? 'high_risk' : 'medium_risk',
          risk_score: riskScore,
          risk_level: riskLevel,
          description: `${riskLevel} risk transaction: ${txn.type} of $${txn.amount}`,
          reasons: reasons,
          status: ['new', 'new', 'reviewed', 'investigating'][Math.floor(Math.random() * 4)],
          created_at: txnDate,
        });
      }
    }

    console.log(`  ✅ Created ${created} transactions with alerts\n`);
    console.log('🎉 Seed complete!\n');
    console.log('Default accounts:');
    console.log('  Admin: admin@fraudshield.com / admin123');
    console.log('  User1: user1@test.com / user123');
    console.log('  User2: user2@test.com / user123\n');
  } catch (error) {
    console.error('Seed error:', error);
  }

  process.exit(0);
};

seed();

