const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function getProducts(filter?: string, category?: string) {
  let url = `${SITE_URL}/api/products`;
  const params = new URLSearchParams();
  if (filter)   params.set('filter', filter);
  if (category) params.set('category', category);
  if (params.toString()) url += `?${params.toString()}`;

  const res = await fetch(url, { cache: 'no-store' });
  return res.json();
}

export async function getTrendingProducts() {
  return getProducts('trending');
}

export async function getFeaturedProducts() {
  return getProducts('featured');
}

export async function getTopSellingProducts() {
  return getProducts('top_selling');
}

export async function getNewArrivals() {
  return getProducts('new_arrival');
}

export async function getDeals() {
  const res = await fetch(`${SITE_URL}/api/deals`, { cache: 'no-store' });
  return res.json();
}

export async function getCoupons() {
  const res = await fetch(`${SITE_URL}/api/coupons`, { cache: 'no-store' });
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${SITE_URL}/api/categories`, { cache: 'no-store' });
  return res.json();
}

// const WP_BASE_URL = process.env.NEXT_PUBLIC_WP_API_URL || 
//                     'http://localhost/wordpress/wp-json/wp/v2';

// // Fetch all products
// export async function getProducts() {
//   const res = await fetch(`${WP_BASE_URL}/product?acf_format=standard&per_page=20`);
//   if (!res.ok) throw new Error('Failed to fetch products');
//   return res.json();
// }

// // Fetch trending products only
// export async function getTrendingProducts() {
//   const res = await fetch(
//     `${WP_BASE_URL}/product?acf_format=standard&meta_key=is_trending&meta_value=1`
//   );
//   return res.json();
// }

// // Fetch featured products
// export async function getFeaturedProducts() {
//   const res = await fetch(
//     `${WP_BASE_URL}/product?acf_format=standard&meta_key=is_featured&meta_value=1`
//   );
//   return res.json();
// }

// // Fetch top selling products
// export async function getTopSellingProducts() {
//   const res = await fetch(
//     `${WP_BASE_URL}/product?acf_format=standard&meta_key=is_top_selling&meta_value=1`
//   );
//   return res.json();
// }

// // Fetch new arrivals
// export async function getNewArrivals() {
//   const res = await fetch(
//     `${WP_BASE_URL}/product?acf_format=standard&meta_key=is_new_arrival&meta_value=1&orderby=date&order=desc`
//   );
//   return res.json();
// }

// // Fetch all deals (hero banner)
// export async function getDeals() {
//   const res = await fetch(
//     `${WP_BASE_URL}/deal?acf_format=standard&orderby=menu_order&order=asc`
//   );
//   return res.json();
// }

// // Fetch all coupons
// export async function getCoupons() {
//   const res = await fetch(`${WP_BASE_URL}/coupon?acf_format=standard`);
//   return res.json();
// }

// // Fetch all product categories
// export async function getCategories() {
//   const res = await fetch(`${WP_BASE_URL}/product_category`);
//   return res.json();
// }

// // Fetch single product by ID
// export async function getProduct(id: number) {
//   const res = await fetch(`${WP_BASE_URL}/product/${id}?acf_format=standard`);
//   return res.json();
// }