import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductInfo.css';
import BetterAlternatives from './BetterAlternatives';

export interface Product {
	product_name?: string;
	image_url?: string;
	ingredients_text?: string;
	code?: string;
	brands?: string;
	nutriments?: {
		'sugars_serving'?: number;
		'sodium_serving'?: number;
		'saturated-fat_serving'?: number;
		'energy-kcal_serving'?: number;
		'sugars'?: number;
		'sodium'?: number;
		'saturated_fat'?: number;
		'energy-kcal'?: number;
	};
}

export interface IngredientConcern {
	ingredient: string;
	concerns: string | null;
}

const ingredientWarnings: { [key: string]: string } = {
	'red 40': 'Linked to hyperactivity in children',
	'yellow 5': 'May cause allergic reactions',
	'yellow 6': 'Potential carcinogen',
	'bha': 'Classified as possibly carcinogenic',
	'bht': 'Linked to hormone disruption',
	'titanium dioxide': 'Possible DNA damage when inhaled',
	'sodium benzoate': 'Can form benzene (a carcinogen) when combined with vitamin C',
	'potassium bromate': 'Banned in many countries due to cancer risk',
	'propyl gallate': 'Potential endocrine disruptor',
	'parabens': 'Linked to hormone disruption',
	'artificial flavor': 'Generic term for synthetic additives',
	'artificial color': 'Generic term for synthetic dyes',
};

export const checkIngredientSafety = async (ingredient: string): Promise<IngredientConcern> => {
	const lower = ingredient.trim().toLowerCase();
	const matched = Object.entries(ingredientWarnings).find(([key]) =>
		lower.includes(key)
	);

	if (matched) {
		return {
			ingredient,
			concerns: matched[1],
		};
	}

	return {
		ingredient,
		concerns: 'No specific warnings found.',
	};
};

const getClass = (value: number | undefined, thresholds: number[]): string => {
	if (value === undefined || isNaN(value)) return '';
	if (value <= thresholds[0]) return 'good';
	if (value <= thresholds[1]) return 'ok';
	if (value <= thresholds[2]) return 'bad';
	return 'terrible';
};

const getSugarClass = (val?: number) => getClass(val, [5, 9.5, 16.5]);
const getSodiumClass = (val?: number) => getClass(val, [95, 190, 335]);
const getSaturatedFatClass = (val?: number) => getClass(val, [1.1, 2.1, 3.7]);
const getCaloriesClass = (val?: number) => getClass(val, [80, 190, 300]);

const getNutrientValue = (
	nutriments: Product['nutriments'] | undefined,
	primaryKey: string,
	fallbackKey: string
): number | undefined => {
	if (!nutriments) return undefined;
	return nutriments[primaryKey as keyof typeof nutriments] ??
		   nutriments[fallbackKey as keyof typeof nutriments];
};

const ProductInfo = () => {
	const { barcode } = useParams<{ barcode: string }>();
	const navigate = useNavigate();

	const [product, setProduct] = useState<Product | null>(null);
	const [ingredientConcerns, setIngredientConcerns] = useState<IngredientConcern[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showIngredients, setShowIngredients] = useState(false);
	const [showNutrition, setShowNutrition] = useState(false);
	const [openWarnings, setOpenWarnings] = useState<Set<string>>(new Set());

	useEffect(() => {
		const fetchProductData = async () => {
			if (!barcode) {
				setError('No barcode provided in URL.');
				setLoading(false);
				return;
			}

			try {
				const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
				const data = await res.json();

				if (res.ok && data.status === 1) {
					setProduct(data.product);
				} else {
					setError('Product not found.');
				}
			} catch (err) {
				console.error('API error:', err);
				setError('Failed to fetch product data.');
			} finally {
				setLoading(false);
			}
		};

		fetchProductData();
	}, [barcode]);

	useEffect(() => {
		const fetchWarnings = async () => {
			if (!product?.ingredients_text) return;

			const ingredients = product.ingredients_text.split(',').map((i) => i.trim());
			const results: IngredientConcern[] = [];

			for (const ingredient of ingredients) {
				const result = await checkIngredientSafety(ingredient);
				results.push(result);
			}

			setIngredientConcerns(results);
		};

		fetchWarnings();
	}, [product]);

	const handleNewItem = () => navigate('/scan');

	const sugar = getNutrientValue(product?.nutriments, 'sugars_serving', 'sugars');
	const sodium = getNutrientValue(product?.nutriments, 'sodium_serving', 'sodium');
	const satFat = getNutrientValue(product?.nutriments, 'saturated-fat_serving', 'saturated_fat');
	const calories = getNutrientValue(product?.nutriments, 'energy-kcal_serving', 'energy-kcal');

	return (
		<div className="product">
			<h1 id="product-information">Product Information</h1>

			{loading && <p>Loading...</p>}
			{error && <p className="error">{error}</p>}

			{!loading && !error && product && (
				<div className="product-details">
					<img
						src={product.image_url || '/placeholder-image.png'}
						alt={product.product_name || 'Product'}
						className="product-image"
					/>

<h2>
  {(product.brands ? `${product.brands.split(',')[0].trim()} – ` : '') +
   (product.product_name || 'Unnamed Product')}
</h2>

					<div className="dropdown-container">
						<div className="ingredients-dropdown">
							{product.ingredients_text ? (
								<>
									<button
										id="ingredients-list-button"
										className="toggle-button"
										onClick={() => setShowIngredients(!showIngredients)}
									>
										{showIngredients ? 'Hide Ingredient List' : 'Show Full Ingredient List'}
									</button>
									{showIngredients && (
										<p className="ingredients-text">{product.ingredients_text}</p>
									)}
								</>
							) : (
								<p className="ingredients-text">No ingredients information available.</p>
							)}
						</div>
					</div>

					<div className="dropdown-container">
						<div className="nutrition-dropdown">
							<button
								className="toggle-button"
								onClick={() => setShowNutrition(!showNutrition)}
							>
								{showNutrition ? 'Hide Nutrition Info' : 'Show Nutrition Info'}
							</button>

							{showNutrition && (
								product.nutriments ? (
									<div className="nutrition-info">
										<p><strong>Sugar:</strong> <span className={`nutrient-value ${getSugarClass(sugar)}`}>{sugar ?? 'N/A'} g</span></p>
										<p><strong>Sodium:</strong> <span className={`nutrient-value ${getSodiumClass(sodium)}`}>{sodium ?? 'N/A'} g</span></p>
										<p><strong>Saturated Fat:</strong> <span className={`nutrient-value ${getSaturatedFatClass(satFat)}`}>{satFat ?? 'N/A'} g</span></p>
										<p><strong>Calories:</strong> <span className={`nutrient-value ${getCaloriesClass(calories)}`}>{calories ?? 'N/A'} Calories</span></p>
									</div>
								) : (
									<p className="nutrition-text">No nutrition information available.</p>
								)
							)}
						</div>
					</div>

					{ingredientConcerns.some(
						(c) =>
							c.concerns &&
							c.concerns !== 'No specific warnings found.' &&
							c.ingredient.toLowerCase() !== 'water'
					) && (
						<div className="dropdown-container">
							<div className="ingredient-concerns">
								<h3>Ingredient Safety</h3>
								{ingredientConcerns
									.filter(
										(c) =>
											c.concerns &&
											c.concerns !== 'No specific warnings found.' &&
											c.ingredient.toLowerCase() !== 'water'
									)
									.map(({ ingredient, concerns }) => (
										<div key={ingredient} className="ingredient-warning">
											<button
												className="toggle-button small"
												onClick={() => {
													setOpenWarnings((prev) => {
														const updated = new Set(prev);
														updated.has(ingredient)
															? updated.delete(ingredient)
															: updated.add(ingredient);
														return new Set(updated);
													});
												}}
											>
												{openWarnings.has(ingredient)
													? `Hide Warning: ${ingredient}`
													: `Show Warning: ${ingredient}`}
											</button>
											{openWarnings.has(ingredient) && (
												<div className="warning-text">
													<p>{concerns}</p>
												</div>
											)}
										</div>
									))}
							</div>
						</div>
					)}

					<BetterAlternatives product={product} />
				</div>
			)}

			<button id="check-new-item-button" className="product-button" onClick={handleNewItem}>
				Check New Item
			</button>
		</div>
	);
};

export default ProductInfo;

export {
	getSugarClass,
	getSodiumClass,
	getSaturatedFatClass,
	getCaloriesClass
};