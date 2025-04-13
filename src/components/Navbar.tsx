import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
	return (
		<nav className="navbar">
			<Link to="/" className="navbar-logo-link">
				<img src="/logo.png" alt="NutriScan Logo" className="navbar-logo" />
			</Link>
		</nav>
	);
};

export default Navbar;