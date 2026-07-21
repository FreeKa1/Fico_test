import sql from 'mssql';

const config: sql.config = {
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_NAME || 'FICO',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASS || '',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT !== 'false',
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;
let connecting = false;

export async function getPool(): Promise<sql.ConnectionPool | null> {
  if (pool) return pool;
  if (connecting) {
    // Wait for existing connection attempt
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      if (pool) return pool;
    }
    return null;
  }
  connecting = true;
  try {
    pool = await sql.connect(config);
    return pool;
  } catch (e) {
    console.error('[DB] Connection failed:', (e as Error).message);
    return null;
  } finally {
    connecting = false;
  }
}

export async function query<T = any>(queryStr: string, params?: Record<string, any>): Promise<T[]> {
  const p = await getPool();
  if (!p) throw new Error('Database unavailable');
  const req = p.request();
  if (params) {
    for (const [key, val] of Object.entries(params)) {
      req.input(key, val);
    }
  }
  const result = await req.query(queryStr);
  return result.recordset as T[];
}

export async function execute(procName: string, params?: Record<string, any>) {
  const p = await getPool();
  if (!p) throw new Error('Database unavailable');
  const req = p.request();
  if (params) {
    for (const [key, val] of Object.entries(params)) {
      req.input(key, val);
    }
  }
  return await req.execute(procName);
}

export { sql };
