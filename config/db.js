const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  // استخدام process.env لقراءة البيانات من Render
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  // إعدادات الـ Pool
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // إعدادات SSL ضرورية جداً للاتصال بـ Aiven
  ssl: {
    rejectUnauthorized: false
  }
});

// اختبار الاتصال عند بدء التشغيل (اختياري ولكنه مفيد)
pool.getConnection()
  .then(connection => {
    console.log('✅ Connected to Aiven Cloud MySQL successfully!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = pool;