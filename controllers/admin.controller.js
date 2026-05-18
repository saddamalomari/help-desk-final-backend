const db = require('../config/db'); // استدعاء اتصال قاعدة البيانات

// 1. جلب إحصائيات لوحة التحكم
exports.getDashboardStats = async (req, res) => {
    try {
        // استعلام لحساب الإجمالي، المعلق، والمحلول من جدول التذاكر (تأكد من أسماء الجداول والأعمدة لديك)
        const [totalTickets] = await db.query('SELECT COUNT(*) as count FROM tickets');
        const [pendingTickets] = await db.query("SELECT COUNT(*) as count FROM tickets WHERE status = 'pending'");
        const [resolvedTickets] = await db.query("SELECT COUNT(*) as count FROM tickets WHERE status = 'resolved'");
        
        // استعلام لحساب عدد الموظفين (مثال: مستخدمين بدور employee أو قاعدة بيانات الموظفين)
        const [totalStaff] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'employee'");

        res.status(200).json({
            total: totalTickets[0].count,
            pending: pendingTickets[0].count,
            resolved: resolvedTickets[0].count,
            staff: totalStaff[0].count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "حدث خطأ أثناء جلب الإحصائيات" });
    }
};

// 2. جلب أحدث التذاكر المضافة
exports.getRecentTickets = async (req, res) => {
    try {
        // جلب آخر 5 تذاكر مضافة مع عمل Join لجلب اسم المستخدم إذا لزم الأمر
        const queryText = `
            SELECT t.id, t.title, t.status, t.category, DATE_FORMAT(t.created_at, '%Y-%m-%d') as created_at, u.name as user_name 
            FROM tickets t
            LEFT JOIN users u ON t.user_id = u.id
            ORDER BY t.created_at DESC 
            LIMIT 5
        `;
        const [tickets] = await db.query(queryText);
        res.status(200).json(tickets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "حدث خطأ أثناء جلب التذاكر الأخيرة" });
    }
};