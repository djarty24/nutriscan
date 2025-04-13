import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScanbotSDK from 'scanbot-web-sdk/ui';
import './ScanBarcode.css';

const ScanBarcode = () => {
	const [scanResult, setScanResult] = useState<string>('');
	const navigate = useNavigate();

	useEffect(() => {
		const initializeSDK = async () => {
			await ScanbotSDK.initialize({
				licenseKey: '',
				enginePath: '/wasm/',
			});
			startScanner();
		};

		initializeSDK();
	}, []);

	const startScanner = async () => {
		const config = new ScanbotSDK.UI.Config.BarcodeScannerScreenConfiguration();
		const result = await ScanbotSDK.UI.createBarcodeScanner(config);
		if (result && result.items.length > 0) {
			const barcode = result.items[0].barcode.text;
			console.log("Scanned barcode:", barcode);
			setScanResult(barcode);
			// Navigate to ProductInfo route with barcode passed in the state
            navigate(`/product-info/${barcode}`);
		}
	};

	return (
		<div className="scan">
			<h1>Scanning...</h1>
			{scanResult && <p>Scanned Barcode: {scanResult}</p>}
		</div>
	);
};

export default ScanBarcode;