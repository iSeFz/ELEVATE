import { admin, FIREBASE_COLLECTIONS } from '../config/firebase.js';
import { Role, roles } from '../config/roles.js';
import { BrandOwner } from '../types/models/brandOwner.js';
import { Order, OrderStatus } from '../types/models/order.js';
import { deleteCredentialsUsingUID } from './auth.js';

const firestore = admin.firestore();
const brandOwnerCollection = firestore.collection(FIREBASE_COLLECTIONS['brandOwner']);
const brandManagerCollection = firestore.collection(FIREBASE_COLLECTIONS['brandManager']);

/**
 * Get all brand owners
 * @returns {Promise<BrandOwner[]>} Array of brand owners
 */
export const getAllBrandOwners = async (): Promise<BrandOwner[]> => {
    try {
        const snapshot = await brandOwnerCollection.get();
        return snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        } as BrandOwner));
    } catch (error) {
        console.error('Error getting all brand owners:', error);
        throw new Error('Failed to retrieve brand owners');
    }
};

/**
 * Get a brand owner by ID
 * @param {string} id - Brand owner ID
 * @param {Role} [userType] - Optional user type to determine which collection to query (BrandManager or BrandOwner)
 * @returns {Promise<BrandOwner|null>} Brand owner object or null if not found
 */
export const getBrandOwnerById = async (id: string, userType?: Role): Promise<BrandOwner | null> => {
    try {
        let doc;
        if (userType === roles["brandManager"]) {
            doc = await brandManagerCollection.doc(id).get();
        } else {
            doc = await brandOwnerCollection.doc(id).get();
        }

        if (!doc.exists) {
            return null;
        }

        return {
            ...doc.data(),
            id: doc.id,
        } as BrandOwner;
    } catch (error) {
        console.error(`Error getting brand owner with ID ${id}:`, error);
        throw new Error(`Failed to retrieve brand owner with ID ${id}`);
    }
};

/**
 * Update a brand owner
 * @param {string} id - Brand owner ID
 * @param {Partial<BrandOwner>} data - Brand owner data to update
 * @returns {Promise<BrandOwner|null>} Updated brand owner or null if not found
 */
export const updateBrandOwner = async (
    id: string,
    data: Partial<BrandOwner>,
    userType?: Role
) => {
    try {
        const { id: _, ...updateData } = data;

        // Update the document
        if (userType === roles["brandManager"]) {
            const brandManagerDoc = await brandManagerCollection.doc(id).get();
            if (!brandManagerDoc.exists) {
                return null;
            }
            await brandManagerCollection.doc(id).update(updateData);
        } else {
            const brandOwnerDoc = await brandOwnerCollection.doc(id).get();
            if (!brandOwnerDoc.exists) {
                return null;
            }
            await brandOwnerCollection.doc(id).update(updateData);
        }
        return true;
    } catch (error) {
        console.error(`Error updating brand owner with ID ${id}:`, error);
        throw new Error(`Failed to update brand owner with ID ${id}`);
    }
};

/**
 * Delete a brand owner
 * @param {string} id - Brand owner ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export const deleteBrandOwner = async (id: string): Promise<boolean> => {
    try {
        // Check if brand owner exists
        const brandOwnerDoc = await brandOwnerCollection.doc(id).get();

        if (!brandOwnerDoc.exists) {
            return false;
        }

        // Delete the document
        await brandOwnerCollection.doc(id).delete();

        // Then, delete the customer from Firebase Authentication
        await deleteCredentialsUsingUID(id);

        return true;
    } catch (error) {
        console.error(`Error deleting brand owner with ID ${id}:`, error);
        throw new Error(`Failed to delete brand owner with ID ${id}`);
    }
};

/**
 * Interface for brand reviews summary statistics
 */
interface BrandReviewsSummary {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
        '1': number;
        '2': number;
        '3': number;
        '4': number;
        '5': number;
    };
    productReviews: Array<{
        productId: string;
        productName: string;
        totalReviews: number;
        averageRating: number;
        ratingDistribution: {
            '1': number;
            '2': number;
            '3': number;
            '4': number;
            '5': number;
        };
    }>;
}

/**
 * Get comprehensive reviews summary for all products owned by a brand
 * Aggregates review data from all brand products using pre-computed product review summaries
 * @param {string} brandId - Brand ID to get reviews for
 * @returns {Promise<BrandReviewsSummary>} Aggregated reviews data across all brand products
 */
export const getBrandReviewsSummary = async (brandId: string): Promise<BrandReviewsSummary> => {
    try {
        // Get all products for the brand
        const productsSnapshot = await firestore.collection(FIREBASE_COLLECTIONS['product'])
            .where('brandId', '==', brandId)
            .get();

        // Initialize aggregation variables
        let totalReviews = 0;
        let totalRatingSum = 0;
        const brandRatingDistribution = {
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0
        };

        const productReviews: BrandReviewsSummary['productReviews'] = [];

        // Process each product
        productsSnapshot.forEach(doc => {
            const product = doc.data();
            const productId = doc.id;
            const productName = product.name ?? 'Unknown Product';
            const reviewSummary = product.reviewSummary;

            // Skip products without review summaries
            if (!reviewSummary || typeof reviewSummary !== 'object') {
                productReviews.push({
                    productId,
                    productName,
                    totalReviews: 0,
                    averageRating: 0,
                    ratingDistribution: {
                        '1': 0,
                        '2': 0,
                        '3': 0,
                        '4': 0,
                        '5': 0
                    }
                });
                return;
            }

            const productTotalReviews = reviewSummary.totalReviews ?? 0;
            const productAverageRating = reviewSummary.averageRating ?? 0;
            const productRatingDistribution = reviewSummary.ratingDistribution ?? {
                '1': 0, '2': 0, '3': 0, '4': 0, '5': 0
            };

            // Add to product reviews array
            productReviews.push({
                productId,
                productName,
                totalReviews: productTotalReviews,
                averageRating: Math.round(productAverageRating * 100) / 100, // Round to 2 decimal places
                ratingDistribution: { ...productRatingDistribution }
            });

            // Aggregate for brand totals
            totalReviews += productTotalReviews;
            totalRatingSum += (productAverageRating * productTotalReviews);

            // Aggregate rating distribution
            Object.keys(brandRatingDistribution).forEach(rating => {
                brandRatingDistribution[rating as keyof typeof brandRatingDistribution] +=
                    productRatingDistribution[rating as keyof typeof productRatingDistribution] ?? 0;
            });
        });

        // Calculate brand average rating
        const brandAverageRating = totalReviews > 0 ? totalRatingSum / totalReviews : 0;

        // Sort products by total reviews (most reviewed first)
        productReviews.sort((a, b) => b.totalReviews - a.totalReviews);

        return {
            totalReviews,
            averageRating: Math.round(brandAverageRating * 100) / 100, // Round to 2 decimal places
            ratingDistribution: brandRatingDistribution,
            productReviews
        };

    } catch (error) {
        console.error(`Error getting brand reviews summary for brand id ${brandId}:`, error);
        throw new Error(`Failed to retrieve brand reviews summary for brand id ${brandId}`);
    }
};

interface CurrentMonthStats {
    totalProductsSold: number;
    totalSales: number;
    topProduct: {
        productId: string;
        productName: string;
        quantitySold: number;
        totalSales: number;
    } | null;
    topProductsSales: Array<{
        productId: string;
        productName: string;
        quantitySold: number;
        totalSales: number;
    }>;
}

interface MonthlySalesData {
    year: number;
    month: number;
    monthName: string;
    totalSales: number;
    totalProductsSold: number;
    orderCount: number;
}

interface MonthsSales {
    data: MonthlySalesData[];
    summary: {
        totalPeriodSales: number;
        totalPeriodProducts: number;
        totalPeriodOrders: number;
        averageMonthlySales: number;
        highestSalesMonth: MonthlySalesData | null;
        lowestSalesMonth: MonthlySalesData | null;
    };
}

interface BrandOwnerMonthSalesStats {
    currentMonthStats: CurrentMonthStats;
    monthsSales: MonthsSales;
}

/**
 * Get comprehensive brand owner dashboard data in a single optimized query
 * Combines current month stats, reviews summary, and sales chart data
 * @param {string} brandId - Brand ID to filter by
 * @param {object} options - Configuration options for the dashboard
 * @param {number} options.monthsBack - Number of months for monthly chart (default: 12)
 * @param {number} options.topProductsLimit - Number of top products to return (default: 10)
 * @returns {Promise<BrandOwnerDashboard>} Complete dashboard data
 */
export const getBrandOwnerMonthSalesStats = async (
    brandId: string,
    options: {
        monthsBack?: number;
        topProductsLimit?: number;
    }
): Promise<BrandOwnerMonthSalesStats> => {
    try {
        // Validate input
        if (!brandId) {
            throw new Error('Brand ID is required');
        }

        const {
            monthsBack = 12,
            topProductsLimit = 10
        } = options;

        if (monthsBack < 1 || monthsBack > 24) {
            throw new Error('monthsBack must be between 1 and 24');
        }

        // Calculate date ranges for different analyses
        const now = new Date();

        // Current month boundaries for current stats
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Chart date boundaries
        const chartStartDate = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1);
        const chartEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Use the broader date range to fetch all necessary orders
        const overallStartDate = new Date(Math.min(currentMonthStart.getTime(), chartStartDate.getTime()));
        const overallEndDate = new Date(Math.max(currentMonthEnd.getTime(), chartEndDate.getTime()));

        // Convert to Firestore timestamps
        const startTimestamp = admin.firestore.Timestamp.fromDate(overallStartDate);
        const endTimestamp = admin.firestore.Timestamp.fromDate(overallEndDate);

        // Valid statuses for completed sales
        const validStatuses = [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED];

        // Single optimized query to fetch all required orders
        const ordersSnapshot = await firestore.collection(FIREBASE_COLLECTIONS['order'])
            .where('brandIds', 'array-contains', brandId)
            .where('status', 'in', validStatuses)
            .where('createdAt', '>=', startTimestamp)
            .where('createdAt', '<=', endTimestamp)
            .orderBy('createdAt', 'desc')
            .get();

        // Convert orders to array for easier processing
        const orders = ordersSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        } as Order));

        // Process current month stats
        const currentMonthStats = processCurrentMonthStats(
            orders,
            brandId,
            currentMonthStart,
            currentMonthEnd,
            topProductsLimit
        );

        // Process sales chart data
        const salesChart = processMonthlySalesData(orders, brandId, monthsBack, now)

        return {
            currentMonthStats,
            monthsSales: salesChart,
        };

    } catch (error) {
        console.error(`Error getting brand owner dashboard for brand id ${brandId}:`, error);
        throw new Error(`Failed to retrieve brand owner dashboard for brand id ${brandId}`);
    }
};

/**
 * Process current month statistics from pre-fetched orders
 */
function processCurrentMonthStats(
    orders: Order[],
    brandId: string,
    startDate: Date,
    endDate: Date,
    topProductsLimit: number
): CurrentMonthStats {
    // Initialize tracking variables
    let totalProductsSold = 0;
    let totalSales = 0;
    const productMap = new Map<string, {
        productId: string;
        productName: string;
        quantitySold: number;
        totalSales: number;
    }>();

    // Filter orders for current month and process
    orders.forEach(order => {
        const orderDate = (order.createdAt as admin.firestore.Timestamp).toDate();

        // Check if order is within current month
        if (orderDate >= startDate && orderDate <= endDate) {
            order.products.forEach(product => {
                if (product.brandId === brandId) {
                    const productTotalPrice = product.price * product.quantity;

                    // Update overall totals
                    totalProductsSold += product.quantity;
                    totalSales += productTotalPrice;

                    // Update product-specific tracking
                    const existingProduct = productMap.get(product.productId);
                    if (existingProduct) {
                        existingProduct.quantitySold += product.quantity;
                        existingProduct.totalSales += productTotalPrice;
                    } else {
                        productMap.set(product.productId, {
                            productId: product.productId,
                            productName: product.productName,
                            quantitySold: product.quantity,
                            totalSales: productTotalPrice
                        });
                    }
                }
            });
        }
    });

    // Convert product map to array and sort by quantity sold (descending)
    const sortedProducts = Array.from(productMap.values())
        .sort((a, b) => b.quantitySold - a.quantitySold);

    // Get top product and limit results
    const topProduct = sortedProducts.length > 0 ? sortedProducts[0] : null;
    const topProductsSales = sortedProducts.slice(0, topProductsLimit);

    return {
        totalProductsSold,
        totalSales: Math.round(totalSales * 100) / 100,
        topProduct,
        topProductsSales
    };
}

/**
 * Process monthly chart data from pre-fetched orders
 */
function processMonthlySalesData(
    orders: Order[],
    brandId: string,
    monthsBack: number,
    now: Date
): MonthsSales {
    // Initialize monthly data map
    const monthlyDataMap = new Map<string, MonthlySalesData>();

    // Initialize all months in the range with zero values
    for (let i = 0; i < monthsBack; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1 + i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

        monthlyDataMap.set(monthKey, {
            year,
            month,
            monthName: date.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
            totalSales: 0,
            totalProductsSold: 0,
            orderCount: 0
        });
    }

    // Process orders and aggregate by month
    orders.forEach(order => {
        const orderDate = (order.createdAt as admin.firestore.Timestamp).toDate();
        const year = orderDate.getFullYear();
        const month = orderDate.getMonth() + 1;
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

        const monthlyData = monthlyDataMap.get(monthKey);
        if (!monthlyData) return;

        // Calculate brand-specific totals for this order
        let orderBrandSales = 0;
        let orderBrandProductCount = 0;

        order.products.forEach(product => {
            if (product.brandId === brandId) {
                const productTotal = product.price * product.quantity;
                orderBrandSales += productTotal;
                orderBrandProductCount += product.quantity;
            }
        });

        // Update monthly totals
        if (orderBrandSales > 0) {
            monthlyData.totalSales += orderBrandSales;
            monthlyData.totalProductsSold += orderBrandProductCount;
            monthlyData.orderCount += 1;
        }
    });

    return generateSalesResponse(monthlyDataMap);
}

/**
 * Generate sales chart response from data map
 */
function generateSalesResponse(dataMap: Map<string, MonthlySalesData>): MonthsSales {
    // Convert map to sorted array
    const chartData = Array.from(dataMap.values())
        .sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
        })
        .map(data => ({
            ...data,
            totalSales: Math.round(data.totalSales * 100) / 100
        }));

    // Calculate summary statistics
    const dataWithSales = chartData.filter(data => data.totalSales > 0);
    const totalPeriodSales = chartData.reduce((sum, data) => sum + data.totalSales, 0);
    const totalPeriodProducts = chartData.reduce((sum, data) => sum + data.totalProductsSold, 0);
    const totalPeriodOrders = chartData.reduce((sum, data) => sum + data.orderCount, 0);

    const averageMonthlySales = chartData.length > 0
        ? Math.round((totalPeriodSales / chartData.length) * 100) / 100
        : 0;

    const highestSalesMonth = chartData.length > 0
        ? chartData.reduce((max, current) => current.totalSales > max.totalSales ? current : max, chartData[0])
        : null;

    const lowestSalesMonth = dataWithSales.length > 0
        ? dataWithSales.reduce((min, current) => current.totalSales < min.totalSales ? current : min, dataWithSales[0])
        : null;

    return {
        data: chartData,
        summary: {
            totalPeriodSales: Math.round(totalPeriodSales * 100) / 100,
            totalPeriodProducts,
            totalPeriodOrders,
            averageMonthlySales,
            highestSalesMonth,
            lowestSalesMonth
        }
    };
}
