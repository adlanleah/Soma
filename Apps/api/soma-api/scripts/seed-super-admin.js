require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');

function askHidden(question) {
  return new Promise((resolve) => {
    const readline = require('readline');
    process.stdout.write(question);
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = () => {};           // swallow keystrokes so the password isn't echoed
    rl.question('', (answer) => { rl.close(); process.stdout.write('\n'); resolve(answer); });
  });
}

(async () => {
  const [, , name, email] = process.argv;
  if (!name || !email) {
    console.error('Usage: node scripts/seed-super-admin.js "Full Name" email@example.com');
    process.exit(1);
  }

  const password = await askHidden('Password (min 12 characters): ');
  if (password.length < 12) {
    console.error('Password too short.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  // Re-running this for the same email resets that account's password
  await client.query(
    `INSERT INTO super_admins (id, name, email, password_hash, created_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name`,
    [randomUUID(), name, email.trim().toLowerCase(), hash],
  );
  await client.end();
  console.log('Super admin saved.');
})();