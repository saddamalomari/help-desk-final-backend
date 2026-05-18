const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan'); 
const bcrypt = require('bcryptjs'); 
const db = require('./config/db'); 
require('dotenv').config();

// 1. استيراد الـ Routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaint.routes');
const employeeRoutes = require('./routes/employeeRoutes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// 2. Middlewares (يجب أن تكون قبل المسارات دائماً لقراءة البيانات القادمة من الفلاتر)
app.use(cors());
app.use(morgan('dev')); 
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. إعداد مجلد المرفقات
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 🎯 راوت المسار الرئيسي (فحص تشغيل السيرفر) ---
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "🚀 Alomari Help Desk API is Live",
        owner: "Saddam Alomari",
        status: "Running Successfully",
        database: "Connected to Aiven Cloud"
    });
});

// --- 🛠️ راوت مؤقت لتصليح حساب الأدمن ---
app.get('/fix-admin-now', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("123456", salt);

        const [result] = await db.query(
            "UPDATE users SET password = ?, role = 'admin' WHERE email = 'admin@support.jo'",
            [hashedPassword]
        );

        if (result.affectedRows === 0) {
            return res.send("❌ لم يتم العثور على مستخدم بهذا الإيميل.");
        }

        res.send("✅ تم تحديث باسوورد الأدمن بنجاح! جرب ادخل بـ 123456");
    } catch (err) {
        console.error("Fix Admin Error:", err);
        res.status(500).send("خطأ في السيرفر: " + err.message);
    }
});

// 4. تعريف المسارات (Endpoints) الموحدة بـ /api لتتطابق مع الفلاتر 100%
app.use('/api/auth', authRoutes);         // تفعيل /api/auth لشاشة المواطن والتسجيل
app.use('/api/complaints', complaintRoutes); 
app.use('/api/employee', employeeRoutes);
app.use('/api/admin', adminRoutes);       // تفعيل مسار الأدمن الموحد في مكانه الصحيح

// 5. Global Error Handler
app.use((err, req, res, next) => {
    console.error("⚠️ خطأ في السيرفر:", err.stack);
    res.status(500).json({ 
        message: "حدث خطأ داخلي في السيرفر",
        error: process.env.NODE_ENV === 'development' ? err.message : {} 
    });
});

// 6. تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log("-----------------------------------------");
    console.log(`🚀 Help Desk Server Started Successfully`);
    console.log(`📡 Port: ${PORT}`);
    console.log("-----------------------------------------");
});