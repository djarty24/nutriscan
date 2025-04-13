import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Home from './components/Home';
import ScanBarcode from './components/ScanBarcode';
import ProductInfo from './components/ProductInfo';
import Navbar from './components/Navbar';

const App = () => {
	return (
		<Router>
			<ScrollToTop />
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