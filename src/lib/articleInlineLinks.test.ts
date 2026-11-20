import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isSafeInternalPath, parseArticleInlineLinks } from './articleInlineLinks.ts';

describe('parseArticleInlineLinks', () => {
  it('keeps plain text, spaces, and line breaks as one text part', () => {
    const body = 'первая строка\n\n  вторая\n';
    assert.deepEqual(parseArticleInlineLinks(body), [{ type: 'text', value: body }]);
  });

  it('turns a single internal markdown link into a link part', () => {
    assert.deepEqual(parseArticleInlineLinks('Смотрите [клуб](/club) дальше.'), [
      { type: 'text', value: 'Смотрите ' },
      { type: 'link', text: 'клуб', href: '/club' },
      { type: 'text', value: ' дальше.' },
    ]);
  });

  it('preserves whitespace around several links', () => {
    const body = '  a\n\n[клуб](/club) и [блог](/blog/post)\n  b  ';
    assert.deepEqual(parseArticleInlineLinks(body), [
      { type: 'text', value: '  a\n\n' },
      { type: 'link', text: 'клуб', href: '/club' },
      { type: 'text', value: ' и ' },
      { type: 'link', text: 'блог', href: '/blog/post' },
      { type: 'text', value: '\n  b  ' },
    ]);
  });

  it('keeps the label exactly, including surrounding spaces', () => {
    assert.deepEqual(parseArticleInlineLinks('[ Клуб ](/club)'), [
      { type: 'link', text: ' Клуб ', href: '/club' },
    ]);
  });

  it('allows query and hash on an internal path', () => {
    assert.deepEqual(parseArticleInlineLinks('[тарифы](/club/rates?plan=year#year)'), [
      { type: 'link', text: 'тарифы', href: '/club/rates?plan=year#year' },
    ]);
  });

  it('leaves unsafe markdown as plain text without dropping characters', () => {
    const samples = [
      '[сайт](https://example.com)',
      '[сайт](http://example.com)',
      '[сайт](//evil.com)',
      '[сайт](javascript:alert(1))',
      '[сайт](JAVASCRIPT:alert(1))',
      '[сайт](data:text/html,hi)',
      '[сайт](/\\evil.com)',
      '[сайт](/%2F%2Fevil.com)',
      '[сайт](/%2f%2fevil.com)',
      '[сайт](/blog%3Aalert)',
      '[сайт](/javascript:alert(1))',
      '[сайт](/path with space)',
      '[](/club)',
      '[клуб](/club',
      'до\n[клу\nб](/club)\nпосле',
      '<script>alert(1)</script>',
    ];

    for (const body of samples) {
      assert.deepEqual(parseArticleInlineLinks(body), [{ type: 'text', value: body }]);
    }
  });

  it('still links a later safe path when an earlier one is rejected', () => {
    assert.deepEqual(parseArticleInlineLinks('нет [внешняя](https://example.com), да [клуб](/club).'), [
      { type: 'text', value: 'нет [внешняя](https://example.com), да ' },
      { type: 'link', text: 'клуб', href: '/club' },
      { type: 'text', value: '.' },
    ]);
  });
});

describe('isSafeInternalPath', () => {
  it('accepts internal paths and rejects schemes, protocol-relative, and encoded bypasses', () => {
    assert.equal(isSafeInternalPath('/'), true);
    assert.equal(isSafeInternalPath('/club'), true);
    assert.equal(isSafeInternalPath('/account/knowledge/slug'), true);
    assert.equal(isSafeInternalPath('/блог'), true);

    assert.equal(isSafeInternalPath('//evil.com'), false);
    assert.equal(isSafeInternalPath('javascript:alert(1)'), false);
    assert.equal(isSafeInternalPath('https://example.com'), false);
    assert.equal(isSafeInternalPath('/foo//bar'), false);
    assert.equal(isSafeInternalPath('/%2F%2Fevil.com'), false);
    assert.equal(isSafeInternalPath('/%5Cevil.com'), false);
    assert.equal(isSafeInternalPath('/%00club'), false);
    assert.equal(isSafeInternalPath('/%'), false);
  });
});
