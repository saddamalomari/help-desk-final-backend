const db = require('../config/db');
const { analyzeComplaintPriority } = require('../services/aiService'); 

exports.addComplaint = async (req, res) => {
    try {
        const { 
            user_id, first_name, last_name, phone, 
            governorate, area, complaint_type, 
            description, auto_lat, auto_lng, map_lat, map_lng 
        } = req.body;

        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // --- خطوة الذكاء الاصطناعي ---
        console.log("🤖 جاري تحليل أهمية البلاغ عبر الذكاء الاصطناعي...");
        const priority = await analyzeComplaintPriority(complaint_type, description);
        console.log(`✅ التصنيف الناتج: ${priority}`);
        // --------------------------

        const query = `
            INSERT INTO complaints 
            (user_id, first_name, last_name, phone, governorate, area, title, description, auto_lat, auto_lng, map_lat, map_lng, image_url, status, priority) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`;

        await db.query(query, [
            user_id, first_name, last_name, phone, 
            governorate, area, complaint_type, 
            description, auto_lat, auto_lng, map_lat, map_lng, imageUrl, priority // إضافة الـ priority هنا
        ]);

        res.status(201).json({ 
            message: "تم تسجيل البلاغ بنجاح", 
            ai_priority: priority 
        });
    } catch (err) {
        console.error("Error in addComplaint:", err);
        res.status(500).json({ message: "خطأ في حفظ البلاغ" });
    }
};

exports.getUserComplaints = async (req, res) => {
    try {
        const userId = req.params.userId;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const query = "SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC LIMIT ?";
        const [results] = await db.query(query, [userId, limit]);
        res.status(200).json(results);
    } catch (err) {
        console.error("Error in getUserComplaints:", err);
        res.status(500).json({ message: "خطأ في جلب شكاوى المستخدم" });
    }
};

exports.getCitizenStats = async (req, res) => {
    const { userId } = req.params;
    try {
        const [userRows] = await db.query("SELECT full_name, email FROM users WHERE id = ?", [userId]);
        const [statsRows] = await db.query(`
            SELECT 
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved_count
            FROM complaints 
            WHERE user_id = ?`, [userId]);

        if (userRows.length === 0) return res.status(404).json({ message: "المستخدم غير موجود" });

        res.status(200).json({
            full_name: userRows[0].full_name,
            email: userRows[0].email,
            pending_count: parseInt(statsRows[0].pending_count) || 0,
            resolved_count: parseInt(statsRows[0].resolved_count) || 0
        });
    } catch (err) {
        res.status(500).json({ message: "خطأ في جلب الإحصائيات" });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const [rows] = await db.query("SELECT id, full_name, email, phone FROM users WHERE id = ?", [userId]);
        if (rows.length === 0) return res.status(404).json({ message: "المستخدم غير موجود" });
        res.status(200).json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: "خطأ في جلب بيانات الحساب" });
    }
};

// ==========================================
// 2. قسم الإشعارات
// ==========================================

exports.getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const [rows] = await db.query(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", 
            [userId]
        );
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ message: "خطأ في جلب الإشعارات" });
    }
};

exports.getUnreadNotificationsCount = async (req, res) => {
    try {
        const { userId } = req.params;
        const [rows] = await db.query(
            "SELECT COUNT(*) AS unreadCount FROM notifications WHERE user_id = ? AND is_read = 0", 
            [userId]
        );
        res.status(200).json({ unreadCount: rows[0].unreadCount });
    } catch (err) {
        res.status(500).json({ message: "خطأ" });
    }
};

exports.markNotificationsAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        const [result] = await db.query(
            "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0", 
            [userId]
        );
        res.status(200).json({ message: "Notifications marked as read" });
    } catch (err) {
        res.status(500).json({ message: "Error updating notification status" });
    }
};

// ==========================================
// 3. قسم الموظف (تم إضافة الترتيب حسب الأولوية)
// ==========================================

exports.getAllComplaints = async (req, res) => {
    try {
        // الترتيب باستخدام FIELD لجعل الحالات الخطيرة تظهر أولاً
        const query = `
            SELECT * FROM complaints 
            ORDER BY 
                FIELD(priority, 'critical', 'high', 'medium', 'low'), 
                created_at DESC`;
        const [results] = await db.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching all complaints:", err);
        res.status(500).json({ message: "Error fetching complaints" });
    }
};

exports.updateComplaintStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const [complaintRows] = await db.query("SELECT user_id, title FROM complaints WHERE id = ?", [id]);
        if (complaintRows.length === 0) return res.status(404).json({ message: "البلاغ غير موجود" });

        const userId = complaintRows[0].user_id;
        const complaintTitle = complaintRows[0].title || "بلاغ ميداني";

        await db.query("UPDATE complaints SET status = ? WHERE id = ?", [status, id]);

        let statusMessage = "";
        if (status === 'resolved') statusMessage = `تم حل بلاغك (${complaintTitle}) بنجاح.`;
        else if (status === 'in_progress') statusMessage = `بدأ العمل على بلاغك (${complaintTitle}).`;
        else if (status === 'rejected') statusMessage = `تم رفض البلاغ (${complaintTitle}).`;

        if (statusMessage !== "") {
            await db.query(
                "INSERT INTO notifications (user_id, complaint_id, title, message) VALUES (?, ?, ?, ?)",
                [userId, id, "تحديث من الإدارة", statusMessage]
            );
        }

        res.status(200).json({ message: "Success" });
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
};

exports.getSystemStats = async (req, res) => {
    try {
        const [statsRows] = await db.query(`
            SELECT 
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS progress_count,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved_count
            FROM complaints`);

        res.status(200).json({
            pending: parseInt(statsRows[0].pending_count) || 0,
            in_progress: parseInt(statsRows[0].progress_count) || 0,
            resolved: parseInt(statsRows[0].resolved_count) || 0
        });
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
};

exports.getEmployeeProfile = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const [rows] = await db.query(
            "SELECT id, full_name, email, phone, role FROM users WHERE id = ? AND role = 'employee'", 
            [employeeId]
        );
        res.status(200).json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
};