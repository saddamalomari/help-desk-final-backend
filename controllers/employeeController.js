const db = require('../config/db');

// 1. تحديث حالة البلاغ + إرسال إشعار للمواطن تلقائياً
exports.updateComplaintStatus = async (req, res) => {
    const { id } = req.params; // معرف البلاغ
    const { status } = req.body; // الحالة الجديدة

    console.log("-----------------------------------------");
    console.log(`🚀 محاولة تحديث البلاغ رقم: ${id} إلى حالة: ${status}`);

    try {
        // أ. جلب بيانات البلاغ عشان نعرف صاحب الشكوى
        const [complaintRows] = await db.query(
            "SELECT user_id, title FROM complaints WHERE id = ?",
            [id]
        );

        if (complaintRows.length === 0) {
            console.log("❌ خطأ: البلاغ غير موجود في قاعدة البيانات.");
            return res.status(404).json({ message: "البلاغ غير موجود" });
        }

        const userId = complaintRows[0].user_id;
        const complaintTitle = complaintRows[0].title || "بلاغ ميداني";

        // ب. تحديث الحالة في جدول البلاغات
        await db.query("UPDATE complaints SET status = ? WHERE id = ?", [status, id]);
        console.log("✅ تم تحديث الحالة في جدول complaints.");

        // ج. صياغة الإشعار للمواطن بناءً على الحالة
        let statusMessage = "";
        if (status === 'resolved') {
            statusMessage = `أبشر! تم حل بلاغك (${complaintTitle}) بنجاح. شكراً لتعاونك!`;
        } else if (status === 'in_progress') {
            statusMessage = `بدأ العمل على بلاغك (${complaintTitle})، سنوافيك بالتفاصيل قريباً.`;
        } else if (status === 'rejected') {
            statusMessage = `نعتذر منك، تم رفض البلاغ (${complaintTitle}) لمخالفته الشروط.`;
        }

        // د. زراعة الإشعار في جدول notifications
        if (statusMessage !== "") {
            await db.query(
                "INSERT INTO notifications (user_id, complaint_id, title, message) VALUES (?, ?, ?, ?)",
                [userId, id, "تحديث من الإدارة", statusMessage]
            );
            console.log(`🔔 تم إرسال الإشعار للمواطن رقم ${userId} بنجاح!`);
        }

        console.log("-----------------------------------------");
        res.status(200).json({ message: "Success" });

    } catch (err) {
        console.error("❌ وقع خطأ في السيرفر:", err.message);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// 2. جلب كافة البلاغات للموظف
exports.getAllComplaints = async (req, res) => {
    try {
        const query = "SELECT * FROM complaints ORDER BY created_at DESC";
        const [results] = await db.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error("Error in getAllComplaints (Employee):", err);
        res.status(500).json({ message: "خطأ في جلب كافة البيانات" });
    }
};

// 3. جلب إحصائيات النظام (اللوحة الرئيسية للموظف)
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
        console.error("Error in getSystemStats:", err);
        res.status(500).json({ message: "خطأ في جلب إحصائيات النظام" });
    }
};

// 4. جلب بيانات الملف الشخصي للموظف
exports.getEmployeeProfile = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const [rows] = await db.query(
            "SELECT id, full_name, email, phone, role FROM users WHERE id = ? AND role = 'employee'", 
            [employeeId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "الموظف غير موجود" });
        }

        res.status(200).json(rows[0]);
    } catch (err) {
        console.error("Error in getEmployeeProfile:", err);
        res.status(500).json({ message: "خطأ في جلب بيانات الحساب" });
    }
};