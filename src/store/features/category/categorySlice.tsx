import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import CategoryService from '../../../services/categoryService';
import type {
    CategoryResponse,
    CategoryCreateRequest,
    CategoryUpdateRequest,
    CategoryHierarchyResponse,
    CategoryPageResponse,
    CategoryPageRequest,
    CategoryFilters,
    ErrorResponse
} from '../../../types';

interface CategoryState {
    categories: CategoryPageResponse;
    currentCategory: CategoryResponse | null;
    hierarchyData: CategoryHierarchyResponse | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: CategoryState = {
    categories: {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: true
    },
    currentCategory: null,
    hierarchyData: null,
    isLoading: false,
    error: null
};

// Error handler
const handleError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String((error as ErrorResponse).message);
    }
    return 'An unexpected error occurred';
};

// Parent Category Async Thunks
export const fetchAllParentCategories = createAsyncThunk(
    'category/fetchAllParents',
    async ({
               pageRequest,
               filters
           }: {
        pageRequest: CategoryPageRequest;
        filters?: CategoryFilters;
    }, {rejectWithValue}) => {
        try {
            const response = await CategoryService.getAllParentCategories(pageRequest, filters);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch parent categories');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchAllActiveParentCategories = createAsyncThunk(
    'category/fetchAllActiveParents',
    async (_, {rejectWithValue}) => {
        try {
            const response = await CategoryService.getAllActiveParentCategories();
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch active parent categories');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchParentCategoryById = createAsyncThunk(
    'category/fetchParentById',
    async (id: number, {rejectWithValue}) => {
        try {
            const response = await CategoryService.getParentCategoryById(id);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch parent category');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const createParentCategory = createAsyncThunk(
    'category/createParent',
    async (categoryData: CategoryCreateRequest, {rejectWithValue}) => {
        try {
            const response = await CategoryService.createParentCategory(categoryData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to create parent category');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updateParentCategory = createAsyncThunk(
    'category/updateParent',
    async ({id, categoryData}: { id: number; categoryData: CategoryUpdateRequest }, {rejectWithValue}) => {
        try {
            const response = await CategoryService.updateParentCategory(id, categoryData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to update parent category');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const toggleParentCategoryStatus = createAsyncThunk(
    'category/toggleParentStatus',
    async (id: number, {rejectWithValue}) => {
        try {
            const response = await CategoryService.toggleParentCategoryStatus(id);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to toggle parent category status');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const deleteParentCategory = createAsyncThunk(
    'category/deleteParent',
    async (id: number, {rejectWithValue}) => {
        try {
            const response = await CategoryService.deleteParentCategory(id);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to delete parent category');
            }
            return id;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchCategoryHierarchy = createAsyncThunk(
    'category/fetchHierarchy',
    async (id: number, {rejectWithValue}) => {
        try {
            const response = await CategoryService.getParentCategoryHierarchy(id);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch category hierarchy');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

// Sub-Category Async Thunks
export const fetchAllSubCategories = createAsyncThunk(
    'category/fetchAllSubs',
    async (parentId: number, {rejectWithValue}) => {
        try {
            const response = await CategoryService.getAllSubCategories(parentId);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch sub-categories');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);
// ---------------------------------------------------------------------------------------------------------------------
// sub category
export const createSubCategory = createAsyncThunk(
    'category/createSub',
    async ({parentId, categoryData}: { parentId: number; categoryData: CategoryCreateRequest }, {rejectWithValue}) => {
        try {
            const response = await CategoryService.createSubCategory(parentId, categoryData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to create sub-category');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const fetchSubCategoryById = createAsyncThunk(
    'category/fetchSubById',
    async (id: number, {rejectWithValue}) => {
        try {
            const response = await CategoryService.getSubCategoryById(id);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to fetch sub-category');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const updateSubCategory = createAsyncThunk(
    'category/updateSub',
    async ({id, categoryData}: { id: number; categoryData: CategoryUpdateRequest }, {rejectWithValue}) => {
        try {
            const response = await CategoryService.updateSubCategory(id, categoryData);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to update sub-category');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const toggleSubCategoryStatus = createAsyncThunk(
    'category/toggleSubStatus',
    async (id: number, {rejectWithValue}) => {
        try {
            const response = await CategoryService.toggleSubCategoryStatus(id);
            if (!response.success || !response.data) {
                return rejectWithValue(response.message || 'Failed to toggle sub-category status');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);

export const deleteSubCategory = createAsyncThunk(
    'category/deleteSub',
    async (id: number, {rejectWithValue}) => {
        try {
            const response = await CategoryService.deleteSubCategory(id);
            if (!response.success) {
                return rejectWithValue(response.message || 'Failed to delete sub-category');
            }
            return id;
        } catch (error) {
            return rejectWithValue(handleError(error));
        }
    }
);


const categorySlice = createSlice({
    name: 'category',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentCategory: (state) => {
            state.currentCategory = null;
        },
        clearHierarchyData: (state) => {
            state.hierarchyData = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Parent Categories
            .addCase(fetchAllParentCategories.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllParentCategories.fulfilled, (state, action) => {
                state.isLoading = false;
                state.categories = action.payload;
                state.error = null;
            })
            .addCase(fetchAllParentCategories.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Active Parent Categories
            .addCase(fetchAllActiveParentCategories.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllActiveParentCategories.fulfilled, (state, action) => {
                state.isLoading = false;
                state.categories.content = action.payload;
                state.error = null;
            })
            .addCase(fetchAllActiveParentCategories.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Parent Category by ID
            .addCase(fetchParentCategoryById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchParentCategoryById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentCategory = action.payload;
                state.error = null;
            })
            .addCase(fetchParentCategoryById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Create Parent Category
            .addCase(createParentCategory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createParentCategory.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.categories.number === 0) {
                    state.categories.content = [action.payload, ...state.categories.content];
                    if (state.categories.content.length > state.categories.size) {
                        state.categories.content.pop();
                    }
                }
                state.categories.totalElements += 1;
                state.categories.totalPages = Math.ceil(state.categories.totalElements / state.categories.size);
                state.categories.empty = state.categories.content.length === 0;
                state.error = null;
            })
            .addCase(createParentCategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Update Parent Category
            .addCase(updateParentCategory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateParentCategory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.categories.content = state.categories.content.map(category =>
                    category.categoryId === action.payload.categoryId ? action.payload : category
                );
                if (state.currentCategory?.categoryId === action.payload.categoryId) {
                    state.currentCategory = action.payload;
                }
                state.error = null;
            })
            .addCase(updateParentCategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Toggle Parent Category Status
            .addCase(toggleParentCategoryStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(toggleParentCategoryStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.categories.content = state.categories.content.map(category =>
                    category.categoryId === action.payload.categoryId ? action.payload : category
                );
                if (state.currentCategory?.categoryId === action.payload.categoryId) {
                    state.currentCategory = action.payload;
                }
                state.error = null;
            })
            .addCase(toggleParentCategoryStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Delete Parent Category
            .addCase(deleteParentCategory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteParentCategory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.categories.content = state.categories.content.filter(
                    category => category.categoryId !== action.payload
                );
                state.categories.totalElements -= 1;
                state.categories.totalPages = Math.ceil(state.categories.totalElements / state.categories.size);
                state.categories.empty = state.categories.content.length === 0;
                if (state.currentCategory?.categoryId === action.payload) {
                    state.currentCategory = null;
                }
                state.error = null;
            })
            .addCase(deleteParentCategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch Category Hierarchy
            .addCase(fetchCategoryHierarchy.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCategoryHierarchy.fulfilled, (state, action) => {
                state.isLoading = false;
                state.hierarchyData = action.payload;
                state.error = null;
            })
            .addCase(fetchCategoryHierarchy.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Fetch All Sub Categories
            .addCase(fetchAllSubCategories.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllSubCategories.fulfilled, (state, action) => {
                state.isLoading = false;
                state.categories.content = action.payload;
                state.error = null;
            })
            .addCase(fetchAllSubCategories.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Create Sub Category
            .addCase(createSubCategory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createSubCategory.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.hierarchyData && state.hierarchyData.parent.categoryId === action.payload.parentId) {
                    state.hierarchyData.subCategories = [action.payload, ...state.hierarchyData.subCategories];
                    state.hierarchyData.totalSubCategories += 1;
                    state.hierarchyData.activeSubCategories += action.payload.status ? 1 : 0;
                    state.hierarchyData.inactiveSubCategories += action.payload.status ? 0 : 1;
                }
                state.error = null;
            })
            .addCase(createSubCategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // ---------------------------------------------------------------------------------------------------------

            // Fetch Sub Category by ID
            .addCase(fetchSubCategoryById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSubCategoryById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentCategory = action.payload;
                state.error = null;
            })
            .addCase(fetchSubCategoryById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Update Sub Category
            .addCase(updateSubCategory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateSubCategory.fulfilled, (state, action) => {
                state.isLoading = false;

                // Nếu đang ở hierarchy view của parent category
                if (state.hierarchyData && state.hierarchyData.parent.categoryId === action.payload.parentId) {
                    state.hierarchyData.subCategories = state.hierarchyData.subCategories.map(subCategory =>
                        subCategory.categoryId === action.payload.categoryId ? action.payload : subCategory
                    );
                }

                // Cập nhật current category nếu đúng ID
                if (state.currentCategory?.categoryId === action.payload.categoryId) {
                    state.currentCategory = action.payload;
                }

                state.error = null;
            })
            .addCase(updateSubCategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Toggle Sub Category Status
            .addCase(toggleSubCategoryStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(toggleSubCategoryStatus.fulfilled, (state, action) => {
                state.isLoading = false;

                // Nếu đang ở hierarchy view của parent category
                if (state.hierarchyData && state.hierarchyData.parent.categoryId === action.payload.parentId) {
                    state.hierarchyData.subCategories = state.hierarchyData.subCategories.map(subCategory =>
                        subCategory.categoryId === action.payload.categoryId ? action.payload : subCategory
                    );

                    // Cập nhật các số liệu về trạng thái subcategory
                    state.hierarchyData.activeSubCategories += action.payload.status ? 1 : -1;
                    state.hierarchyData.inactiveSubCategories += action.payload.status ? -1 : 1;
                }

                // Cập nhật current category nếu đúng ID
                if (state.currentCategory?.categoryId === action.payload.categoryId) {
                    state.currentCategory = action.payload;
                }

                state.error = null;
            })
            .addCase(toggleSubCategoryStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Delete Sub Category
            .addCase(deleteSubCategory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteSubCategory.fulfilled, (state, action) => {
                state.isLoading = false;

                // Nếu đang ở hierarchy view của parent category
                if (state.hierarchyData) {
                    state.hierarchyData.subCategories = state.hierarchyData.subCategories.filter(
                        subCategory => subCategory.categoryId !== action.payload
                    );
                    state.hierarchyData.totalSubCategories -= 1;

                    // Giảm số lượng subcategory active/inactive tương ứng
                    const deletedSubCategory = state.hierarchyData.subCategories.find(
                        subCategory => subCategory.categoryId === action.payload
                    );

                    // Modify using an explicit if-else instead of ternary expression
                    if (deletedSubCategory) {
                        if (deletedSubCategory.status) {
                            state.hierarchyData.activeSubCategories -= 1;
                        } else {
                            state.hierarchyData.inactiveSubCategories -= 1;
                        }
                    }
                }

                // Xóa current category nếu đúng ID
                if (state.currentCategory?.categoryId === action.payload) {
                    state.currentCategory = null;
                }

                state.error = null;
            })
            .addCase(deleteSubCategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const {
    clearError,
    clearCurrentCategory,
    clearHierarchyData
} = categorySlice.actions;

export default categorySlice.reducer;