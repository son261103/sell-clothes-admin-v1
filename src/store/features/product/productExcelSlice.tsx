import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ProductExcelService from '../../../services/productExcelService';
import type {
    ProductExcelImportRequest,
    ProductExcelImportResponse,
    ProductExcelExportRequest,
    ProductExcelExportResponse,
    ProductExcelImportProgressRequest,
    ProductExcelImportProgressResponse,
    ProductExcelZipInfoRequest,
    ProductExcelZipInfoResponse,
    SkuGenerationPreviewRequest,
    SkuGenerationPreviewResponse,
    ProductExcelTemplateResponse,
    ProductExcelBulkOperationResponse,
    ProductExcelErrorReport
} from '@/types';

// Define state structure
interface ProductExcelState {
    importResult: ProductExcelImportResponse | null;
    exportResult: ProductExcelExportResponse | null;
    importProgress: ProductExcelImportProgressResponse | null;
    zipInfo: ProductExcelZipInfoResponse | null;
    templateInfo: ProductExcelTemplateResponse | null;
    skuPreview: SkuGenerationPreviewResponse | null;
    bulkOperationResult: ProductExcelBulkOperationResponse | null;
    errorReport: ProductExcelErrorReport | null;
    isLoading: boolean;
    isExporting: boolean;
    isImporting: boolean;
    error: string | null;
}

const initialState: ProductExcelState = {
    importResult: null,
    exportResult: null,
    importProgress: null,
    zipInfo: null,
    templateInfo: null,
    skuPreview: null,
    bulkOperationResult: null,
    errorReport: null,
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

// Async thunk actions
export const importProducts = createAsyncThunk(
    'productExcel/import',
    async (request: ProductExcelImportRequest, { rejectWithValue }) => {
        try {
            const response = await ProductExcelService.importProducts(request);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to import products');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const checkImportStatus = createAsyncThunk(
    'productExcel/importStatus',
    async (request: ProductExcelImportProgressRequest | undefined = undefined, { rejectWithValue }) => {
        try {
            const response = await ProductExcelService.getImportStatus(request);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to get import status');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const downloadTemplate = createAsyncThunk(
    'productExcel/downloadTemplate',
    async (_, { rejectWithValue }) => {
        try {
            const blob = await ProductExcelService.downloadTemplate();
            // Create a URL for the blob
            const url = window.URL.createObjectURL(blob);
            // Create a link element
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'product_import_template.xlsx');
            // Append to the document
            document.body.appendChild(link);
            // Trigger download
            link.click();
            // Clean up
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const exportProducts = createAsyncThunk(
    'productExcel/export',
    async (request: ProductExcelExportRequest, { rejectWithValue }) => {
        try {
            const blob = await ProductExcelService.exportProducts(request);
            // Create a URL for the blob
            const url = window.URL.createObjectURL(blob);
            // Create a link element
            const link = document.createElement('a');
            link.href = url;
            const filename = `products_export_${new Date().toISOString().slice(0, 10)}.${request.fileFormat}`;
            link.setAttribute('download', filename);
            // Append to the document
            document.body.appendChild(link);
            // Trigger download
            link.click();
            // Clean up
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            // Return a mock export result for state tracking
            return {
                fileUrl: url,
                fileName: filename,
                fileSize: blob.size,
                productCount: 0, // We don't know this value
                variantCount: 0, // We don't know this value
                exportedAt: new Date().toISOString()
            } as ProductExcelExportResponse;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const getTemplateInfo = createAsyncThunk(
    'productExcel/templateInfo',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ProductExcelService.getTemplateInfo();
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to get template info');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const analyzeZipFile = createAsyncThunk(
    'productExcel/zipInfo',
    async (request: ProductExcelZipInfoRequest, { rejectWithValue }) => {
        try {
            const response = await ProductExcelService.getZipInfo(request);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to analyze ZIP file');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const generateSkuPreview = createAsyncThunk(
    'productExcel/skuPreview',
    async (request: SkuGenerationPreviewRequest, { rejectWithValue }) => {
        try {
            const response = await ProductExcelService.generateSkuPreview(request);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to generate SKU preview');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const performBulkOperation = createAsyncThunk(
    'productExcel/bulkOperation',
    async (
        { operation, productIds }: { operation: 'delete' | 'activate' | 'deactivate'; productIds: number[] },
        { rejectWithValue }
    ) => {
        try {
            const response = await ProductExcelService.performBulkOperation(operation, productIds);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to perform bulk operation');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchErrorReport = createAsyncThunk(
    'productExcel/errorReport',
    async (reportUrl: string, { rejectWithValue }) => {
        try {
            const response = await ProductExcelService.getErrorReport(reportUrl);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch error report');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

const productExcelSlice = createSlice({
    name: 'productExcel',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearImportResult: (state) => {
            state.importResult = null;
        },
        clearExportResult: (state) => {
            state.exportResult = null;
        },
        clearImportProgress: (state) => {
            state.importProgress = null;
        },
        clearErrorReport: (state) => {
            state.errorReport = null;
        },
        clearZipInfo: (state) => {
            state.zipInfo = null;
        },
        clearSkuPreview: (state) => {
            state.skuPreview = null;
        },
        clearBulkOperationResult: (state) => {
            state.bulkOperationResult = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Import products
            .addCase(importProducts.pending, (state) => {
                state.isImporting = true;
                state.error = null;
            })
            .addCase(importProducts.fulfilled, (state, action) => {
                state.isImporting = false;
                state.importResult = action.payload;
                state.error = null;
            })
            .addCase(importProducts.rejected, (state, action) => {
                state.isImporting = false;
                state.error = action.payload as string;
            })

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

            // Download template
            .addCase(downloadTemplate.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(downloadTemplate.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(downloadTemplate.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Export products
            .addCase(exportProducts.pending, (state) => {
                state.isExporting = true;
                state.error = null;
            })
            .addCase(exportProducts.fulfilled, (state, action) => {
                state.isExporting = false;
                state.exportResult = action.payload;
                state.error = null;
            })
            .addCase(exportProducts.rejected, (state, action) => {
                state.isExporting = false;
                state.error = action.payload as string;
            })

            // Get template info
            .addCase(getTemplateInfo.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getTemplateInfo.fulfilled, (state, action) => {
                state.isLoading = false;
                state.templateInfo = action.payload;
                state.error = null;
            })
            .addCase(getTemplateInfo.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Analyze ZIP file
            .addCase(analyzeZipFile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(analyzeZipFile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.zipInfo = action.payload;
                state.error = null;
            })
            .addCase(analyzeZipFile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Generate SKU preview
            .addCase(generateSkuPreview.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(generateSkuPreview.fulfilled, (state, action) => {
                state.isLoading = false;
                state.skuPreview = action.payload;
                state.error = null;
            })
            .addCase(generateSkuPreview.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Perform bulk operation
            .addCase(performBulkOperation.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(performBulkOperation.fulfilled, (state, action) => {
                state.isLoading = false;
                state.bulkOperationResult = action.payload;
                state.error = null;
            })
            .addCase(performBulkOperation.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch error report
            .addCase(fetchErrorReport.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchErrorReport.fulfilled, (state, action) => {
                state.isLoading = false;
                state.errorReport = action.payload;
                state.error = null;
            })
            .addCase(fetchErrorReport.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const {
    clearError,
    clearImportResult,
    clearExportResult,
    clearImportProgress,
    clearErrorReport,
    clearZipInfo,
    clearSkuPreview,
    clearBulkOperationResult
} = productExcelSlice.actions;

export default productExcelSlice.reducer;