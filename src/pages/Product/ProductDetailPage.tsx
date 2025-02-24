import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CircleArrowLeft,
    Package2,
    Building2,
    Tag,
    CheckCircle,
    XCircle,
    ImageIcon,
    Calendar,
    Clock,
    DollarSign,
    Plus,
    X,
    ChevronLeft,
    ChevronRight,
    Images,
    Upload,
    Trash2
} from 'lucide-react';
import { formatPrice, formatDate } from '@/utils/format';
import { useProductFinder, useProducts } from '@/hooks/productHooks';
import {
    useProductImages,
    useImageOrder,
    useImageHierarchy
} from '@/hooks/productImageHooks';

// Image Viewer Component
interface ImageViewerProps {
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onPrevious: () => void;
    onNext: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
                                                     images,
                                                     currentIndex,
                                                     onClose,
                                                     onPrevious,
                                                     onNext
                                                 }) => {
    if (images.length === 0) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition-colors" title="Đóng">
                <X className="w-6 h-6" />
            </button>
            <button
                onClick={onPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:text-gray-300 transition-colors"
                title="Ảnh trước"
                disabled={images.length <= 1}
            >
                <ChevronLeft className="w-8 h-8" />
            </button>
            <div className="max-w-4xl max-h-[80vh] p-4">
                <img src={images[currentIndex]} alt={`Image ${currentIndex + 1}`} className="max-w-full max-h-[70vh] object-contain mx-auto" />
                <div className="text-center text-white mt-4">{currentIndex + 1} / {images.length}</div>
            </div>
            <button
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:text-gray-300 transition-colors"
                title="Ảnh tiếp theo"
                disabled={images.length <= 1}
            >
                <ChevronRight className="w-8 h-8" />
            </button>
        </div>
    );
};

// Image Thumbnail Component
interface ImageThumbnailProps {
    src: string;
    onClick: () => void;
    onUpdate: () => void;
    onDelete: () => void;
    isActive: boolean;
    isPrimary?: boolean;
    displayOrder?: number;
}

const ImageThumbnail: React.FC<ImageThumbnailProps> = ({
                                                           src,
                                                           onClick,
                                                           onUpdate,
                                                           onDelete,
                                                           isActive,
                                                           isPrimary,
                                                           displayOrder
                                                       }) => (
    <div className="flex flex-col items-center space-y-2"> {/* Sử dụng flex column để sắp xếp ảnh và nút */}
        <div
            className={`relative aspect-square w-full max-w-[120px] cursor-pointer rounded-lg overflow-hidden border-2 
                transition-all duration-200 transform hover:scale-105
                ${isActive ? 'border-primary' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
            onClick={onClick}
        >
            <img src={src} alt={`Product thumbnail ${displayOrder}`} className="w-full h-full object-cover" />
            {isPrimary && (
                <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded">Chính</div>
            )}
            {displayOrder !== undefined && displayOrder !== null && (
                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">{displayOrder}</div>
            )}
        </div>
        <div className="flex justify-center gap-2 w-full"> {/* Nút căn giữa dưới ảnh */}
            <button
                onClick={onUpdate}
                className="bg-primary text-white text-xs px-2 py-0.5 rounded hover:bg-primary/90 transition-colors flex items-center"
                title="Đổi ảnh"
            >
                <Upload className="w-3 h-3 mr-1" />
                Đổi
            </button>
            <button
                onClick={onDelete}
                className="bg-red-600 text-white text-xs px-2 py-0.5 rounded hover:bg-red-600/90 transition-colors flex items-center"
                title="Xóa ảnh"
            >
                <Trash2 className="w-3 h-3 mr-1" />
                Xóa
            </button>
        </div>
    </div>
);

// Status Badge Component
interface StatusBadgeProps {
    status: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
    <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${status ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
    >
        {status ? (
            <>
                <CheckCircle className="w-3 h-3 mr-1" /> Đang bán
            </>
        ) : (
            <>
                <XCircle className="w-3 h-3 mr-1" /> Ngừng bán
            </>
        )}
    </span>
);

// Main Component
const ProductDetailPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const parsedProductId = parseInt(productId || '0', 10);

    // States
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    const [imageList, setImageList] = useState<{ imageUrl: string; isPrimary?: boolean; displayOrder?: number; imageId: number }[]>([]);

    // Hooks
    const {
        foundById: product,
        isLoading: isLoadingProduct,
        error: productError,
        fetchProductById
    } = useProductFinder(parsedProductId);

    const { updateProduct } = useProducts();

    const {
        isLoading: isLoadingImages,
        error: imagesError,
        imageStats,
        fetchImages,
        uploadImages,
        updateImageFile,
        deleteImage
    } = useProductImages(parsedProductId);

    const { orderedImages } = useImageOrder(parsedProductId);
    const { imageHierarchy, fetchHierarchy } = useImageHierarchy();

    // Fetch dữ liệu khi component mount hoặc productId thay đổi
    useEffect(() => {
        const fetchData = async () => {
            if (parsedProductId && !isNaN(parsedProductId)) {
                try {
                    if (!product || product.productId !== parsedProductId) {
                        await fetchProductById(parsedProductId);
                    }
                    if (!orderedImages || orderedImages.length === 0) {
                        await fetchImages(parsedProductId);
                    }
                    if (!imageHierarchy) {
                        await fetchHierarchy(parsedProductId);
                    }
                } catch (error) {
                    console.error('Failed to fetch data:', error);
                }
            }
        };

        fetchData();
    }, [parsedProductId, product, orderedImages, imageHierarchy, fetchProductById, fetchImages, fetchHierarchy]);

    // Cập nhật danh sách ảnh
    useEffect(() => {
        if (!product || isLoadingProduct || isLoadingImages) return;

        const images: { imageUrl: string; isPrimary?: boolean; displayOrder?: number; imageId: number }[] = [];

        if (product.thumbnail) {
            images.push({
                imageUrl: product.thumbnail,
                isPrimary: true,
                displayOrder: 0,
                imageId: -1
            });
        }

        if (orderedImages) {
            const additionalImages = orderedImages
                .filter(img => !product.thumbnail || img.imageUrl !== product.thumbnail)
                .map((img, index) => ({
                    ...img,
                    displayOrder: product.thumbnail ? (index + 1) : index
                }))
                .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
            images.push(...additionalImages);
        }

        setImageList(images);
    }, [product, orderedImages, isLoadingProduct, isLoadingImages]);

    // Handlers
    const handleBack = () => navigate('/admin/products/list');

    const handleUpdateImage = (imageId: number) => async () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        fileInput.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file && productId && product) {
                try {
                    if (imageId === -1) {
                        const productData = {
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            salePrice: product.salePrice,
                            categoryId: product.category.categoryId,
                            brandId: product.brand.brandId,
                            slug: product.slug,
                            status: product.status
                        };
                        await updateProduct(parsedProductId, productData, file);
                        await fetchProductById(parsedProductId);
                    } else {
                        await updateImageFile(imageId, file);
                        await fetchImages(parsedProductId);
                    }
                } catch (error) {
                    console.error('Failed to update image:', error);
                }
            }
        };

        fileInput.click();
    };

    const handleDeleteImage = (imageId: number) => async () => {
        if (productId && imageId !== -1) {
            try {
                await deleteImage(imageId);
                await fetchImages(parsedProductId);
            } catch (error) {
                console.error('Failed to delete image:', error);
            }
        }
    };

    const handleAddNewImage = async () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        fileInput.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file && productId) {
                try {
                    const uploadRequest = {
                        files: [file],
                        isPrimary: false,
                        displayOrder: imageList.length
                    };
                    await uploadImages(parsedProductId, uploadRequest);
                    await fetchImages(parsedProductId);
                } catch (error) {
                    console.error('Failed to add image:', error);
                }
            }
        };

        fileInput.click();
    };

    const handlePreviousImage = () => {
        setSelectedImageIndex((current) => (current === 0 ? imageList.length - 1 : current - 1));
    };

    const handleNextImage = () => {
        setSelectedImageIndex((current) => (current === imageList.length - 1 ? 0 : current + 1));
    };

    // Trạng thái tải
    if (isLoadingProduct || isLoadingImages) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-600 dark:text-gray-400">Đang tải...</span>
                </div>
            </div>
        );
    }

    // Trạng thái lỗi
    if (productError || imagesError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500 text-center">
                    <p>Có lỗi xảy ra khi tải dữ liệu</p>
                    <p className="text-sm">{productError || imagesError}</p>
                </div>
            </div>
        );
    }

    // Trạng thái không tìm thấy sản phẩm
    if (!product && !isLoadingProduct) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">Không tìm thấy sản phẩm</p>
                    <button
                        onClick={handleBack}
                        className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90"
                    >
                        <CircleArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    // Giao diện chính
    if (!product) return null;

    return (
        <div className="space-y-6 p-4">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-primary transition-colors" title="Quay lại">
                        <CircleArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Package2 className="w-6 h-6 text-primary" /> Chi tiết sản phẩm
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Xem thông tin chi tiết sản phẩm</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Images */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                                    <Images className="w-5 h-5 text-primary" /> Hình ảnh sản phẩm
                                </h2>
                                <div className="flex items-center gap-2">
                                    <div className="text-sm text-gray-500">Tổng số: {imageList.length} ảnh</div>
                                    <button
                                        onClick={handleAddNewImage}
                                        className="inline-flex items-center px-2 py-1 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
                                        title="Thêm ảnh mới"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Thêm ảnh
                                    </button>
                                </div>
                            </div>

                            {imageList.length > 0 ? (
                                <div className="space-y-4">
                                    <div
                                        className="aspect-video relative rounded-lg overflow-hidden border dark:border-gray-700 cursor-pointer hover:border-primary transition-colors bg-gray-50 dark:bg-gray-800"
                                        onClick={() => setIsImageViewerOpen(true)}
                                    >
                                        <img src={imageList[selectedImageIndex].imageUrl} alt="Main product image" className="w-full h-full object-contain" />
                                    </div>

                                    {imageStats && (
                                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                            <div>Ảnh chính: {product.thumbnail ? 1 : 0}</div>
                                            <div>Ảnh phụ: {imageStats.nonPrimaryImages}</div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-4 gap-4"> {/* Giảm từ 6 xuống 4 cột để có không gian */}
                                        {imageList.map((img, index) => (
                                            <ImageThumbnail
                                                key={img.imageId}
                                                src={img.imageUrl}
                                                onClick={() => setSelectedImageIndex(index)}
                                                onUpdate={handleUpdateImage(img.imageId)}
                                                onDelete={handleDeleteImage(img.imageId)}
                                                isActive={selectedImageIndex === index}
                                                isPrimary={img.isPrimary}
                                                displayOrder={img.displayOrder}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Chưa có hình ảnh</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                                <StatusBadge status={product.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <Package2 className="w-4 h-4" />
                                    <span className="text-sm">Danh mục:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{product.category.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <Building2 className="w-4 h-4" />
                                    <span className="text-sm">Thương hiệu:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{product.brand.name}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-primary" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Giá bán:</span>
                                    <span className="text-sm font-medium text-primary">{formatPrice(product.price)}</span>
                                </div>
                                {product.salePrice && (
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-red-500" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Giá khuyến mãi:</span>
                                        <span className="text-sm font-medium text-red-500">{formatPrice(product.salePrice)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Mô tả</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{product.description || 'Không có mô tả'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm">Ngày tạo:</span>
                                    <span className="text-sm">{formatDate(product.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm">Cập nhật:</span>
                                    <span className="text-sm">{formatDate(product.updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-6">
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Thông tin bổ sung</h4>
                            <div className="grid gap-4">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <span className="text-sm">Đường dẫn (slug):</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{product.slug}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <span className="text-sm">Mã sản phẩm:</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">#{product.productId}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-6">
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Trạng thái danh mục & thương hiệu</h4>
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Trạng thái danh mục:</span>
                                    <StatusBadge status={product.category.status} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Trạng thái thương hiệu:</span>
                                    <StatusBadge status={product.brand.status} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {imageHierarchy && (
                        <div className="bg-white dark:bg-secondary rounded-xl shadow-sm p-6">
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Phân cấp hình ảnh</h4>
                                <div className="grid gap-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Tổng số ảnh:</span>
                                        <span className="ml-2">{imageHierarchy.totalImages} ảnh</span>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Ảnh phụ:</span>
                                        <span className="ml-2">{imageHierarchy.nonPrimaryImages} ảnh</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
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
                <button onClick={() => setIsImageViewerOpen(false)}>Close</button>
                <button onClick={handlePreviousImage}>Previous</button>
                <button onClick={handleNextImage}>Next</button>
            </div>
        </div>
    );
};

export default ProductDetailPage;