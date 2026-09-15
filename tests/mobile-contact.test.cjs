const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Module, createRequire } = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function loadTs(relative, overrides = {}) {
  const file = path.resolve(__dirname, '..', relative);
  const loaded = new Module(file);
  const originalRequire = createRequire(file);
  loaded.require = name => Object.hasOwn(overrides, name) ? overrides[name] : originalRequire(name);
  loaded._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, file);
  return loaded.exports;
}

const { getTranslation } = loadTs('src/lib/i18n.ts');

function renderFloating(pathname = '/', lang = 'ru', open = false) {
  const { default: Contact } = loadTs('src/components/shared/FloatingContact.tsx', {
    'next/navigation': { usePathname: () => pathname },
    '@/contexts/AppContext': { useApp: () => ({ t: key => getTranslation(key, lang) }) },
    react: { ...React, useState: () => [open, () => {}] },
  });
  return renderToStaticMarkup(React.createElement(Contact));
}

test('mobile floating contact stays above the bottom navigation and device safe area', () => {
  const html = renderFloating();
  assert.ok(html.includes('data-testid="floating-contact"'));
  assert.ok(html.includes('bottom-[calc(4.5rem+env(safe-area-inset-bottom))]'));
  assert.ok(html.includes('right-4 z-40 flex'));
  assert.ok(!/class="[^"]*\bhidden\b/.test(html));
  assert.ok(html.includes('h-12 w-12'));
  assert.ok(html.includes('lg:bottom-6 lg:right-6'));
  assert.ok(html.includes('lg:h-14 lg:w-14'));
});

test('contact options start collapsed without taking up additional space', () => {
  const html = renderFloating();
  assert.ok(html.includes('aria-expanded="false"'));
  assert.ok(!html.includes('https://wa.me/'));
  assert.ok(!html.includes('https://t.me/'));
});

test('expanded floating action shows the existing safe WhatsApp and Telegram links', () => {
  const html = renderFloating('/', 'ru', true);
  assert.ok(html.includes('aria-expanded="true"'));
  assert.ok(html.includes('aria-controls="floating-contact-options"'));
  assert.ok(html.includes('id="floating-contact-options"'));
  assert.ok(html.includes('href="https://wa.me/821099221601"'));
  assert.ok(html.includes('href="https://t.me/ghayrat_korea"'));
  assert.equal((html.match(/rel="noopener noreferrer"/g) || []).length, 2);
});

test('floating contact is available on list and information pages but not admin or car details', () => {
  for (const route of ['/', '/catalog', '/auction', '/favorites', '/about', '/contacts', '/how-to-buy']) {
    assert.ok(renderFloating(route).includes('data-testid="floating-contact"'), route);
  }
  for (const route of ['/admin', '/admin/cars', '/catalog/42741172', '/auction/1001']) {
    assert.equal(renderFloating(route), '', route);
  }
});

test('mobile contact control uses accessible labels in each selected language', () => {
  for (const lang of ['ru', 'en', 'tj', 'uz']) {
    assert.ok(renderFloating('/', lang).includes(`aria-label="${getTranslation('nav.writeManager', lang)}"`));
    assert.ok(renderFloating('/', lang, true).includes(`aria-label="${getTranslation('nav.closeMenu', lang)}"`));
  }
});

test('bottom navigation keeps its four main actions without a duplicate contact tab', () => {
  const { default: Nav } = loadTs('src/components/layout/BottomNav.tsx', {
    'next/navigation': { usePathname: () => '/' },
    'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
    './MobileMenu': { __esModule: true, default: () => null },
    '@/contexts/AppContext': { useApp: () => ({ t: key => getTranslation(key, 'ru') }) },
  });
  const html = renderToStaticMarkup(React.createElement(Nav));
  for (const href of ['/', '/auction', '/favorites']) assert.ok(html.includes(`href="${href}"`));
  assert.ok(html.includes('Меню'));
  assert.equal((html.match(/<a /g) || []).length, 3);
  assert.ok(!html.includes('WhatsApp'));
  assert.ok(!html.includes('wa.me'));
  assert.ok(html.includes('pb-[env(safe-area-inset-bottom)]'));
});
