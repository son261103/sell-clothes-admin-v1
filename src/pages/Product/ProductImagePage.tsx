import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
    Image as ImageIcon,
    Upload,
    RefreshCw,
    AlertCircle,
    CircleArrowLeft,
    X,
    Plus
} from 'lucide-react';

import {useProductImages} from '../../hooks/productImageHooks';
import {useProductFinder} from '@/hooks/productHooks';
import ProductImageGallery from '../../components/product-image/ProductImageGallery';
import type {ProductImageUploadRequest} from '@/types';

const DeleteConfirmationModal = ({
                                     isOpen,
                                     imageUrl,
                                     onCancel,
                                     onConfirm
                                 }: {
    isOpen: boolean;
    imageUrl: string | null;
    onCancel: () => void;
    onConfirm: () => void;
}) => {
    if (!isOpen || !imageUrl) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onCancel}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div
                    className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                        <div className="sm:flex sm:items-start">
                            <div
                                className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400"/>
                            </div>

                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                                    Xác nhận xóa hình ảnh
                                </h3>

                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Bạn có chắc chắn muốn xóa hình ảnh này?
                                        Hành động này không thể hoàn tác.
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <img
                                        src={imageUrl}
                                        alt="Image to delete"
                                        className="w-full h-40 object-contain rounded-lg border dark:border-gray-700"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Xác nhận xóa
                        </button>

                        <button
                            type="button"
                            onClick={onCancel}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductImagePage: React.FC = () => {
    const navigate = useNavigate();
    const {productId} = useParams<{ productId: string }>();
    const {
        foundById: product,
        isLoading: isLoadingProduct,
        fetchProductById
    } = useProductFinder(parseInt(productId || '0'));
    const {
        images,
        isLoading,
        error,
        imageStats,
        fetchImages,
        uploadImages,
        deleteImage,
        updateImage
    } = useProductImages(parseInt(productId || '0'));

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<{ id: number; url: string } | null>(null);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [previewFiles, setPreviewFiles] = useState<File[]>([]);

    useEffect(() => {
        if (productId) {
            const id = parseInt(productId);
            fetchProductById(id);
            fetchImages(id);
        }
    }, [productId, fetchProductById, fetchImages]);

    const handleBack = () => navigate(`/admin/products/${productId}`);

    const handleRefresh = async () => {
        if (productId) {
            setIsRefreshing(true);
            await fetchImages(parseInt(productId));
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        handleFilesSelected(files);
    };

    const handleFilesSelected = (files: File[]) => {
        const validFiles = files.filter(file =>
            file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
        );

        setPreviewFiles(prevFiles => [...prevFiles, ...validFiles]);
    };

    const removePreviewFile = (index: number) => {
        setPreviewFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const updateUploadProgress = (fileName: string, progress: number) => {
        setUploadProgress(prev => ({
            ...prev,
            [fileName]: progress
        }));
    };

    const handleUploadAll = async () => {
        if (!productId || previewFiles.length === 0) return;

        // Initialize progress for all files
        previewFiles.forEach(file => {
            updateUploadProgress(file.name, 0);
        });

        try {
            // Simulate progress updates
            // In a real implementation, this would come from your upload service
            for (const file of previewFiles) {
                // Simulate progress steps
                for (let progress = 0; progress <= 100; progress += 20) {
                    updateUploadProgress(file.name, progress);
                    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
                }
            }

            const request: ProductImageUploadRequest = {files: previewFiles};
            await uploadImages(parseInt(productId), request);

            // Clear progress and preview files after successful upload
            setUploadProgress({});
            setPreviewFiles([]);
            await handleRefresh();
        } catch (error) {
            // Handle error case
            console.error('Upload failed:', error);
            // Clear progress on error
            setUploadProgress({});
        }
    };

    const handleDeleteClick = (imageId: number, imageUrl: string) => {
        setImageToDelete({id: imageId, url: imageUrl});
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (imageToDelete) {
            await deleteImage(imageToDelete.id);
            setShowDeleteModal(false);
            setImageToDelete(null);
            await handleRefresh();
        }
    };

    const handleSetPrimary = async (imageId: number) => {
        await updateImage(imageId, {isPrimary: true});
        await handleRefresh();
    };

    // Loading state
    if (isLoadingProduct || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
                    <span className="text-gray-600 dark:text-gray-400">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-1 border-b">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-primary transition-colors"
                        title="Quay lại"
                    >
                        <CircleArrowLeft className="w-6 h-6"/>
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <ImageIcon className="w-6 h-6 text-primary"/>
                            {product ? `Quản lý hình ảnh - ${product.name}` : 'Quản lý hình ảnh sản phẩm'}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Tải lên và quản lý hình ảnh cho sản phẩm
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleRefresh}
                        className={`h-9 px-3 text-sm rounded-md border border-gray-200 dark:border-gray-700 
                            text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 
                            flex items-center gap-1.5 ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}/>
                        <span>Làm mới</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-secondary rounded-xl p-4 shadow-sm">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Tổng số ảnh</div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {imageStats?.totalImages || 0}
                    </div>
                </div>
                <div className="bg-white dark:bg-secondary rounded-xl p-4 shadow-sm">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Ảnh chính</div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {imageStats?.primaryImages || 0}
                    </div>
                </div>
                <div className="bg-white dark:bg-secondary rounded-xl p-4 shadow-sm">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Ảnh phụ</div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {imageStats?.nonPrimaryImages || 0}
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Upload Section */}
            <div className="bg-white dark:bg-secondary rounded-xl shadow-sm">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <Upload className="w-5 h-5 text-primary"/>
                        Tải lên hình ảnh
                    </h2>

                    {/* Drop Zone */}
                    <div
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center 
                            ${isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="text-gray-500 dark:text-gray-400">
                            <Upload className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                            <p className="text-sm">
                                Kéo và thả hình ảnh vào đây hoặc{' '}
                                <label className="text-primary cursor-pointer">
                                    chọn từ thiết bị
                                    <input
                                        type="file"
                                        className="hidden"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            handleFilesSelected(files);
                                            e.target.value = '';
                                        }}
                                    />
                                </label>
                            </p>
                            <p className="text-xs mt-2">
                                Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)
                            </p>
                        </div>
                    </div>

                    {/* Preview Files */}
                    {previewFiles.length > 0 && (
                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                    Hình ảnh đã chọn ({previewFiles.length})
                                </h3>
                                <button
                                    onClick={handleUploadAll}
                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
                                >
                                    <Plus className="w-4 h-4 mr-1.5"/>
                                    Tải lên tất cả
                                </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {previewFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className="relative aspect-square rounded-lg border dark:border-gray-700 overflow-hidden group"
                                    >
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => removePreviewFile(index)}
                                            className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4"/>
                                        </button>
                                        {uploadProgress[file.name] !== undefined && (
                                            <div
                                                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <div className="h-1 w-20 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{width: `${uploadProgress[file.name]}%`}}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Existing Images */}
            <div className="bg-white dark:bg-secondary rounded-xl shadow-sm">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <ImageIcon className="w-5 h-5 text-primary"/>
                        Hình ảnh hiện có
                    </h2>

                    <ProductImageGallery
                        images={images}
                        isLoading={isLoading}
                        onDelete={handleDeleteClick}
                        onSetPrimary={handleSetPrimary}
                    />
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                imageUrl={imageToDelete?.url || null}
                onCancel={() => {
                    setShowDeleteModal(false);
                    setImageToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default ProductImagePage;