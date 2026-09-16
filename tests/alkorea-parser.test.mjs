import test from 'node:test';
import assert from 'node:assert/strict';
import { parseALCatalogue, parseALDetail, normalizeALName, resolveALImage } from '../src/lib/alkorea-parser.mjs';
import { ALKoreaClient } from '../scripts/lib/alkorea-client.mjs';

const now = Date.parse('2026-12-31T08:00:00Z');
const card = (id, category = 'Transfer') => `<div class="list_card"><a href="?type=view&amp;id=${id}">
  <img class="list_img" src="../../upload/data/${id}_1_123.jpg">
  <p class="idx">260915-${id}</p><p class="name">팰리세이드(PALISADE)</p>
  <li class="list_info"><span>First Reg :</span>2019.12.24</li>
  <li class="list_info"><span>Fuel :</span>경유</li><li class="list_info"><span>Gear :</span>Auto</li>
  <li class="boxes"><div class="box">${category}</div><div class="box">Partial Loss</div><div class="box deadline">01.01 09:00</div></li>
  </a></div>`;
const catalogue = `<header>PRIVATE ACCOUNT NAME</header><select id="auction_date"><option value="2027-01-01"></option></select>
  <div class="content_box">${card('84202')}${card('84203', 'Scrap')}</div><div class="pagination"><a href="?page=21">»</a></div>`;
const row = (label, value) => `<div class="detail_col"><p class="detail_category">${label}</p><p class="detail_text">${value}</p></div>`;
const detail = `<h2 class="car_name">팰리세이드(PALISADE)</h2><div id="car_img_list">
  <img src="../../upload/data/84202_1_123.jpg"><img src="../../upload/data/84202_10_123.jpg">
  <img src="../../upload/data/84202_2_123.jpg"><img src="../../upload/data/84202_1_123.jpg"><img src="https://evil.example/private.jpg"></div>
  <section class="car_detail_info">${row('Vehicle Model', '팰리세이드(PALISADE)')}${row('Year of Manufacture', '2020')}
  ${row('Engine Displacement', '2,199')}${row('Instrument Cluster', '160,000')}${row('Registered mileage', '138,515KM')}
  ${row('Fuel Type', '경유')}${row('Gear Type', 'Automatic')}${row('Storage Fee', '500,000won')}
  ${row('Pre-Tax Delivery Price', '0')}${row('Vehicle Identification Number', 'KMHR281ABLU')}${row('Damage Condition', 'Front, Left')}</section>
  <div class="detail_damage"><p>전면좌측파손</p><p>후면좌측파손</p><p>에어백 전개</p><p>주행거리 확인 불가 임의입력</p>
  <p>★ STANDARD CONTRACT TEXT MUST NOT BE IMPORTED</p></div><input value="0"><button>Bid</button>`;

test('reads every-page pagination and distinct transfer/scrap lots without importing header/profile data', () => {
  const data = parseALCatalogue(catalogue, now);
  assert.equal(data.pageCount, 21);
  assert.deepEqual(data.cars.map(car => car.id), ['84202', '84203']);
  assert.deepEqual(data.cars.map(car => car.category), ['transfer', 'scrap']);
  assert.equal(data.cars[0].title, 'Hyundai Palisade');
  assert.equal(data.cars[0].fuel, 'diesel');
  assert.equal(data.cars[0].transmission, 'automatic');
  assert.equal(data.cars[0].registrationDate, '2019-12-24');
  assert.equal(data.cars[0].closesAt, '2027-01-01T09:00:00+09:00');
  assert.doesNotMatch(JSON.stringify(data), /PRIVATE|Cookie|password|Bid/);
});

test('captures all photos in numeric order, unverified mileage and factual damages, without a fake auction price', () => {
  const car = parseALDetail(detail, parseALCatalogue(catalogue, now).cars[0], now);
  assert.equal(car.images.length, 3);
  assert.match(car.images[1], /_2_/);
  assert.match(car.images[2], /_10_/);
  assert.equal(car.year, 2019);
  assert.equal(car.manufacturedYear, 2020);
  assert.equal(car.displacement, 2199);
  assert.equal(car.mileage, null);
  assert.equal(car.mileageUnverified, true);
  assert.equal(car.registeredMileage, 138515);
  assert.equal(car.vin, null);
  assert.deepEqual(car.damageAreas, ['front', 'rear', 'left']);
  assert.equal(car.airbagsDeployed, true);
  assert.equal(car.storageFeeKrw, 500000);
  assert.equal(car.priceKrw, null);
  assert.doesNotMatch(JSON.stringify(car), /STANDARD CONTRACT|evil\.example/);
});

test('missing facts remain unknown, never clean/zero horsepower/invented price', () => {
  const summary = parseALCatalogue(catalogue, now).cars[0];
  const car = parseALDetail(`<h2 class="car_name">K3</h2><div class="car_detail_info">${row('Vehicle Model', 'K3')}</div>`, summary, now);
  assert.equal(car.airbagsDeployed, null);
  assert.equal(car.displacement, null);
  assert.equal(car.mileage, null);
  assert.equal(car.priceKrw, null);
  assert.equal(car.storageFeeKrw, null);
  assert.deepEqual(car.damageAreas, []);
  assert.equal(car.images.length, 1);
  const placeholder = parseALDetail(`<h2 class="car_name">K3</h2><div class="car_detail_info">${row('Instrument Cluster', '0')}</div>`, summary, now);
  assert.equal(placeholder.mileage, null);
});

test('expired login and changed layouts cannot overwrite the catalogue with an empty success', () => {
  assert.throws(() => parseALCatalogue('<form name="loginForm"></form>'), /session expired/);
  assert.throws(() => parseALCatalogue('<html>Service error</html>'), /layout changed/);
  assert.throws(() => parseALDetail('<form name="loginForm"></form>', {}), /unavailable/);
});

test('photo URLs are constrained to public image paths: no remote hosts, private endpoints or credential queries', () => {
  assert.equal(resolveALImage('../../upload/data/84202_1_123.jpg'), 'https://alkorea.kr/upload/data/84202_1_123.jpg');
  for (const source of ['https://evil.example/car.jpg', '/page/member_info.php', '/upload/data/a.jpg?token=secret',
    'http://alkorea.kr/upload/data/a.jpg', 'https://x:y@alkorea.kr/upload/data/a.jpg', '/upload/data/../private.jpg', 'javascript:alert(1)']) {
    assert.equal(resolveALImage(source), null, source);
  }
});

test('common Korean and imported vehicle names are readable without Korean fragments', () => {
  const examples = { '오피러스': 'Kia Opirus', '벨로스터(VELOSTER)': 'Hyundai Veloster', '토러스(법인)': 'Ford Taurus',
    'A8L 60 TDI quattro': 'Audi A8L 60 TDI quattro', 'GLA220': 'Mercedes-Benz GLA220',
    '카니발': 'Kia Carnival', 'SM7': 'Renault Samsung SM7', 'Peugeot 308SW 1.6 BlueHDi': 'Peugeot 308SW 1.6 BlueHDi',
    '911 카레라 4S 카브리올레': 'Porsche 911 Carrera 4S Cabriolet' };
  for (const [raw, expected] of Object.entries(examples)) assert.equal(normalizeALName(raw).title, expected);
});

test('import client validates IDs/pages before requests and has no bidding/account methods', async () => {
  const client = new ALKoreaClient('test', 'test');
  await assert.rejects(client.detail('../member_info.php'), /Invalid/);
  await assert.rejects(client.catalogue(501), /Invalid/);
  assert.deepEqual(Object.getOwnPropertyNames(ALKoreaClient.prototype).sort(), ['catalogue', 'constructor', 'detail', 'login']);
});
