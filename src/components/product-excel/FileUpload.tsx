import React from 'react';
import { Upload, PackageOpen, FileSpreadsheet, Loader2, X } from 'lucide-react';
import { FileUploadProps } from './types';

const FileUpload: React.FC<FileUploadProps> = ({
                                                   selectedFile,
                                                   setSelectedFile,
                                                   isAnalyzingFile
                                               }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) {
            setSelectedFile(null);
            return;
        }
        setSelectedFile(files[0]);
    };

    return (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full mb-4">
                <PackageOpen className="h-8 w-8 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-sm font-medium mb-2">Tải lên tập tin Excel hoặc ZIP</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 text-center">
                Hỗ trợ định dạng .xlsx, .xls hoặc .zip (bao gồm Excel + hình ảnh)
            </p>

            <label
                htmlFor="file-upload"
                className={`inline-flex justify-center h-9 px-4 text-sm rounded-md ${
                    selectedFile
                        ? 'bg-gray-200 dark:bg-gray-700 text-textDark dark:text-textLight'
                        : 'bg-primary text-white hover:bg-primary/90'
                } items-center gap-1.5 cursor-pointer ${isAnalyzingFile ? 'opacity-50 pointer-events-none' : ''}`}
            >
                {isAnalyzingFile ? (
                    <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Đang phân tích...</span>
                    </>
                ) : (
                    <>
                        <Upload className="h-3.5 w-3.5"/>
                        <span>{selectedFile ? 'Chọn tập tin khác' : 'Chọn tập tin'}</span>
                    </>
                )}
            </label>
            <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.zip"
                onChange={handleFileChange}
                disabled={isAnalyzingFile}
            />

            {selectedFile && !isAnalyzingFile && (
                <div className="mt-4 flex items-center">
                    <FileSpreadsheet className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">{selectedFile.name}</span>
                    <button
                        onClick={() => setSelectedFile(null)}
                        className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileUpload;