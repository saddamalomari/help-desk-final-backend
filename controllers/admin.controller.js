const db = require('../config/db');

// 1. جلب إحصائيات لوحة التحكم
exports.getDashboardStats = async (req, res) => {
    try {
        const [totalTickets] = await db.query('SELECT COUNT(*) as count FROM complaints');
        const [pendingTickets] = await db.query("SELECT COUNT(*) as count FROM complaints WHERE status = 'pending'");
        const [resolvedTickets] = await db.query("SELECT COUNT(*) as count FROM complaints WHERE status = 'resolved'");
        const [totalStaff] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'employee'");

        res.status(200).json({
            total: totalTickets[0].count,
            pending: pendingTickets[0].count,
            resolved: resolvedTickets[0].count,
            staff: totalStaff[0].count
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. جلب أحدث الشكاوى المتوافقة بالكامل مع بنية الداتابيز والفلاتر
exports.getRecentTickets = async (req, res) => {
    try {
        const queryText = `
            SELECT c.id, c.title, c.status, c.category, c.created_at, u.full_name as user_name 
            FROM complaints c
            LEFT JOIN users u ON c.user_id = u.id
            ORDER BY c.created_at DESC 
            LIMIT 5
        `;
        const [complaints] = await db.query(queryText);
        res.status(200).json(complaints);
    } catch (error) {
        console.error("❌ الخطأ الداخلي في جلب التذاكر الأخيرة:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// 3. جلب الموظفين لشاشة إدارة الموظفين في الفلاتر
exports.getEmployees = async (req, res) => {
    try {
        const [employees] = await db.query("SELECT id, full_name as name, email, created_at FROM users WHERE role = 'employee'");
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }


};

// 4. جلب قائمة التصنيفات المحدثة لتتوافق مع كائنات الفلاتر 100%
exports.getCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT DISTINCT category FROM complaints WHERE category IS NOT NULL');
        
        // 🎯 قمنا هنا بتحويل المصفوفة إلى كائنات تحتوي على حقل 'name' لحل مشكلة الـ TypeError
        const categoryList = categories.map((c, index) => ({
            id: index + 1, // إعطاء رقم تعريفي تلقائي مؤقت للتصميم
            name: c.category
        }));
        
        res.status(200).json(categoryList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};