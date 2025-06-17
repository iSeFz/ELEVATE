import { cleanupExpiredOrders } from "../services/order.js";

export default async function handler(req: any, res: any) {
    // Verify cron job authorization (Vercel provides CRON_SECRET)
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await cleanupExpiredOrders();
        
        res.status(200).json({ 
            success: true, 
            message: 'Order cleanup completed',
            processedCount: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Cleanup cron job failed:', error);
        res.status(500).json({ 
            error: 'Cleanup failed',
            timestamp: new Date().toISOString()
        });
    }
}