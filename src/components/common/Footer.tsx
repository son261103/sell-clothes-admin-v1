import { Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="mt-auto top-1.5 py-4 px-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-textDark dark:text-textLight">
                    © {new Date().getFullYear()} Your Company. All rights reserved.
                </p>
                <div className="flex items-center space-x-1 text-sm text-textDark dark:text-textLight">
                    <span>Made with</span>
                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                    <span>by Your Team</span>
                </div>
                <div className="flex items-center gap-4">
                    <a
                        href="#"
                        className="text-sm text-textDark dark:text-textLight hover:text-primary dark:hover:text-primary"
                    >
                        Privacy Policy
                    </a>
                    <a
                        href="#"
                        className="text-sm text-textDark dark:text-textLight hover:text-primary dark:hover:text-primary"
                    >
                        Terms of Service
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;