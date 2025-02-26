import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircleArrowLeft, Package2 } from 'lucide-react';

// Product Hooks
import { useProductFinder, useProducts } from '@/hooks/productHooks';

// Image Hooks
import { useProductImages, useImageOrder, useImageHierarchy } from '@/hooks/productImageHooks';

// Variant Hooks
import { useVariants, useVariantStock, useVariantsByProduct, useVariantAttributes, useVariantHierarchy } from '@/hooks/productVariantHooks';

// Components
import { ImageViewer } from '../../components/product/product-detail/ImageViewer';
import { ProductImagesSection } from '../../components/product/product-detail/ProductImagesSection';
import { ProductDetailsSection } from '../../components/product/product-detail/ProductDetailsSection';
import { ProductVariantsSection } from '../../components/product/product-variant/ProductVariantsSection';

// Types
import { ProductVariantCreateRequest, ProductVariantUpdateRequest } from '@/types';

const ProductDetailPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const parsedProductId = parseInt(productId || '0', 10);

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    const [imageList, setImageList] = useState<
        { imageUrl: string; isPrimary?: boolean; displayOrder?: number; imageId: number }[]
    >([]);

    // Product Hooks
    const { foundById: product, isLoading: isLoadingProduct, error: productError, fetchProductById } = useProductFinder(parsedProductId);
    const { updateProduct } = useProducts();

    // Image Hooks
    const { isLoading: isLoadingImages, error: imagesError, fetchImages, uploadImages, updateImageFile, deleteImage } = useProductImages(parsedProductId);
    const { orderedImages } = useImageOrder(parsedProductId);
    const { fetchHierarchy: fetchImgHierarchy } = useImageHierarchy();

    // Variant Hooks
    const { createVariant, updateVariant, deleteVariant, toggleVariantStatus, error: variantsError, isLoading: isLoadingVariants } = useVariants();
    const { updateStockQuantity } = useVariantStock();
    const { variantsByProduct, fetchVariantsByProduct, isLoading: isLoadingProductVariants, error: productVariantsError } = useVariantsByProduct(parsedProductId);
    const { getAvailableSizes, getAvailableColors } = useVariantAttributes(parsedProductId);
    const { isLoading: isLoadingHierarchy, error: hierarchyError, fetchHierarchy } = useVariantHierarchy();

    useEffect(() => {
        const fetchData = async () => {
            if (!parsedProductId || isNaN(parsedProductId)) return;
            try {
                if (!product || product.productId !== parsedProductId) await fetchProductById(parsedProductId);
                await Promise.all([
                    fetchImages(parsedProductId),
                    fetchImgHierarchy(parsedProductId),
                    fetchHierarchy(parsedProductId),
                    fetchVariantsByProduct(),
                    getAvailableSizes(),
                    getAvailableColors()
                ]);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        fetchData();
    }, [parsedProductId, product, fetchProductById, fetchImages, fetchImgHierarchy, fetchHierarchy, fetchVariantsByProduct, getAvailableSizes, getAvailableColors]);

    useEffect(() => {
        if (!product || isLoadingProduct || isLoadingImages) return;
        const images = [
            ...(product.thumbnail ? [{ imageUrl: product.thumbnail, isPrimary: true, displayOrder: 0, imageId: -1 }] : []),
            ...(orderedImages?.filter(img => !product.thumbnail || img.imageUrl !== product.thumbnail)
                .map((img, index) => ({ ...img, displayOrder: product.thumbnail ? index + 1 : index }))
                .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)) || [])
        ];
        setImageList(images);
    }, [product, orderedImages, isLoadingProduct, isLoadingImages]);

    const handleBack = () => navigate('/admin/products/list');

    const handleUpdateImage = (imageId: number) => async () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file || !productId || !product) return;
            try {
                if (imageId === -1) {
                    const productData = { name: product.name, description: product.description, price: product.price, salePrice: product.salePrice, categoryId: product.category.categoryId, brandId: product.brand.brandId, slug: product.slug, status: product.status };
                    await updateProduct(parsedProductId, productData, file);
                    await fetchProductById(parsedProductId);
                } else {
                    await updateImageFile(imageId, file);
                    await fetchImages(parsedProductId);
                }
            } catch (error) {
                console.error('Failed to update image:', error);
            }
        };
        fileInput.click();
    };

    const handleDeleteImage = (imageId: number) => async () => {
        if (!productId || imageId === -1) return;
        try {
            await deleteImage(imageId);
            await fetchImages(parsedProductId);
        } catch (error) {
            console.error('Failed to delete image:', error);
        }
    };

    const handleAddNewImage = async () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file || !productId) return;
            try {
                const uploadRequest = { files: [file], isPrimary: false, displayOrder: imageList.length };
                await uploadImages(parsedProductId, uploadRequest);
                await fetchImages(parsedProductId);
            } catch (error) {
                console.error('Failed to add image:', error);
            }
        };
        fileInput.click();
    };

    const handlePreviousImage = () => setSelectedImageIndex(prev => prev === 0 ? imageList.length - 1 : prev - 1);
    const handleNextImage = () => setSelectedImageIndex(prev => prev === imageList.length - 1 ? 0 : prev + 1);

    const handleAddNewVariant = async (variantData: ProductVariantCreateRequest, imageFile?: File) => {
        try {
            await createVariant(variantData, imageFile);
            await Promise.all([fetchVariantsByProduct(), fetchHierarchy(parsedProductId)]);
        } catch (error) {
            console.error('Failed to add variant:', error);
        }
    };

    const handleUpdateVariant = async (id: number, variantData: ProductVariantUpdateRequest, imageFile?: File) => {
        try {
            await updateVariant(id, variantData, imageFile);
            await Promise.all([fetchVariantsByProduct(), fetchHierarchy(parsedProductId)]);
        } catch (error) {
            console.error('Failed to update variant:', error);
        }
    };

    const handleDeleteVariant = async (id: number) => {
        try {
            await deleteVariant(id);
            await Promise.all([fetchVariantsByProduct(), fetchHierarchy(parsedProductId)]);
        } catch (error) {
            console.error('Failed to delete variant:', error);
        }
    };

    const handleToggleVariantStatus = async (id: number) => {
        try {
            await toggleVariantStatus(id);
            await Promise.all([fetchVariantsByProduct(), fetchHierarchy(parsedProductId)]);
            return true;
        } catch (error) {
            console.error('Failed to toggle variant status:', error);
            return false;
        }
    };

    const handleUpdateStockQuantity = async (id: number, quantity: number) => {
        try {
            await updateStockQuantity(id, quantity);
            await Promise.all([fetchVariantsByProduct(), fetchHierarchy(parsedProductId)]);
            return true;
        } catch (error) {
            console.error('Failed to update stock quantity:', error);
            return false;
        }
    };

    if (isLoadingProduct || isLoadingImages || isLoadingVariants || isLoadingProductVariants || isLoadingHierarchy) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <span className="text-base text-gray-600 dark:text-gray-400">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (productError || imagesError || variantsError || productVariantsError || hierarchyError) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center text-red-500">
                    <p className="text-base font-medium">Có lỗi xảy ra khi tải dữ liệu</p>
                    <p className="mt-1 text-sm">{productError || imagesError || variantsError || productVariantsError || hierarchyError}</p>
                </div>
            </div>
        );
    }

    if (!product && !isLoadingProduct) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <p className="text-base text-gray-600 dark:text-gray-400">Không tìm thấy sản phẩm</p>
                    <button onClick={handleBack} className="mt-2 inline-flex items-center rounded-lg bg-primary px-4 py-1 text-sm font-medium text-white hover:bg-primary/90">
                        <CircleArrowLeft className="mr-1 h-4 w-4" /> Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className=" ">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-2 border-b">
                <div className="flex items-center gap-2">
                    <button onClick={handleBack} className="rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-primary transition-colors" aria-label="Quay lại">
                        <CircleArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                            <Package2 className="h-6 w-6 text-primary" /> Chi tiết sản phẩm
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Quản lý thông tin sản phẩm và các biến thể</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg p-3 shadow-sm">
                    <ProductImagesSection
                        imageList={imageList}
                        selectedImageIndex={selectedImageIndex}
                        setSelectedImageIndex={setSelectedImageIndex}
                        setIsImageViewerOpen={setIsImageViewerOpen}
                        handleAddNewImage={handleAddNewImage}
                        handleUpdateImage={handleUpdateImage}
                        handleDeleteImage={handleDeleteImage}
                    />
                </div>
                <div className="rounded-lg p-3 shadow-sm">
                    <ProductDetailsSection product={product} />
                </div>
            </div>

            <div className="rounded-lg p-3 shadow-sm">
                <ProductVariantsSection
                    variants={variantsByProduct || []}
                    isLoading={isLoadingVariants || isLoadingProductVariants}
                    error={variantsError || productVariantsError}
                    toggleVariantStatus={handleToggleVariantStatus}
                    updateStockQuantity={handleUpdateStockQuantity}
                    handleAddNewVariant={handleAddNewVariant}
                    handleUpdateVariant={handleUpdateVariant}
                    handleDeleteVariant={handleDeleteVariant}
                    productId={parsedProductId}
                />
            </div>

            {isImageViewerOpen && (
                <ImageViewer
                    images={imageList.map(img => img.imageUrl)}
                    currentIndex={selectedImageIndex}
                    onClose={() => setIsImageViewerOpen(false)}
                    onPrevious={handlePreviousImage}
                    onNext={handleNextImage}
                />
            )}

            <div className="sr-only">
                <button onClick={() => setIsImageViewerOpen(false)}>Đóng trình xem ảnh</button>
                <button onClick={handlePreviousImage}>Ảnh trước</button>
                <button onClick={handleNextImage}>Ảnh sau</button>
            </div>
        </div>
    );
};

export default ProductDetailPage;