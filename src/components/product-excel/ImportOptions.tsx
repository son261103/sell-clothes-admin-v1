import React from 'react';
import { ImportOptionsProps } from './types';

const ImportOptions: React.FC<ImportOptionsProps> = ({
                                                         importOptions,
                                                         handleImportOptionChange
                                                     }) => {
    return (
        <div className="border rounded-md p-4 space-y-4">
            <h3 className="font-medium">Tùy chọn nhập liệu</h3>

            <div className="space-y-3">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="validate-only"
                        checked={importOptions.validateOnly}
                        onChange={(e) => handleImportOptionChange('validateOnly', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="validate-only" className="ml-2 block text-sm">
                        Chỉ kiểm tra lỗi (không nhập liệu thực tế)
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="skip-duplicates"
                        checked={importOptions.skipDuplicates}
                        onChange={(e) => handleImportOptionChange('skipDuplicates', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="skip-duplicates" className="ml-2 block text-sm">
                        Bỏ qua sản phẩm trùng lặp
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="update-existing"
                        checked={importOptions.updateExisting}
                        onChange={(e) => handleImportOptionChange('updateExisting', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="update-existing" className="ml-2 block text-sm">
                        Cập nhật sản phẩm đã tồn tại
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="import-images"
                        checked={importOptions.importImages}
                        onChange={(e) => handleImportOptionChange('importImages', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="import-images" className="ml-2 block text-sm">
                        Nhập hình ảnh kèm theo
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="generate-slugs"
                        checked={importOptions.generateSlugs}
                        onChange={(e) => handleImportOptionChange('generateSlugs', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="generate-slugs" className="ml-2 block text-sm">
                        Tự động tạo đường dẫn (slug)
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="generate-skus"
                        checked={importOptions.generateSkus}
                        onChange={(e) => handleImportOptionChange('generateSkus', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="generate-skus" className="ml-2 block text-sm">
                        Tự động tạo mã SKU nếu trống
                    </label>
                </div>
            </div>
        </div>
    );
};

export default ImportOptions;