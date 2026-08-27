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
  window.scrollTo({ top: 0, behavior: 'auto' });
});

const formatPrice = (price) => `${new Intl.NumberFormat('ko-KR').format(price)}원`;

const updateProductSchema = (products) => {
  const schemaElement = document.querySelector('#product-schema');
  if (!schemaElement) return;

  const productItems = products.map((product, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Product',
      name: String(product.name || ''),
      image: String(product.image || ''),
      url: String(product.url || ''),
      category: '저당과자',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'KRW',
        price: Number(product.price),
        url: String(product.url || '')
      }
    }
  }));

  schemaElement.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '저당퐁 제품',
    url: 'https://irumhahn.github.io/jeodangpong/products.html',
    numberOfItems: productItems.length,
    itemListElement: productItems
  });
};

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

const createCuratedFeaturedProduct = (product) => {
  const article = document.createElement('article');
  article.className = 'curated-featured-product reveal';

  const imageLink = document.createElement('a');
  imageLink.className = 'curated-featured-image';
  imageLink.href = product.url;
  imageLink.target = '_blank';
  imageLink.rel = 'noopener noreferrer';
  imageLink.setAttribute('aria-label', `${product.name} 구매 페이지 열기`);

  const image = document.createElement('img');
  image.src = product.image;
  image.alt = product.name;
  image.referrerPolicy = 'no-referrer';
  image.addEventListener('error', () => {
    imageLink.classList.add('image-unavailable');
    image.remove();
    imageLink.setAttribute('data-message', '제품 이미지를 불러오지 못했어요');
  });
  imageLink.append(image);

  const copy = document.createElement('div');
  copy.className = 'curated-featured-copy';

  const kicker = document.createElement('p');
  kicker.className = 'curated-kicker';
  kicker.textContent = "CURATOR'S PICK";

  const name = document.createElement('h2');
  name.textContent = String(product.name)
    .replace(/^풍심당\s*/, '')
    .replace(/\s*\([^)]*\).*$/, '')
    .trim();

  const situation = document.createElement('p');
  situation.className = 'curated-situation';
  situation.textContent = '출출한 오후, 가볍고 바삭한 한 봉지가 필요할 때.';

  const price = document.createElement('strong');
  price.className = 'curated-price';
  price.textContent = formatPrice(product.price);

  const buyButton = document.createElement('a');
  buyButton.className = 'button curated-buy-button';
  buyButton.href = product.url;
  buyButton.target = '_blank';
  buyButton.rel = 'noopener noreferrer';
  buyButton.innerHTML = '대표 제품 구매하기 <span aria-hidden="true">↗</span>';
  buyButton.setAttribute('aria-label', `${product.name} 구매하기 (새 탭)`);

  copy.append(kicker, name, situation, price, buyButton);
  article.append(imageLink, copy);
  return article;
};

const renderProducts = async () => {
  const grids = [...document.querySelectorAll('[data-products-grid]')];
  if (!grids.length) return;

  try {
    const response = await fetch('products.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const products = await response.json();
    if (!Array.isArray(products)) throw new Error('products.json은 배열이어야 합니다.');
    updateProductSchema(products);

    const curatedFeatured = document.querySelector('[data-curated-featured]');
    if (curatedFeatured) {
      curatedFeatured.replaceChildren();
      if (products[0]) {
        curatedFeatured.append(createCuratedFeaturedProduct(products[0]));
        observeReveal(curatedFeatured);
      } else {
        const empty = document.createElement('p');
        empty.className = 'product-status';
        empty.textContent = '등록된 제품이 아직 없어요.';
        curatedFeatured.append(empty);
      }
    }

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
      const parsedOffset = Number.parseInt(grid.dataset.offset, 10);
      const offset = Number.isNaN(parsedOffset) ? 0 : parsedOffset;
      const visibleProducts = Number.isNaN(limit)
        ? products.slice(offset)
        : products.slice(offset, offset + limit);
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
    const curatedFeatured = document.querySelector('[data-curated-featured]');
    if (curatedFeatured) {
      const status = document.createElement('p');
      status.className = 'product-status product-error';
      status.textContent = location.protocol === 'file:'
        ? '제품 목록은 로컬 서버에서 확인할 수 있어요. README의 실행 방법을 따라주세요.'
        : '대표 제품을 불러오지 못했어요. 잠시 후 다시 확인해주세요.';
      curatedFeatured.replaceChildren(status);
    }
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

const formatStoryDate = (dateString) => {
  const [year, month, day] = String(dateString || '').split('-');
  return year && month && day ? `${year}. ${month}. ${day}` : String(dateString || '');
};

const createStoryVisual = (index) => {
  const visual = document.createElement('div');
  visual.className = `story-image story-${['one', 'two', 'three'][index % 3]}`;

  if (index % 3 === 0) {
    const question = document.createElement('span');
    question.textContent = '?';
    const label = document.createElement('b');
    label.innerHTML = 'LOW<br>SUGAR';
    visual.append(question, label);
  } else if (index % 3 === 1) {
    const label = document.createElement('span');
    label.innerHTML = 'GOOD<br>CHOICE!';
    const check = document.createElement('i');
    check.textContent = '✓';
    visual.append(label, check);
  } else {
    const bubble = document.createElement('div');
    bubble.className = 'logo-bubble';
    bubble.innerHTML = '저당<br><b>퐁!</b>';
    visual.append(bubble);
  }

  return visual;
};

const createStoryCard = (post, index) => {
  const card = document.createElement('article');
  card.className = 'story-card reveal';

  const link = document.createElement('a');
  link.href = `story/post.html?id=${encodeURIComponent(post.id || '')}`;
  link.setAttribute('aria-label', `${post.title || '이야기'} 읽기`);

  const time = document.createElement('time');
  time.dateTime = String(post.date || '');
  time.textContent = formatStoryDate(post.date);

  const title = document.createElement('h3');
  title.textContent = String(post.title || '(제목 없음)');

  const summary = document.createElement('p');
  summary.textContent = String(post.summary || '저당퐁의 새로운 이야기를 만나보세요.');

  link.append(createStoryVisual(index), time, title, summary);
  card.append(link);
  return card;
};

const renderStories = async () => {
  const grid = document.querySelector('[data-story-grid]');
  if (!grid) return;

  try {
    const response = await fetch('story/posts.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const posts = await response.json();
    if (!Array.isArray(posts)) throw new Error('posts.json은 배열이어야 합니다.');

    const latestPosts = posts
      .slice()
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
      .slice(0, 3);

    grid.replaceChildren();
    if (!latestPosts.length) {
      const empty = document.createElement('p');
      empty.className = 'story-status';
      empty.textContent = '등록된 이야기가 아직 없어요.';
      grid.append(empty);
      return;
    }

    latestPosts.forEach((post, index) => grid.append(createStoryCard(post, index)));
    observeReveal(grid);
  } catch (error) {
    console.error('블로그 글을 불러오지 못했습니다.', error);
    const status = document.createElement('p');
    status.className = 'story-status';
    status.textContent = location.protocol === 'file:'
      ? '블로그 글은 로컬 서버에서 확인할 수 있어요. README의 실행 방법을 따라주세요.'
      : '이야기를 불러오지 못했어요. 잠시 후 다시 확인해주세요.';
    grid.replaceChildren(status);
  }
};

renderStories();
