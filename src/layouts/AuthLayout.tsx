import {useEffect} from 'react';
import {Outlet, Link} from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import logo from '../assets/images/logo_v2.png';

const AuthLayout = () => {
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
            easing: 'ease-in-out',
        });
    }, []);

    return (
        <div className="min-h-screen bg-lightBackground dark:bg-darkBackground">
            <div className="container mx-auto min-h-screen flex flex-col items-center justify-center px-4 py-8">
                <div className="w-full max-w-md ">
                    {/* Logo và branding */}
                    <div className="text-center">
                        <Link to="/" className="inline-block">
                            <div className="mb-6">
                                <div
                                    className="rounded-full mx-auto flex items-center justify-center bg-primary ">
                                    <img
                                        src={logo}
                                        alt="Auras logo"
                                        className="w-20 h-20 object-contain filter brightness-0 invert"
                                    />
                                </div>
                                <h1 className="text-5xl font-extrabold text-primary mt-4 tracking-wide">AURAS</h1>
                            </div>
                        </Link>
                    </div>


                    {/* Auth form container */}
                    <Outlet/>

                    {/* Footer */}
                    <div className="text-center text-sm text-secondary dark:text-highlight mt-8">
                        <p>© {new Date().getFullYear()} Your Company. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;