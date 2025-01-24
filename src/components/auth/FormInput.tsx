import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FormInputProps {
    label: string;
    type: string;
    name: string;
    placeholder?: string;
    icon?: React.ReactNode;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    autoComplete?: string;
    className?: string;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const FormInput: React.FC<FormInputProps> = ({
                                                 label,
                                                 type,
                                                 name,
                                                 placeholder,
                                                 icon,
                                                 value,
                                                 onChange,
                                                 required = true,
                                                 error,
                                                 disabled = false,
                                                 maxLength,
                                                 minLength,
                                                 pattern,
                                                 autoComplete,
                                                 className = '',
                                                 onBlur,
                                             }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    return (
        <div className="form-control w-full">
            <label className="label">
                <span className="label-text text-gray-700 dark:text-gray-300 font-medium">
                    {label}
                    {required && <span className="text-error ml-1">*</span>}
                </span>
            </label>
            <div className="relative">
                <input
                    type={inputType}
                    name={name}
                    placeholder={placeholder}
                    className={`input input-bordered w-full
                        bg-white dark:bg-gray-700
                        text-gray-900 dark:text-gray-100
                        border-gray-300 dark:border-gray-600
                        focus:border-primary dark:focus:border-primary
                        focus:ring-2 focus:ring-primary/20
                        disabled:bg-gray-100 dark:disabled:bg-gray-800
                        disabled:cursor-not-allowed
                        transition-all duration-200
                        ${error ? 'input-error border-error focus:border-error' : ''}
                        ${isFocused ? 'border-primary' : ''}
                        ${icon ? 'pl-10' : ''}
                        ${className}`}
                    value={value}
                    onChange={onChange}
                    required={required}
                    disabled={disabled}
                    maxLength={maxLength}
                    minLength={minLength}
                    pattern={pattern}
                    autoComplete={autoComplete}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    aria-invalid={error ? 'true' : 'false'}
                />

                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        {icon}
                    </span>
                )}

                {type === 'password' && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2
                            text-gray-400 hover:text-primary focus:outline-none
                            transition-colors duration-200"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>

            {error && (
                <label className="label">
                    <span className="label-text-alt text-error text-sm">{error}</span>
                </label>
            )}
        </div>
    );
};

export default FormInput;