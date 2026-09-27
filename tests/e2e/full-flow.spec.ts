import { expect, test, type Page } from '@playwright/test';

const path = '/RIPPLE-BD-CHAOS-PEACE/';

async function assertNoHorizontalOverflow(page: Page) {
  await expect.poll(async () => page.evaluate(() =>
    document.documentElement.scrollWidth <= window.innerWidth + 1
  )).toBe(true);
}

async function clickPrimary(page: Page) {
  const button = page.locator('main button.primary:visible').last();
  await expect(button).toBeEnabled();
  await button.click();
}

async function chooseFirst(page: Page, selector: string) {
  const choice = page.locator(selector).first();
  await expect(choice).toBeVisible();
  await choice.click();
}

async function completeScenario(page: Page, index: number, locale: 'en' | 'bn') {
  // Intro -> MIRROR
  await expect(page.locator('main.intro-page')).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await clickPrimary(page);

  // MIRROR -> RIPPLE with deliberately risky first choice.
  await expect(page.locator('.realistic-feed')).toBeVisible();
  await expect(page.locator('.social-attachment')).toBeVisible();
  await expect(page.locator('.mirror-choice').first()).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await chooseFirst(page, '.mirror-choice');

  // Human consequence must be explicit.
  const human = page.locator('.impact-story');
  await expect(human).toBeVisible();
  await expect(human.locator('.impact-kicker')).toBeVisible();
  if (locale === 'en') {
    await expect(human).toContainText('Your first action made the situation harder for someone else.');
    await expect(human).toContainText('Fictional composite');
  } else {
    await expect(human).toContainText('আপনার প্রথম কাজটি অন্য একজনের পরিস্থিতি আরও কঠিন করেছে।');
    await expect(human).toContainText('কাল্পনিক');
  }
  await assertNoHorizontalOverflow(page);
  await clickPrimary(page);

  // REFLECT -> REWIND
  await expect(page.locator('blockquote')).toBeVisible();
  await clickPrimary(page);
  const rewind = page.locator('.panel.rewind');
  await expect(rewind).toBeVisible();
  if (locale === 'en') {
    await expect(rewind).toContainText('ONE CLICK. TWO POSSIBLE FUTURES.');
  } else {
    await expect(rewind).toContainText('একটি ক্লিক। দুটি সম্ভাব্য ভবিষ্যৎ।');
  }
  await assertNoHorizontalOverflow(page);
  await clickPrimary(page);

  // PEACE -> X-RAY
  await expect(page.locator('.peace-choice').first()).toBeVisible();
  await chooseFirst(page, '.peace-choice');
  await expect(page.locator('.xray button').first()).toBeVisible();
  await chooseFirst(page, '.xray button');
  await expect(page.locator('.stick button.primary')).toBeEnabled();
  await page.locator('.stick button.primary').click();

  // Scenario 2 has SHIELD; generated scenarios may as well.
  if (await page.locator('.shieldsteps').isVisible().catch(() => false)) {
    for (let step = 0; step < 5; step++) {
      await expect(page.locator('.actions button.primary')).toBeEnabled();
      await page.locator('.actions button.primary').click();
    }
  }

  // COMPLETE -> next scenario / results
  await expect(page.locator('.success')).toBeVisible();
  await expect(page.locator('.human-compare')).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await clickPrimary(page);

  if (index < 2) {
    await expect(page.locator('main.intro-page')).toBeVisible();
  }
}

async function runFullJourney(page: Page, locale: 'en' | 'bn') {
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto(path);
  await expect(page).toHaveTitle(/RIPPLE BD/);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('body')).not.toContainText('Nodi');
  await expect(page.locator('body')).not.toContainText('নদী');
  await expect(page.locator('.trust')).toContainText('3');
  await assertNoHorizontalOverflow(page);

  if (locale === 'bn') {
    await page.locator('.language-switch button').filter({ hasText: 'বাংলা' }).first().click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
    await expect(page.locator('h1')).toContainText('একটি ক্লিক');
  } else {
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  }

  // Landing -> Guide -> Notice -> Scenario 1
  await page.locator('.copy button.primary').click();
  await expect(page.locator('.guide-panel')).toBeVisible();
  await assertNoHorizontalOverflow(page);
  await page.locator('.guide-footer button.primary').click();

  await expect(page.locator('.notice')).toBeVisible();
  const consent = page.locator('.consent-card input');
  await expect(consent).not.toBeChecked();
  await page.locator('.notice button.primary').click();

  const firstSessionIds = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('ripple-session-scenarios-v2') || '[]')
  );
  expect(firstSessionIds).toHaveLength(3);
  expect(new Set(firstSessionIds).size).toBe(3);

  for (let i = 0; i < 3; i++) {
    await completeScenario(page, i, locale);
  }

  // Results page: exactly 3 completed scenarios and no fake pilot claim.
  await expect(page.locator('main.results')).toBeVisible();
  await expect(page.locator('.resultcards > div')).toHaveCount(3);
  await expect(page.locator('.orb strong')).not.toHaveText('0');
  if (locale === 'en') {
    await expect(page.locator('.result-note')).toContainText('not a psychological diagnosis');
  } else {
    await expect(page.locator('.result-note')).toContainText('মনস্তাত্ত্বিক মূল্যায়ন');
  }
  await assertNoHorizontalOverflow(page);

  // Analytics consent stayed off: no event queue should be created.
  const consentState = await page.evaluate(() => localStorage.getItem('ripple-analytics-consent'));
  expect(consentState).toBe('no');
  const queued = await page.evaluate(() => localStorage.getItem('ripple-analytics-events'));
  expect(queued).toBeNull();

  expect(errors, 'Browser console/page errors').toEqual([]);
  return firstSessionIds;
}

test.describe('RIPPLE BD production journey', () => {
  test('English: complete all 3 scenarios, REWIND, X-Ray, SHIELD and results', async ({ page }) => {
    await runFullJourney(page, 'en');
  });

  test('Bangla: complete all 3 scenarios with responsive layout', async ({ page }) => {
    await runFullJourney(page, 'bn');
  });

  test('replay rotates to another complete 3-scenario set', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Rotation is browser-state logic; one desktop run is enough.');
    const first = await runFullJourney(page, 'en');
    await page.locator('main.results footer button.secondary').click();
    await expect(page.locator('.guide-panel')).toBeVisible();
    const second = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('ripple-session-scenarios-v2') || '[]')
    );
    expect(second).toHaveLength(3);
    expect(new Set(second).size).toBe(3);
    expect(second).not.toEqual(first);
  });
});
