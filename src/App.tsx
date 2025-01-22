import {useEffect} from 'react';
import {useRoutes} from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {routes} from "./routes";

const App = () => {
    const element = useRoutes(routes);

    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true,
            easing: 'ease-in-out',
        });
    }, []);

    return element;
};

export default App;