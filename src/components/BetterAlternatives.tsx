import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
	Product,
	checkIngredientSafety,
	getSugarClass,
	getSodiumClass,
	getSaturatedFatClass,
	getCaloriesClass,
} from './ProductInfo';

interface Alternative {
	product: Product;
	warningsCount: number;
}

const getTooltipLabel = (level: string) => {
	switch (level) {
		case 'good': return 'Great';
		case 'ok': return 'OK';
		case 'bad': return 'Bad';
		case 'terrible': return 'Terrible';
		default: return '';
	}
};

const checkAllWarnings = async (
	ingredientsText: string,
	cache: Map<string, string>
): Promise<number> => {
	const ingredients = ingredientsText.split(',').map((i) => i.trim().toLowerCase());

	const results = await Promise.all(
		ingredients.map(async (ingredient): Promise<number> => {
			if (ingredient === 'water') return 0;

			let concerns = cache.get(ingredient);
			if (!concerns) {
				const result = await checkIngredientSafety(ingredient);
				concerns = result.concerns ?? 'No specific warnings found.';
				cache.set(ingredient, concerns);
			}

			return concerns !== 'No specific warnings found.' ? 1 : 0;
		})
	);

	return results.reduce((sum, val) => sum + val, 0);
};

const BetterAlternatives = ({ product }: { product: Product }) => {
	const [alternatives, setAlternatives] = useState<Alternative[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchAlternatives = async () => {
			if (!product.product_name) return;

			const cache = new Map<string, string>();

			try {
				const query = encodeURIComponent(product.product_name.split(' ')[0]);
				const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&page_size=10`;

				const res = await fetch(url);
				const data = await res.json();

				const currentWarningCount = product.ingredients_text
					? await checkAllWarnings(product.ingredients_text, cache)
					: Infinity;

				const validAlternatives: Alternative[] = [];

				for (const alt of data.products) {
					if (
						!alt.ingredients_text ||
						alt.code === product.code ||
						!alt.product_name
					)
						continue;

					const warningCount = await checkAllWarnings(alt.ingredients_text, cache);

					if (warningCount < currentWarningCount) {
						validAlternatives.push({
							product: {
								product_name: alt.product_name,
								image_url: alt.image_url,
								ingredients_text: alt.ingredients_text,
								code: alt.code,
								nutriments: alt.nutriments,
							},
							warningsCount: warningCount,
						});
					}

					if (validAlternatives.length >= 5) break;
				}

				setAlternatives(validAlternatives);
			} catch (err) {
				console.error('Error fetching alternatives:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchAlternatives();
	}, [product]);

	if (loading) return <p>Loading better alternatives...</p>;

	if (alternatives.length === 0) return <p>No safer alternatives found.</p>;

	return (
		<div className="better-alternatives">
			<h3>Better Alternatives</h3>
			<div className="alternative-list">
				{alternatives.map((alt, index) => {
					const nutriments = alt.product.nutriments;

					const sugar = nutriments?.['sugars_serving'] ?? nutriments?.['sugars'];
					const sodium = nutriments?.['sodium_serving'] ?? nutriments?.['sodium'];
					const fat = nutriments?.['saturated-fat_serving'] ?? nutriments?.['saturated_fat'];
					const calories = nutriments?.['energy-kcal_serving'] ?? nutriments?.['energy-kcal'];

					const sugarClass = getSugarClass(sugar);
					const sodiumClass = getSodiumClass(sodium);
					const fatClass = getSaturatedFatClass(fat);
					const caloriesClass = getCaloriesClass(calories);

					return (
						<Link
							to={`/product-info/${alt.product.code}`}
							className="alternative-card"
							key={index}
						>
							{alt.product.image_url && (
								<img src={alt.product.image_url} alt={alt.product.product_name} />
							)}
							<p><strong>{alt.product.product_name}</strong></p>
							<p>{alt.warningsCount} ingredient warning(s)</p>

							{nutriments && (
								<div className="nutrition-preview">
									<p className="nutrient">
										<span
											className={`nutrient-dot ${sugarClass}`}
											title={getTooltipLabel(sugarClass)}
										></span>
										Sugar: {sugar ?? 'N/A'}g
									</p>
									<p className="nutrient">
										<span
											className={`nutrient-dot ${sodiumClass}`}
											title={getTooltipLabel(sodiumClass)}
										></span>
										Sodium: {sodium ?? 'N/A'}g
									</p>
									<p className="nutrient">
										<span
											className={`nutrient-dot ${fatClass}`}
											title={getTooltipLabel(fatClass)}
										></span>
										Fat: {fat ?? 'N/A'}g
									</p>
									<p className="nutrient">
										<span
											className={`nutrient-dot ${caloriesClass}`}
											title={getTooltipLabel(caloriesClass)}
										></span>
										Calories: {calories ?? 'N/A'}
									</p>
								</div>
							)}
						</Link>
					);
				})}
			</div>
		</div>
	);
};

export default BetterAlternatives;