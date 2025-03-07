import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    fetchOrderItems,
    fetchOrderItem,
    addOrderItem,
    updateOrderItem,
    removeOrderItem,
    fetchBestsellingVariants,
    fetchBestsellingProducts,
    fetchProductSalesData,
    restoreInventory,
    clearError,
    clearCurrentOrderItem,
    clearOrderItems
} from '../store/features/orderItem/orderItemSlice';
import {
    selectOrderItems,
    selectCurrentOrderItem,
    selectBestsellingVariants,
    selectBestsellingProducts,
    selectProductSalesData,
    selectError,
    selectFormattedOrderItems,
    selectFormattedCurrentOrderItem,
    selectOrderItemsSummary,
    selectOrderItemById,
    selectOrderItemsByOrderId,
    selectOrderItemsByProductId,
    selectFormattedBestsellingVariants,
    selectFormattedBestsellingProducts,
    selectFormattedProductSalesData,
    selectTopSellingVariant,
    selectTopSellingProduct,
    selectOrderItemOperationStatus,
    selectIsOrderItemsEmpty,
    selectIsBestsellingVariantsEmpty,
    selectIsBestsellingProductsEmpty,
    selectCompareVariantsSales
} from '../store/features/orderItem/orderItemSelectors';
import type {
    OrderItemRequest,
    OrderItemResponse,
    OrderItemUpdateRequest,
} from '@/types';

// Main hook for order items operations
export const useOrderItems = () => {
    const dispatch = useAppDispatch();
    const orderItems = useAppSelector(selectOrderItems);
    const formattedOrderItems = useAppSelector(selectFormattedOrderItems);
    const itemsSummary = useAppSelector(selectOrderItemsSummary);
    const { isLoading, error } = useAppSelector(selectOrderItemOperationStatus);
    const isEmpty = useAppSelector(selectIsOrderItemsEmpty);

    const handleFetchOrderItems = useCallback(async (orderId: number) => {
        try {
            await dispatch(fetchOrderItems(orderId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleClearOrderItems = useCallback(() => {
        dispatch(clearOrderItems());
    }, [dispatch]);

    return {
        orderItems,
        formattedOrderItems,
        itemsSummary,
        isLoading,
        error,
        isEmpty,
        fetchOrderItems: handleFetchOrderItems,
        clearOrderItems: handleClearOrderItems
    };
};

// Hook for specific order item management
export const useOrderItem = (orderId?: number, itemId?: number) => {
    const dispatch = useAppDispatch();
    const currentOrderItem = useAppSelector(selectCurrentOrderItem);
    const formattedCurrentOrderItem = useAppSelector(selectFormattedCurrentOrderItem);
    const foundOrderItem = useAppSelector(
        (itemId && orderId) ?
            (state => selectOrderItemById(state, itemId)) :
            () => null
    );
    const { isLoading, error } = useAppSelector(selectOrderItemOperationStatus);

    const handleFetchOrderItem = useCallback(async (orderId: number, itemId: number) => {
        try {
            await dispatch(fetchOrderItem({ orderId, itemId })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleAddOrderItem = useCallback(async (
        orderId: number,
        item: OrderItemRequest
    ): Promise<OrderItemResponse | null> => {
        try {
            const result = await dispatch(addOrderItem({ orderId, item })).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleUpdateOrderItem = useCallback(async (
        orderId: number,
        itemId: number,
        updateData: OrderItemUpdateRequest
    ) => {
        try {
            await dispatch(updateOrderItem({ orderId, itemId, updateData })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleRemoveOrderItem = useCallback(async (
        orderId: number,
        itemId: number
    ) => {
        try {
            await dispatch(removeOrderItem({ orderId, itemId })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleClearCurrentOrderItem = useCallback(() => {
        dispatch(clearCurrentOrderItem());
    }, [dispatch]);

    return {
        currentOrderItem,
        formattedCurrentOrderItem,
        foundOrderItem,
        isLoading,
        error,
        fetchOrderItem: handleFetchOrderItem,
        addOrderItem: handleAddOrderItem,
        updateOrderItem: handleUpdateOrderItem,
        removeOrderItem: handleRemoveOrderItem,
        clearCurrentOrderItem: handleClearCurrentOrderItem
    };
};

// Hook for order items filtering by order ID
export const useOrderItemsByOrder = (orderId?: number) => {
    const orderItemsByOrder = useAppSelector(
        orderId ?
            (state => selectOrderItemsByOrderId(state, orderId)) :
            selectOrderItems
    );

    const itemsSummary = useAppSelector(selectOrderItemsSummary);
    const isEmpty = useAppSelector(selectIsOrderItemsEmpty);

    return {
        orderItemsByOrder,
        itemsSummary,
        isEmpty
    };
};

// Hook for order items filtering by product ID
export const useOrderItemsByProduct = (productVariantId?: number) => {
    const orderItemsByProduct = useAppSelector(
        productVariantId ?
            (state => selectOrderItemsByProductId(state, productVariantId)) :
            selectOrderItems
    );

    return {
        orderItemsByProduct
    };
};

// Hook for bestselling variants
export const useBestsellingVariants = () => {
    const dispatch = useAppDispatch();
    const bestsellingVariants = useAppSelector(selectBestsellingVariants);
    const formattedVariants = useAppSelector(selectFormattedBestsellingVariants);
    const topSellingVariant = useAppSelector(selectTopSellingVariant);
    const { isLoading, error } = useAppSelector(selectOrderItemOperationStatus);
    const isEmpty = useAppSelector(selectIsBestsellingVariantsEmpty);

    const handleFetchBestsellingVariants = useCallback(async (limit: number = 10) => {
        try {
            await dispatch(fetchBestsellingVariants(limit)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        bestsellingVariants,
        formattedVariants,
        topSellingVariant,
        isLoading,
        error,
        isEmpty,
        fetchBestsellingVariants: handleFetchBestsellingVariants
    };
};

// Hook for bestselling products
export const useBestsellingProducts = () => {
    const dispatch = useAppDispatch();
    const bestsellingProducts = useAppSelector(selectBestsellingProducts);
    const formattedProducts = useAppSelector(selectFormattedBestsellingProducts);
    const topSellingProduct = useAppSelector(selectTopSellingProduct);
    const { isLoading, error } = useAppSelector(selectOrderItemOperationStatus);
    const isEmpty = useAppSelector(selectIsBestsellingProductsEmpty);

    const handleFetchBestsellingProducts = useCallback(async (limit: number = 10) => {
        try {
            await dispatch(fetchBestsellingProducts(limit)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        bestsellingProducts,
        formattedProducts,
        topSellingProduct,
        isLoading,
        error,
        isEmpty,
        fetchBestsellingProducts: handleFetchBestsellingProducts
    };
};

// Hook for product sales data
export const useProductSalesData = (productId?: number) => {
    const dispatch = useAppDispatch();
    const productSalesData = useAppSelector(selectProductSalesData);
    const formattedSalesData = useAppSelector(selectFormattedProductSalesData);
    const variantComparison = useAppSelector(selectCompareVariantsSales);
    const { isLoading, error } = useAppSelector(selectOrderItemOperationStatus);

    const handleFetchProductSalesData = useCallback(async (productId: number) => {
        try {
            await dispatch(fetchProductSalesData(productId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    // Automatically fetch data if productId is provided
    const fetchData = useCallback(async () => {
        if (productId) {
            return await handleFetchProductSalesData(productId);
        }
        return false;
    }, [productId, handleFetchProductSalesData]);

    return {
        productSalesData,
        formattedSalesData,
        variantComparison,
        isLoading,
        error,
        fetchProductSalesData: handleFetchProductSalesData,
        fetchData
    };
};

// Hook for inventory restoration
export const useInventoryRestoration = () => {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(selectOrderItemOperationStatus);

    const handleRestoreInventory = useCallback(async (orderId: number) => {
        try {
            await dispatch(restoreInventory(orderId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        isLoading,
        error,
        restoreInventory: handleRestoreInventory
    };
};

// Hook for error handling
export const useOrderItemError = () => {
    const dispatch = useAppDispatch();
    const error = useAppSelector(selectError);

    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    return {
        error,
        clearError: handleClearError
    };
};