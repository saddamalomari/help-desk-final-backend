const db = require('../config/db');
// يمكنك إبقاء bcrypt أو حذفه إذا لم تعد تستخدمه في أي مكان آخر
// const bcrypt = require('bcryptjs'); 

// 1. تسجيل مستخدم جديد (بدون تشفير)
exports.register = async (req, res) => {
    const { full_name, email, phone, password } = req.body;
    try {
        // تم إلغاء أسطر الـ salt والـ hash
        await db.query(
            "INSERT INTO users (full_name, email, phone, password, role) VALUES (?, ?, ?, ?, 'citizen')",
            [full_name, email, phone, password] // نرسل الـ password مباشرة هنا
        );
        
        res.status(201).json({ message: "تم التسجيل بنجاح" });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ message: "خطأ في السيرفر أو الإيميل مكرر" });
    }
};

// 2. تسجيل الدخول (مقارنة نصية مباشرة)
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log("-----------------------------------------");
        console.log("📩 محاولة دخول بالإيميل:", email);

        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        
        if (rows.length > 0) {
            const user = rows[0];
            console.log("✅ مستخدم موجود في الداتابيز. الـ Role هو:", user.role);

            // تم استبدال bcrypt.compare بمقارنة عادية (===)
            const isMatch = (password === user.password);
            console.log("🔑 نتيجة مطابقة الباسورد:", isMatch);

            if (isMatch) {
                const { password: _, ...userData } = user; 
                res.status(200).json({ user: userData });
            } else {
                res.status(401).json({ message: "كلمة المرور غير صحيحة" });
            }
        } else {
            console.log("❌ الإيميل غير موجود أصلاً");
            res.status(404).json({ message: "المستخدم غير موجود" });
        }
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "خطأ في السيرفر" });
    }
};

// 3. تغيير كلمة المرور (بدون تشفير)
exports.changePassword = async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;
        const [users] = await db.query("SELECT password FROM users WHERE id = ?", [userId]);
        if (users.length === 0) return res.status(404).json({ message: "المستخدم غير موجود" });

        // مقارنة مباشرة للباسورد القديم
        const isMatch = (oldPassword === users[0].password);
        if (!isMatch) return res.status(400).json({ message: "كلمة المرور القديمة غير صحيحة" });

        // تحديث بالباسورد الجديد مباشرة بدون hashing
        await db.query("UPDATE users SET password = ? WHERE id = ?", [newPassword, userId]);

        res.status(200).json({ message: "تم تغيير كلمة المرور بنجاح" });
    } catch (err) {
        console.error("Change Password Error:", err);
        res.status(500).json({ message: "خطأ في الخادم" });
    }
};