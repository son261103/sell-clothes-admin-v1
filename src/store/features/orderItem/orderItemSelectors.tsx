import { createSelector } from 'reselect';
import type { RootState } from '../../store';

// Basic selectors
export const selectOrderItemState = (state: RootState) => state.orderItem;

export const selectOrderItems = createSelector(
    [selectOrderItemState],
    (state) => state.orderItems || []
);

export const selectCurrentOrderItem = createSelector(
    [selectOrderItemState],
    (state) => state.currentOrderItem
);

export const selectBestsellingVariants = createSelector(
    [selectOrderItemState],
    (state) => state.bestsellingVariants || []
);

export const selectBestsellingProducts = createSelector(
    [selectOrderItemState],
    (state) => state.bestsellingProducts || []
);

export const selectProductSalesData = createSelector(
    [selectOrderItemState],
    (state) => state.productSalesData
);

export const selectIsLoading = createSelector(
    [selectOrderItemState],
    (state) => state.isLoading
);

export const selectError = createSelector(
    [selectOrderItemState],
    (state) => state.error
);

// Enhanced selectors with formatted values
export const selectFormattedOrderItems = createSelector(
    [selectOrderItems],
    (items) => {
        if (!items || !Array.isArray(items)) {
            return [];
        }

        return items.map((item) => {
            if (!item) return null;

            return {
                ...item,
                displayName: `${item.productName || ''} - ${item.variantName || ''}`,
                formattedPrice: typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : '$0.00',
                formattedSubtotal: typeof item.subtotal === 'number' ? `$${item.subtotal.toFixed(2)}` : '$0.00'
            };
        }).filter(Boolean);
    }
);

export const selectFormattedCurrentOrderItem = createSelector(
    [selectCurrentOrderItem],
    (item) => {
        if (!item) return null;

        return {
            ...item,
            displayName: `${item.productName || ''} - ${item.variantName || ''}`,
            formattedPrice: typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : '$0.00',
            formattedSubtotal: typeof item.subtotal === 'number' ? `$${item.subtotal.toFixed(2)}` : '$0.00'
        };
    }
);

// Order Items summary selectors
export const selectOrderItemsSummary = createSelector(
    [selectOrderItems],
    (items) => {
        if (!items || !Array.isArray(items)) {
            return {
                count: 0,
                totalQuantity: 0,
                totalValue: 0,
                formattedTotalValue: '$0.00',
                averagePrice: 0,
                formattedAveragePrice: '$0.00'
            };
        }

        const totalValue = items.reduce((sum, item) => sum + (item?.subtotal || 0), 0);
        const totalQuantity = items.reduce((sum, item) => sum + (item?.quantity || 0), 0);
        const averagePrice = totalQuantity > 0 ? totalValue / totalQuantity : 0;

        return {
            count: items.length,
            totalQuantity,
            totalValue,
            formattedTotalValue: `$${totalValue.toFixed(2)}`,
            averagePrice,
            formattedAveragePrice: `$${averagePrice.toFixed(2)}`
        };
    }
);

// OrderItem search/filter selectors
export const selectOrderItemById = createSelector(
    [selectOrderItems, (_: RootState, itemId: number) => itemId],
    (items, itemId) => items.find(item => item?.orderItemId === itemId) || null
);

export const selectOrderItemsByOrderId = createSelector(
    [selectOrderItems, (_: RootState, orderId: number) => orderId],
    (items, orderId) => items.filter(item => item?.orderId === orderId)
);

export const selectOrderItemsByProductId = createSelector(
    [selectOrderItems, (_: RootState, productVariantId: number) => productVariantId],
    (items, productVariantId) => items.filter(item => item?.productVariantId === productVariantId)
);

// Bestselling variants selectors
export const selectFormattedBestsellingVariants = createSelector(
    [selectBestsellingVariants],
    (variants) => {
        if (!variants || !Array.isArray(variants)) {
            return [];
        }

        return variants.map((variant, index) => ({
            ...variant,
            rank: index + 1,
            displayName: `${variant.productName} - ${variant.size}, ${variant.color}`,
            percentageOfTotal: variants.reduce((sum, v) => sum + v.quantitySold, 0) > 0
                ? (variant.quantitySold / variants.reduce((sum, v) => sum + v.quantitySold, 0) * 100).toFixed(1) + '%'
                : '0%'
        }));
    }
);

// Bestselling products selectors
export const selectFormattedBestsellingProducts = createSelector(
    [selectBestsellingProducts],
    (products) => {
        if (!products || !Array.isArray(products)) {
            return [];
        }

        return products.map((product, index) => ({
            ...product,
            rank: index + 1,
            displayName: product.productName,
            percentageOfTotal: products.reduce((sum, p) => sum + p.totalQuantitySold, 0) > 0
                ? (product.totalQuantitySold / products.reduce((sum, p) => sum + p.totalQuantitySold, 0) * 100).toFixed(1) + '%'
                : '0%'
        }));
    }
);

// Product sales data selectors
export const selectFormattedProductSalesData = createSelector(
    [selectProductSalesData],
    (salesData) => {
        if (!salesData) return null;

        return {
            ...salesData,
            formattedTotalRevenue: `$${salesData.totalRevenue.toFixed(2)}`,
            averageUnitPrice: salesData.totalQuantitySold > 0
                ? salesData.totalRevenue / salesData.totalQuantitySold
                : 0,
            formattedAverageUnitPrice: salesData.totalQuantitySold > 0
                ? `$${(salesData.totalRevenue / salesData.totalQuantitySold).toFixed(2)}`
                : '$0.00',
            formattedVariantSales: salesData.variantSales.map(variant => ({
                ...variant,
                displayName: `${variant.size}, ${variant.color}`,
                percentageOfTotal: salesData.totalQuantitySold > 0
                    ? (variant.quantitySold / salesData.totalQuantitySold * 100).toFixed(1) + '%'
                    : '0%'
            }))
        };
    }
);

// Top variant selector
export const selectTopSellingVariant = createSelector(
    [selectBestsellingVariants],
    (variants) => {
        if (!variants || !variants.length) return null;

        const sorted = [...variants].sort((a, b) => b.quantitySold - a.quantitySold);
        const top = sorted[0];

        return {
            ...top,
            displayName: `${top.productName} - ${top.size}, ${top.color}`,
            percentageOfTotal: variants.reduce((sum, v) => sum + v.quantitySold, 0) > 0
                ? (top.quantitySold / variants.reduce((sum, v) => sum + v.quantitySold, 0) * 100).toFixed(1) + '%'
                : '0%'
        };
    }
);

// Top product selector
export const selectTopSellingProduct = createSelector(
    [selectBestsellingProducts],
    (products) => {
        if (!products || !products.length) return null;

        const sorted = [...products].sort((a, b) => b.totalQuantitySold - a.totalQuantitySold);
        const top = sorted[0];

        return {
            ...top,
            displayName: top.productName,
            percentageOfTotal: products.reduce((sum, p) => sum + p.totalQuantitySold, 0) > 0
                ? (top.totalQuantitySold / products.reduce((sum, p) => sum + p.totalQuantitySold, 0) * 100).toFixed(1) + '%'
                : '0%'
        };
    }
);

// Operation status selectors
export const selectOrderItemOperationStatus = createSelector(
    [selectIsLoading, selectError],
    (isLoading, error) => ({
        isLoading,
        error,
        isSuccess: !isLoading && !error,
        statusText: isLoading ? 'Loading...' : error ? 'Error occurred' : 'Success'
    })
);

// Empty state selectors
export const selectIsOrderItemsEmpty = createSelector(
    [selectOrderItems],
    (items) => ({
        isEmpty: !items || items.length === 0,
        message: !items || items.length === 0 ? 'No order items found' : 'Order items available'
    })
);

export const selectIsBestsellingVariantsEmpty = createSelector(
    [selectBestsellingVariants],
    (variants) => ({
        isEmpty: !variants || variants.length === 0,
        message: !variants || variants.length === 0 ? 'No bestselling variants found' : 'Bestselling variants available'
    })
);

export const selectIsBestsellingProductsEmpty = createSelector(
    [selectBestsellingProducts],
    (products) => ({
        isEmpty: !products || products.length === 0,
        message: !products || products.length === 0 ? 'No bestselling products found' : 'Bestselling products available'
    })
);

// Product variant comparison selectors
export const selectCompareVariantsSales = createSelector(
    [selectProductSalesData],
    (salesData) => {
        if (!salesData || !salesData.variantSales || !salesData.variantSales.length) {
            return [];
        }

        // Sort variants by sales volume
        const sortedVariants = [...salesData.variantSales]
            .sort((a, b) => b.quantitySold - a.quantitySold);

        return sortedVariants.map((variant, index) => ({
            ...variant,
            rank: index + 1,
            displayName: `${variant.size}, ${variant.color}`,
            percentageOfTotal: salesData.totalQuantitySold > 0
                ? (variant.quantitySold / salesData.totalQuantitySold * 100).toFixed(1) + '%'
                : '0%'
        }));
    }
);