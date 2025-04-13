import { useNavigate } from 'react-router-dom';
import './Home.css'

const Home = () => {
	const navigate = useNavigate();

	const handleStartScan = () => {
		navigate('/scan');
	};

	return (
		<div className='home'>
			<h1>Welcome to NutriScan</h1>
            <p>Understand what you eat.</p>
			<button className='home-button' onClick={handleStartScan}>Start Scanner</button>
		</div>
	);
};

export default Home;