import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ProductSeparateExcelService from '../../../services/ProductSeparateExcelService';
import type {
    ProductSeparateExcelImportRequest,
    ProductSeparateExcelImportResponse,
    ProductSeparateExcelExportRequest,
    ProductSeparateExcelExportResponse,
    VariantSeparateExcelImportRequest,
    VariantSeparateExcelImportResponse,
    VariantSeparateExcelExportResponse,
    SeparateExcelImportProgressRequest,
    SeparateExcelImportProgressResponse,
    SeparateExcelErrorReport,
} from '@/types/productExel/product.separate.excel.types.tsx';

// Define state structure
interface ProductSeparateExcelState {
    // Product state
    productImportResult: ProductSeparateExcelImportResponse | null;
    productExportResult: ProductSeparateExcelExportResponse | null;

    // Variant state
    variantImportResult: VariantSeparateExcelImportResponse | null;
    variantExportResult: VariantSeparateExcelExportResponse | null;

    // Shared state
    importProgress: SeparateExcelImportProgressResponse | null;
    errorReport: SeparateExcelErrorReport | null;

    // Status flags
    isLoading: boolean;
    isExporting: boolean;
    isImporting: boolean;
    error: string | null;
}

const initialState: ProductSeparateExcelState = {
    // Product state
    productImportResult: null,
    productExportResult: null,

    // Variant state
    variantImportResult: null,
    variantExportResult: null,

    // Shared state
    importProgress: null,
    errorReport: null,

    // Status flags
    isLoading: false,
    isExporting: false,
    isImporting: false,
    error: null
};

// Error handler
const handleError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String(error.message);
    }
    return 'An unexpected error occurred';
};

//===========================================================================
// SHARED ASYNC THUNK ACTIONS
//===========================================================================

export const checkImportStatus = createAsyncThunk(
    'productSeparateExcel/importStatus',
    async (request: SeparateExcelImportProgressRequest | undefined = undefined, { rejectWithValue }) => {
        try {
            const response = await ProductSeparateExcelService.getImportStatus(request);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to get import status');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const downloadErrorReport = createAsyncThunk(
    'productSeparateExcel/downloadErrorReport',
    async (reportId: string, { rejectWithValue }) => {
        try {
            const blob = await ProductSeparateExcelService.downloadErrorReport(reportId);
            ProductSeparateExcelService.downloadFile(
                blob,
                `error_report_${new Date().toISOString().slice(0, 10)}.xlsx`
            );
            return true;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const getErrorReportDetails = createAsyncThunk(
    'productSeparateExcel/errorReportDetails',
    async (reportId: string, { rejectWithValue }) => {
        try {
            const response = await ProductSeparateExcelService.getErrorReportDetails(reportId);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to get error report details');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

//===========================================================================
// PRODUCT ASYNC THUNK ACTIONS
//===========================================================================

export const downloadProductTemplate = createAsyncThunk(
    'productSeparateExcel/downloadProductTemplate',
    async (_, { rejectWithValue }) => {
        try {
            const blob = await ProductSeparateExcelService.downloadProductTemplate();
            ProductSeparateExcelService.downloadFile(blob, 'product_template.xlsx');
            return true;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const downloadProductTemplatePackage = createAsyncThunk(
    'productSeparateExcel/downloadProductTemplatePackage',
    async (_, { rejectWithValue }) => {
        try {
            const blob = await ProductSeparateExcelService.downloadProductTemplatePackage();
            ProductSeparateExcelService.downloadFile(blob, 'product_template_package.zip');
            return true;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const importProducts = createAsyncThunk(
    'productSeparateExcel/importProducts',
    async (request: ProductSeparateExcelImportRequest, { rejectWithValue }) => {
        try {
            const response = await ProductSeparateExcelService.importProducts(request);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to import products');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const importProductsFromZip = createAsyncThunk(
    'productSeparateExcel/importProductsFromZip',
    async (request: ProductSeparateExcelImportRequest, { rejectWithValue }) => {
        try {
            const response = await ProductSeparateExcelService.importProductsFromZip(request);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to import products from ZIP');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const exportProducts = createAsyncThunk(
    'productSeparateExcel/exportProducts',
    async (request: ProductSeparateExcelExportRequest, { rejectWithValue }) => {
        try {
            const blob = await ProductSeparateExcelService.exportProducts(request);
            const filename = `products_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
            ProductSeparateExcelService.downloadFile(blob, filename);

            // Return a mock export result for state tracking
            return {
                fileUrl: URL.createObjectURL(blob),
                fileName: filename,
                fileSize: blob.size,
                productCount: request.productIds?.length || 0,
                exportedAt: new Date().toISOString()
            } as ProductSeparateExcelExportResponse;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

//===========================================================================
// VARIANT ASYNC THUNK ACTIONS
//===========================================================================

export const downloadVariantTemplate = createAsyncThunk(
    'productSeparateExcel/downloadVariantTemplate',
    async (productId: number, { rejectWithValue }) => {
        try {
            const blob = await ProductSeparateExcelService.downloadVariantTemplate(productId);
            ProductSeparateExcelService.downloadFile(blob, `variant_template_product_${productId}.xlsx`);
            return true;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const downloadVariantTemplatePackage = createAsyncThunk(
    'productSeparateExcel/downloadVariantTemplatePackage',
    async (productId: number, { rejectWithValue }) => {
        try {
            const blob = await ProductSeparateExcelService.downloadVariantTemplatePackage(productId);
            ProductSeparateExcelService.downloadFile(blob, `variant_template_package_product_${productId}.zip`);
            return true;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const importVariants = createAsyncThunk(
    'productSeparateExcel/importVariants',
    async (request: VariantSeparateExcelImportRequest, { rejectWithValue }) => {
        try {
            const response = await ProductSeparateExcelService.importVariants(request);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to import variants');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const importVariantsFromZip = createAsyncThunk(
    'productSeparateExcel/importVariantsFromZip',
    async (request: VariantSeparateExcelImportRequest, { rejectWithValue }) => {
        try {
            const response = await ProductSeparateExcelService.importVariantsFromZip(request);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to import variants from ZIP');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const exportVariants = createAsyncThunk(
    'productSeparateExcel/exportVariants',
    async (productId: number, { rejectWithValue }) => {
        try {
            const blob = await ProductSeparateExcelService.exportVariants(productId);
            const filename = `variants_export_product_${productId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
            ProductSeparateExcelService.downloadFile(blob, filename);

            // Return a mock export result for state tracking
            return {
                fileUrl: URL.createObjectURL(blob),
                fileName: filename,
                fileSize: blob.size,
                variantCount: 0, // We don't know this value
                exportedAt: new Date().toISOString()
            } as VariantSeparateExcelExportResponse;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

const productSeparateExcelSlice = createSlice({
    name: 'productSeparateExcel',
    initialState,
    reducers: {
        // General actions
        clearError: (state) => {
            state.error = null;
        },
        clearImportProgress: (state) => {
            state.importProgress = null;
        },
        clearErrorReport: (state) => {
            state.errorReport = null;
        },

        // Product actions
        clearProductImportResult: (state) => {
            state.productImportResult = null;
        },
        clearProductExportResult: (state) => {
            state.productExportResult = null;
        },

        // Variant actions
        clearVariantImportResult: (state) => {
            state.variantImportResult = null;
        },
        clearVariantExportResult: (state) => {
            state.variantExportResult = null;
        }
    },
    extraReducers: (builder) => {
        builder
            //=======================================================================
            // SHARED OPERATIONS
            //=======================================================================

            // Check import status
            .addCase(checkImportStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(checkImportStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.importProgress = action.payload;
                state.error = null;
            })
            .addCase(checkImportStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Download error report
            .addCase(downloadErrorReport.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(downloadErrorReport.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(downloadErrorReport.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Get error report details
            .addCase(getErrorReportDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getErrorReportDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.errorReport = action.payload;
                state.error = null;
            })
            .addCase(getErrorReportDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            //=======================================================================
            // PRODUCT OPERATIONS
            //=======================================================================

            // Download product template
            .addCase(downloadProductTemplate.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(downloadProductTemplate.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(downloadProductTemplate.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Download product template package
            .addCase(downloadProductTemplatePackage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(downloadProductTemplatePackage.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(downloadProductTemplatePackage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Import products
            .addCase(importProducts.pending, (state) => {
                state.isImporting = true;
                state.error = null;
            })
            .addCase(importProducts.fulfilled, (state, action) => {
                state.isImporting = false;
                state.productImportResult = action.payload;
                state.error = null;
            })
            .addCase(importProducts.rejected, (state, action) => {
                state.isImporting = false;
                state.error = action.payload as string;
            })

            // Import products from ZIP
            .addCase(importProductsFromZip.pending, (state) => {
                state.isImporting = true;
                state.error = null;
            })
            .addCase(importProductsFromZip.fulfilled, (state, action) => {
                state.isImporting = false;
                state.productImportResult = action.payload;
                state.error = null;
            })
            .addCase(importProductsFromZip.rejected, (state, action) => {
                state.isImporting = false;
                state.error = action.payload as string;
            })

            // Export products
            .addCase(exportProducts.pending, (state) => {
                state.isExporting = true;
                state.error = null;
            })
            .addCase(exportProducts.fulfilled, (state, action) => {
                state.isExporting = false;
                state.productExportResult = action.payload;
                state.error = null;
            })
            .addCase(exportProducts.rejected, (state, action) => {
                state.isExporting = false;
                state.error = action.payload as string;
            })

            //=======================================================================
            // VARIANT OPERATIONS
            //=======================================================================

            // Download variant template
            .addCase(downloadVariantTemplate.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(downloadVariantTemplate.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(downloadVariantTemplate.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Download variant template package
            .addCase(downloadVariantTemplatePackage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(downloadVariantTemplatePackage.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(downloadVariantTemplatePackage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Import variants
            .addCase(importVariants.pending, (state) => {
                state.isImporting = true;
                state.error = null;
            })
            .addCase(importVariants.fulfilled, (state, action) => {
                state.isImporting = false;
                state.variantImportResult = action.payload;
                state.error = null;
            })
            .addCase(importVariants.rejected, (state, action) => {
                state.isImporting = false;
                state.error = action.payload as string;
            })

            // Import variants from ZIP
            .addCase(importVariantsFromZip.pending, (state) => {
                state.isImporting = true;
                state.error = null;
            })
            .addCase(importVariantsFromZip.fulfilled, (state, action) => {
                state.isImporting = false;
                state.variantImportResult = action.payload;
                state.error = null;
            })
            .addCase(importVariantsFromZip.rejected, (state, action) => {
                state.isImporting = false;
                state.error = action.payload as string;
            })

            // Export variants
            .addCase(exportVariants.pending, (state) => {
                state.isExporting = true;
                state.error = null;
            })
            .addCase(exportVariants.fulfilled, (state, action) => {
                state.isExporting = false;
                state.variantExportResult = action.payload;
                state.error = null;
            })
            .addCase(exportVariants.rejected, (state, action) => {
                state.isExporting = false;
                state.error = action.payload as string;
            });
    }
});

export const {
    clearError,
    clearImportProgress,
    clearErrorReport,
    clearProductImportResult,
    clearProductExportResult,
    clearVariantImportResult,
    clearVariantExportResult
} = productSeparateExcelSlice.actions;

export default productSeparateExcelSlice.reducer;