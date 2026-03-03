require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const app = express();
const port = process.env.PORT || 3000;
const region = process.env.AWS_REGION || "ap-south-1";
const secretName = process.env.SECRET_NAME;

let pool;

async function getSecret() {
  if (!secretName) {
    console.warn("SECRET_NAME not provided, using env vars for DB config");
    return {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'postgres',
      port: process.env.DB_PORT || 5432
    };
  }

  const client = new SecretsManagerClient({ region });
  try {
    const response = await client.send(
      new GetSecretValueCommand({ SecretId: secretName })
    );
    return JSON.parse(response.SecretString);
  } catch (error) {
    console.error("Error retrieving secret:", error);
    throw error;
  }
}

async function initDb() {
  try {
    const secrets = await getSecret();
    const config = {
      host: secrets.host,
      user: secrets.username || secrets.user,
      password: secrets.password,
      database: secrets.database,
      port: secrets.port,
    };

    if (process.env.DB_SSL === 'true' || secretName) {
      config.ssl = { rejectUnauthorized: false };
    }

    pool = new Pool(config);
    console.log("DB Pool initialized");
  } catch (error) {
    console.error("DB Init failed:", error);
  }
}

app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).send('OK');
});

app.get(['/ready', '/api/ready'], async (req, res) => {
  if (!pool) {
    return res.status(500).json({ status: "error", message: "DB pool not initialized" });
  }
  try {
    const result = await pool.query('SELECT version();');
    res.status(200).json({
      status: "ready",
      db_version: result.rows[0].version,
      commit_sha: process.env.COMMIT_SHA || "unknown"
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get('/api/message', (req, res) => {
  res.json({
    message: "Hello from Alpha EKS Backend!",
    commit_sha: process.env.COMMIT_SHA || "unknown"
  });
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
  initDb();
});
