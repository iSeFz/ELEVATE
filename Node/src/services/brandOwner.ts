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

/**
 * Get comprehensive current month statistics for a brand
 * Uses composite index: brandIds (Array) + status (Ascending) + createdAt (Ascending)
 * @param {string} brandId - Brand ID to filter by
 * @param {number} topProductsLimit - Number of top products to return (default: 10)
 * @returns {Promise<CurrentMonthStats>} Current month statistics
 */
export const getCurrentMonthStats = async (
    brandId: string,
    topProductsLimit: number = 10
): Promise<CurrentMonthStats> => {
    try {
        // Calculate current month boundaries
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Convert to Firestore timestamps
        const startTimestamp = admin.firestore.Timestamp.fromDate(startOfMonth);
        const endTimestamp = admin.firestore.Timestamp.fromDate(endOfMonth);

        // Valid statuses for completed sales
        const validStatuses = [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED];

        // Optimized query using composite index: brandIds + status + createdAt
        const ordersSnapshot = await firestore.collection(FIREBASE_COLLECTIONS['order'])
            .where('brandIds', 'array-contains', brandId)
            .where('status', 'in', validStatuses)
            .where('createdAt', '>=', startTimestamp)
            .where('createdAt', '<=', endTimestamp)
            .orderBy('createdAt', 'desc')
            .get();

        // Initialize tracking variables
        let totalProductsSold = 0;
        let totalSales = 0;
        const productMap = new Map<string, {
            productId: string;
            productName: string;
            quantitySold: number;
            totalSales: number;
        }>();

        // Process each order
        ordersSnapshot.forEach(doc => {
            const order = doc.data() as Order;

            // Process each product in the order
            order.products.forEach(product => {
                // Only count products from the specified brand
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
        });

        // Convert product map to array and sort by quantity sold (descending)
        const sortedProducts = Array.from(productMap.values())
            .sort((a, b) => b.quantitySold - a.quantitySold);

        // Get top product (first in sorted array)
        const topProduct = sortedProducts.length > 0 ? sortedProducts[0] : null;

        return {
            totalProductsSold,
            totalSales: Math.round(totalSales * 100) / 100,
            topProduct,
            topProductsSales: sortedProducts
        };

    } catch (error) {
        console.error(`Error getting current month stats for brand id ${brandId}:`, error);
        throw new Error(`Failed to retrieve current month statistics for brand id ${brandId}`);
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

/**
 * Interface for monthly sales data point
 */
interface MonthlySalesData {
    year: number;
    month: number;
    monthName: string;
    totalSales: number;
    totalProductsSold: number;
    orderCount: number;
}

/**
 * Interface for sales chart response
 */
interface SalesChartData {
    chartData: MonthlySalesData[];
    summary: {
        totalPeriodSales: number;
        totalPeriodProducts: number;
        totalPeriodOrders: number;
        averageMonthlySales: number;
        highestSalesMonth: MonthlySalesData | null;
        lowestSalesMonth: MonthlySalesData | null;
    };
}

/**
 * Get sales data by month for chart visualization
 * Optimized for performance using composite index: brandIds + createdAt
 * @param {string} brandId - Brand ID to filter by
 * @param {number} monthsBack - Number of months to go back from current month (default: 12)
 * @returns {Promise<SalesChartData>} Monthly sales data for chart
 */
export const getSalesByMonth = async (
    brandId: string,
    monthsBack: number = 12
): Promise<SalesChartData> => {
    try {
        // Validate input
        if (!brandId) {
            throw new Error('Brand ID is required');
        }

        if (monthsBack < 1 || monthsBack > 24) {
            throw new Error('monthsBack must be between 1 and 24');
        }

        // Calculate date range
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Convert to Firestore timestamps
        const startTimestamp = admin.firestore.Timestamp.fromDate(startDate);
        const endTimestamp = admin.firestore.Timestamp.fromDate(endDate);

        // Valid statuses for completed sales
        const validStatuses = [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED];

        // Optimized query using composite index: brandIds + createdAt
        const ordersSnapshot = await firestore.collection(FIREBASE_COLLECTIONS['order'])
            .where('brandIds', 'array-contains', brandId)
            .where('status', 'in', validStatuses)
            .where('createdAt', '>=', startTimestamp)
            .where('createdAt', '<=', endTimestamp)
            .orderBy('createdAt', 'desc')
            .get();

        // Initialize monthly data map
        const monthlyDataMap = new Map<string, MonthlySalesData>();

        // Initialize all months in the range with zero values
        for (let i = 0; i < monthsBack; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1 + i, 1);
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // Convert to 1-based month
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
        ordersSnapshot.forEach(doc => {
            const order = doc.data() as Order;
            const orderDate = (order.createdAt as admin.firestore.Timestamp).toDate();
            const year = orderDate.getFullYear();
            const month = orderDate.getMonth() + 1; // Convert to 1-based month
            const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

            // Get or create monthly data entry
            const monthlyData = monthlyDataMap.get(monthKey);
            if (!monthlyData) return; // Skip if outside our range

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

            // Update monthly totals only if this order contains brand products
            if (orderBrandSales > 0) {
                monthlyData.totalSales += orderBrandSales;
                monthlyData.totalProductsSold += orderBrandProductCount;
                monthlyData.orderCount += 1;
            }
        });

        // Convert map to sorted array
        const chartData = Array.from(monthlyDataMap.values())
            .sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return a.month - b.month;
            })
            .map(data => ({
                ...data,
                totalSales: Math.round(data.totalSales * 100) / 100 // Round to 2 decimal places
            }));

        // Calculate summary statistics
        const dataWithSales = chartData.filter(data => data.totalSales > 0);
        const totalPeriodSales = chartData.reduce((sum, data) => sum + data.totalSales, 0);
        const totalPeriodProducts = chartData.reduce((sum, data) => sum + data.totalProductsSold, 0);
        const totalPeriodOrders = chartData.reduce((sum, data) => sum + data.orderCount, 0);

        const averageMonthlySales = chartData.length > 0
            ? Math.round((totalPeriodSales / chartData.length) * 100) / 100
            : 0;

        // Find highest and lowest sales months (excluding zero sales months for lowest)
        const highestSalesMonth = chartData.length > 0
            ? chartData.reduce((max, current) => current.totalSales > max.totalSales ? current : max, chartData[0])
            : null;

        const lowestSalesMonth = dataWithSales.length > 0
            ? dataWithSales.reduce((min, current) => current.totalSales < min.totalSales ? current : min, dataWithSales[0])
            : null;

        return {
            chartData,
            summary: {
                totalPeriodSales: Math.round(totalPeriodSales * 100) / 100,
                totalPeriodProducts,
                totalPeriodOrders,
                averageMonthlySales,
                highestSalesMonth,
                lowestSalesMonth
            }
        };

    } catch (error) {
        console.error(`Error getting sales by month for brand id ${brandId}:`, error);
        throw new Error(`Failed to retrieve monthly sales data for brand id ${brandId}`);
    }
};
