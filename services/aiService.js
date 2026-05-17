const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

// نصيحة: استخدم dotenv لحماية مفتاحك ولا تضعه مباشرة في الكود
const genAI = new GoogleGenerativeAI("AIzaSyAz1cIkgdRjnXQpk6LcxtIBywc1CPVYGzk");

async function analyzeComplaintPriority(title, description) {
    try {
        // 1. إعداد الموديل مع تعطيل القيود التي قد تحجب بلاغات الحوادث
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            // إعدادات الأمان لضمان استقبال كلمات مثل "انفجار" أو "حريق"
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ],
            // إجبار الموديل على إرجاع JSON
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
        أنت خبير تصنيف بلاغات. حلل العنوان والوصف التاليين:
        العنوان: ${title}
        الوصف: ${description}

        التصنيفات المتاحة: ["critical", "high", "medium", "low"]
        قواعد التصنيف:
        - critical: كوارث، تهديد حياة، حريق، غاز.
        - high: انقطاع خدمات كامل، حفر خطيرة.
        - medium: صيانة روتينية، إنارة، نفايات.
        - low: اقتراحات، شكاوى إدارية.

        رد بصيغة JSON كالتالي:
        {"priority": "التصنيف هنا"}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonResponse = JSON.parse(response.text());

        const priority = jsonResponse.priority.toLowerCase();
        
        console.log(`✅ Classified as: ${priority}`);
        
        const validPriorities = ['critical', 'high', 'medium', 'low'];
        return validPriorities.includes(priority) ? priority : 'medium';

    } catch (error) {
        console.error("❌ AI Error Details:", error);
        return 'medium'; 
    }
}
module.exports = {
    analyzeComplaintPriority
};