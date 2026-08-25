# 저당과자 저당퐁

팝한 톤의 미니멀한 저당과자 브랜드 홈페이지입니다.

## 로컬에서 보기

빌드 과정은 없지만, `products.json`을 불러오기 위해 로컬 서버로 실행해야 합니다.

```bash
python3 -m http.server 4173
```

그다음 `http://localhost:4173`으로 접속합니다.

## 파일 구성

- `index.html` — 페이지 콘텐츠와 구조
- `products.html` — 전체 제품 목록 페이지
- `products.json` — 홈과 제품 페이지에서 함께 사용하는 제품 데이터
- `styles.css` — 반응형 스타일과 애니메이션
- `script.js` — 제품 데이터 표시, 모바일 메뉴, 스크롤 등장 효과, 맨 위로 이동

## 제품 추가하기

`products.json` 배열에 아래 형식의 항목만 추가하면 홈에는 앞에서부터 최대 3개, 제품 페이지에는 전체 제품이 자동으로 표시됩니다.

```json
{
  "name": "제품명",
  "price": 4200,
  "image": "https://example.com/product.jpg",
  "url": "https://smartstore.naver.com/store/products/123"
}
```

가격은 숫자로 입력하면 화면에서 자동으로 원화 형식으로 표시됩니다. 이메일, SNS 링크와 블로그 글은 자연스러운 임시 내용으로 작성되어 있습니다.
