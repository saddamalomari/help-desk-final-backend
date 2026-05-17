const mysql = require('mysql2');

// 🚀 إنشاء الـ Pool باستخدام الهيكل التقليدي وتفعيل الـ SSL بشكل إجباري ومضمون
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 14916,
  // 🔥 الصيغة الصريحة والمضمونة لتخطي حظر الاتصال الآمن في سيرفرات Aiven
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// تحويل الـ pool لدعم الـ async/await والـ Promises بشكل سليم
const promisePool = pool.promise();

// اختبار الاتصال فوراً عند التشغيل والطباعة في الـ Terminal
promisePool.getConnection()
  .then(conn => {
    console.log('✅==================================================✅');
    console.log('🚀 Connected to Aiven Cloud MySQL successfully!');
    console.log('✅==================================================✅');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = promisePool;