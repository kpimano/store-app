import { getProducts, getDeals } from '@/lib/wordpress';

export default async function HomePage() {
  const products = await getProducts();
  const deals = await getDeals();

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Deals Site — API Test</h1>

      <h2>Deals ({deals.length})</h2>
      {deals.map((deal: any) => (
        <div key={deal.id} style={{ border: '1px solid #ccc', margin: '1rem', padding: '1rem' }}>
          <h3>{deal.title.rendered}</h3>
          <p>Type: {deal.acf?.deal_type}</p>
          <p>Active: {deal.acf?.is_active ? 'Yes' : 'No'}</p>
        </div>
      ))}

      <h2>Products ({products.length})</h2>
      {products.map((product: any) => (
        <div key={product.id} style={{ border: '1px solid #ccc', margin: '1rem', padding: '1rem' }}>
          <h3>{product.title.rendered}</h3>
          <p>Price INR: ₹{product.acf?.sales_price_inr}</p>
          <p>Brand: {product.acf?.brand}</p>
          <p>Trending: {product.acf?.is_trending ? 'Yes' : 'No'}</p>
        </div>
      ))}
    </main>
  );
}