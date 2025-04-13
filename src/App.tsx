import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import ScanBarcode from './components/ScanBarcode';
import ProductInfo from './components/ProductInfo';
import Navbar from './components/Navbar';

const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/scan" element={<ScanBarcode />} />
                <Route path="/product-info/:barcode" element={<ProductInfo />} />
            </Routes>
        </Router>
    );
};

export default App;