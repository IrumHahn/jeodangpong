const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('#site-menu');

if (menuButton && menu) {
  menuButton.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      menu.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
    }
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

const observeReveal = (root = document) => {
  root.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
};

observeReveal();

document.querySelector('.to-top')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const formatPrice = (price) => `${new Intl.NumberFormat('ko-KR').format(price)}원`;

const createProductCard = (product, index) => {
  const card = document.createElement('article');
  const colorClass = ['product-orange', 'product-yellow', 'product-mint'][index % 3];
  card.className = `product-card ${colorClass} reveal`;

  const imageLink = document.createElement('a');
  imageLink.className = 'product-image-link';
  imageLink.href = product.url;
  imageLink.target = '_blank';
  imageLink.rel = 'noopener noreferrer';
  imageLink.setAttribute('aria-label', `${product.name} 구매 페이지 열기`);

  const image = document.createElement('img');
  image.className = 'product-image';
  image.src = product.image;
  image.alt = product.name;
  image.loading = 'lazy';
  image.referrerPolicy = 'no-referrer';
  image.addEventListener('error', () => {
    imageLink.classList.add('image-unavailable');
    image.remove();
    imageLink.setAttribute('data-message', '제품 이미지를 불러오지 못했어요');
  });
  imageLink.append(image);

  const info = document.createElement('div');
  info.className = 'product-info';

  const text = document.createElement('div');
  const label = document.createElement('p');
  label.textContent = '풍심당 저당 간식';
  const name = document.createElement('h3');
  name.textContent = product.name;
  const price = document.createElement('strong');
  price.className = 'product-price';
  price.textContent = formatPrice(product.price);
  text.append(label, name, price);

  const buyButton = document.createElement('a');
  buyButton.className = 'buy-button';
  buyButton.href = product.url;
  buyButton.target = '_blank';
  buyButton.rel = 'noopener noreferrer';
  buyButton.innerHTML = '구매하기 <span aria-hidden="true">↗</span>';
  buyButton.setAttribute('aria-label', `${product.name} 구매하기 (새 탭)`);

  info.append(text, buyButton);
  card.append(imageLink, info);
  return card;
};

const renderProducts = async () => {
  const grids = [...document.querySelectorAll('[data-products-grid]')];
  if (!grids.length) return;

  try {
    const response = await fetch('products.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const products = await response.json();
    if (!Array.isArray(products)) throw new Error('products.json은 배열이어야 합니다.');

    const featuredProduct = document.querySelector('[data-featured-product]');
    if (featuredProduct && products[0]) {
      const featuredImage = featuredProduct.querySelector('[data-featured-image]');
      const featuredName = featuredProduct.querySelector('[data-featured-name]');
      featuredProduct.href = products[0].url;
      featuredProduct.target = '_blank';
      featuredProduct.rel = 'noopener noreferrer';
      featuredProduct.setAttribute('aria-label', `${products[0].name} 구매 페이지 열기`);
      featuredImage.src = products[0].image;
      featuredImage.alt = products[0].name;
      featuredImage.referrerPolicy = 'no-referrer';
      featuredImage.hidden = false;
      featuredName.textContent = products[0].name;
    }

    grids.forEach((grid) => {
      const limit = Number.parseInt(grid.dataset.limit, 10);
      const visibleProducts = Number.isNaN(limit) ? products : products.slice(0, limit);
      grid.replaceChildren();

      if (!visibleProducts.length) {
        const empty = document.createElement('p');
        empty.className = 'product-status';
        empty.textContent = '등록된 제품이 아직 없어요.';
        grid.append(empty);
        return;
      }

      visibleProducts.forEach((product, index) => grid.append(createProductCard(product, index)));
      observeReveal(grid);
    });
  } catch (error) {
    console.error('제품 데이터를 불러오지 못했습니다.', error);
    grids.forEach((grid) => {
      const status = grid.querySelector('.product-status') || document.createElement('p');
      status.className = 'product-status product-error';
      status.textContent = location.protocol === 'file:'
        ? '제품 목록은 로컬 서버에서 확인할 수 있어요. README의 실행 방법을 따라주세요.'
        : '제품을 불러오지 못했어요. 잠시 후 다시 확인해주세요.';
      grid.replaceChildren(status);
    });
  }
};

renderProducts();
