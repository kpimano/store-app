import {
  getCategories,
  getDeals,
  getProducts,
  getCoupons,
  getTrendingProducts,
  getFeaturedProducts,
} from '@/lib/wordpress';

export const revalidate = 86400;

export default async function HomePage() {
  const [products, deals, coupons, categories, trending, featured] =
    await Promise.all([
      getProducts({ per_page: 5 }),
      getDeals(),
      getCoupons(),
      getCategories(),
      getTrendingProducts(),
      getFeaturedProducts(),
    ]);

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        marginBottom: '0.5rem',
      }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem' }}>
          shopbingepoint.in — API Test
        </h1>
        <span style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
          Han Ankit..
        </span>
        <div />
      </div>

      <div style={{
        textAlign: 'center',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        marginBottom: '2rem',
      }}>
        Kya Chal rha hai, Khana Khaya!! Haha
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Categories ({categories?.top_level?.length ?? 0})</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories?.top_level?.map((c: any) => (
            <span key={c.id} style={{
              padding: '4px 12px',
              background: '#f0f0f0',
              borderRadius: '20px',
              fontSize: '14px',
            }}>
              {c.name} ({c.count})
            </span>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Deals ({Array.isArray(deals) ? deals.length : 0})</h2>
        {Array.isArray(deals) && deals.map((d: any) => (
          <div key={d.id} style={{
            border: '1px solid #ddd',
            padding: '12px',
            marginBottom: '8px',
            borderRadius: '8px',
          }}>
            <strong>{d.title}</strong>
            <p>Type: {d.acf?.deal_type} | Active: {d.acf?.is_active ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Products ({products?.total ?? 0} total)</h2>
        {products?.products?.map((p: any) => (
          <div key={p.id} style={{
            border: '1px solid #ddd',
            padding: '12px',
            marginBottom: '8px',
            borderRadius: '8px',
          }}>
            <strong>{p.title}</strong>
            <p>
              Price: ₹{p.sale_price || p.price}
              {p.on_sale && <span style={{ color: 'red' }}> (ON SALE)</span>}
            </p>
            <p>Categories: {p.categories?.map((c: any) => c.name).join(', ')}</p>
            <p>Affiliate URL: {p.acf?.affiliate_url || '—'}</p>
            <p>Trending: {p.acf?.is_trending ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Trending ({trending?.products?.length ?? 0})</h2>
        {trending?.products?.map((p: any) => (
          <div key={p.id} style={{
            padding: '8px',
            background: '#fff8e1',
            marginBottom: '4px',
            borderRadius: '4px',
          }}>
            {p.title} — ₹{p.price}
          </div>
        ))}
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Featured ({featured?.products?.length ?? 0})</h2>
        {featured?.products?.map((p: any) => (
          <div key={p.id} style={{
            padding: '8px',
            background: '#e8f5e9',
            marginBottom: '4px',
            borderRadius: '4px',
          }}>
            {p.title} — ₹{p.price}
          </div>
        ))}
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Coupons ({Array.isArray(coupons) ? coupons.length : 0})</h2>
        {Array.isArray(coupons) && coupons.map((c: any) => (
          <div key={c.id} style={{
            border: '1px solid #ddd',
            padding: '12px',
            marginBottom: '8px',
            borderRadius: '8px',
          }}>
            <strong>{c.code}</strong>
            <p>{c.discount_type} — {c.amount}% off</p>
            <p>Expires: {c.date_expires || 'No expiry'}</p>
          </div>
        ))}
      </section>

    </main>
  );
}