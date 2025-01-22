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
                                             }) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="form-control w-full">
            <label className="label">
                <span className="label-text text-textDark dark:text-textLight">{label}</span>
            </label>
            <div className="relative">
                <input
                    type={inputType}
                    name={name}
                    placeholder={placeholder}
                    className={`input input-bordered w-full bg-lightBackground dark:bg-darkBackground 
                     text-textDark dark:text-textLight pr-10 
                     ${error ? 'input-error' : ''}`}
                    value={value}
                    onChange={onChange}
                    required={required}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {type === 'password' ? (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="focus:outline-none hover:text-primary transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    ) : (
                        icon
                    )}
                </div>
            </div>
            {error && (
                <label className="label">
                    <span className="label-text-alt text-error">{error}</span>
                </label>
            )}
        </div>
    );
};

export default FormInput;