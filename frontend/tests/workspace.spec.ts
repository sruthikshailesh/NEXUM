import { expect, test, type Page } from '@playwright/test'

async function navigate(page: Page, label: string) {
  await page.locator('.sidebar').getByRole('link', { name: label, exact: true }).click()
}
async function assertNoOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
}
// The workspace now starts empty (real backend) and demo data is explicit.
async function loadDemo(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Load demo data' }).first().click()
  await expect(page.getByRole('heading', { name: 'Welcome back, Alex' })).toBeVisible()
}

test('dashboard, all navigation, and collapsed sidebar work', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await loadDemo(page)
  await expect(page.locator('.stat-card')).toHaveCount(4)
  await expect(page.locator('.project-card')).toHaveCount(3)
  for (const [nav, heading] of [
    ['Projects', 'Projects'],
    ['Knowledge Base', 'Knowledge Base'],
    ['Decisions', 'Decisions'],
    ['Evidence & Conflicts', 'Evidence & Conflicts'],
    ['Handover Reports', 'Handover Reports'],
    ['Settings', 'Settings'],
    ['Help & Documentation', 'Help & getting started'],
  ]) {
    await navigate(page, nav)
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
    await expect(
      page.locator('.sidebar').getByRole('link', { name: nav, exact: true }),
    ).toHaveAttribute('aria-current', 'page')
    await assertNoOverflow(page)
  }
  await navigate(page, 'Overview')
  await page.getByRole('button', { name: 'Collapse sidebar' }).click()
  await expect(page.locator('.sidebar')).toHaveClass(/collapsed/)
  await navigate(page, 'Projects')
  await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Expand sidebar' }).click()
  await expect(page.locator('.sidebar')).not.toHaveClass(/collapsed/)
  expect(errors).toEqual([])
})

test('project creation validates duplicates and supports a new empty workspace', async ({
  page,
}) => {
  await loadDemo(page)
  await page.getByRole('button', { name: 'New Project', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Project name').fill('ShopSphere')
  await dialog.getByLabel('Description').fill('A test project')
  await dialog.getByRole('button', { name: 'Create project', exact: true }).click()
  await expect(dialog.getByRole('alert')).toContainText('already exists')
  await dialog.getByLabel('Project name').fill('Orbit Console')
  await dialog.getByLabel('Description').fill('An internal console for developer environments.')
  await dialog.getByLabel('Technology stack').fill('React, FastAPI, React')
  await dialog.getByRole('button', { name: 'Create project', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Orbit Console', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'A clean slate' })).toBeVisible()
  await expect(page.locator('.workspace-stats .workspace-stat').first()).toContainText('0')
  await page
    .getByRole('navigation', { name: 'Project navigation' })
    .getByRole('link', { name: 'Context', exact: true })
    .click()
  await expect(page.getByText('No information has been invented', { exact: false })).toBeVisible()
  await page
    .getByRole('navigation', { name: 'Project navigation' })
    .getByRole('link', { name: 'Handover', exact: true })
    .click()
  await page.getByRole('button', { name: 'Create sample', exact: true }).click()
  await page.getByRole('button', { name: 'Create sample report', exact: true }).last().click()
  await expect(page.getByRole('dialog')).toContainText(
    'No sources, decisions, or conflicts have been supplied',
  )
  await expect(page.locator('.report-section')).toHaveCount(9)
  await page.getByRole('button', { name: 'Close dialog' }).click()
  await navigate(page, 'Projects')
  await page.getByRole('textbox', { name: 'Search projects or technologies...' }).fill('Orbit')
  await expect(page.locator('.project-card')).toHaveCount(1)
  await page.getByRole('button', { name: 'List view', exact: true }).click()
  await expect(page.locator('.project-list-card')).toHaveCount(1)
})

test('source uploads remain local, support previews, reject unsupported files, and filter', async ({
  page,
}) => {
  await loadDemo(page)
  await page.goto('/knowledge')
  await page.getByRole('button', { name: 'Add sources', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog
    .locator('input[type=file]')
    .setInputFiles({
      name: 'bad.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('not allowed'),
    })
  await expect(dialog.getByRole('alert')).toContainText('Some files were not added')
  await dialog
    .locator('input[type=file]')
    .setInputFiles({
      name: 'handover-notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Keep the retry flag disabled until the replay review is complete.'),
    })
  await dialog.getByRole('button', { name: 'Add 1 source', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await page.getByRole('textbox', { name: 'Search sources...' }).fill('handover-notes')
  await expect(page.locator('.source-table-row')).toHaveCount(1)
  await expect(page.locator('.source-table-row')).toContainText('Local only')
  await page.locator('.source-table-row').click()
  await expect(page.getByRole('dialog')).toContainText('Keep the retry flag disabled')
  await expect(page.getByRole('dialog')).toContainText('not been uploaded to a server')
  await page.getByRole('button', { name: 'Close dialog' }).click()
  await page.getByRole('button', { name: 'Clear search' }).click()
  await page.getByRole('button', { name: 'PDF', exact: true }).click()
  await expect(page.locator('.source-table-row')).toHaveCount(2)
  await page.getByRole('textbox', { name: 'Search sources...' }).fill('no-such-document')
  await expect(page.getByRole('heading', { name: 'No matching sources' })).toBeVisible()
})

test('decision filters, history, and linked evidence work', async ({ page }) => {
  await loadDemo(page)
  await page.goto('/decisions')
  await page.getByRole('button', { name: 'Accepted', exact: true }).click()
  await expect(page.locator('.decision-card')).toHaveCount(2)
  await page.locator('.decision-card').first().click()
  await expect(page.getByRole('dialog')).toContainText('Decision history')
  await expect(page.getByRole('dialog')).toContainText('Rationale')
  await page.getByRole('dialog').locator('.source-link').first().click()
  await expect(page.getByRole('dialog')).toContainText('Document content')
  await expect(page.getByRole('dialog')).toContainText('fictional source')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('button', { name: 'Superseded', exact: true }).click()
  await expect(page.locator('.decision-card')).toHaveCount(1)
})

test('conflicts require a human rationale and update dashboard counts', async ({ page }) => {
  await loadDemo(page)
  await page.goto('/conflicts')
  const conflict = page
    .locator('.conflict-card')
    .filter({ has: page.getByRole('heading', { name: 'Payment Retry Implementation' }) })
  await expect(conflict.locator('.evidence-card')).toHaveCount(2)
  await conflict.getByRole('button', { name: 'More evidence detail' }).click()
  await expect(conflict.locator('.evidence-extra')).toHaveCount(2)
  await conflict.getByRole('button', { name: 'View Source', exact: true }).first().click()
  await expect(page.getByRole('dialog')).toContainText('Meeting notes')
  await page.keyboard.press('Escape')
  await conflict.getByRole('button', { name: 'Mark as Reviewed' }).click()
  await expect(conflict.getByRole('button', { name: 'Reviewed', exact: true })).toBeDisabled()
  await expect(conflict).toContainText('Under Review')
  await conflict.getByRole('button', { name: 'Resolve Conflict' }).click()
  await page.getByRole('textbox', { name: 'Resolution and rationale' }).fill('short')
  await page.getByRole('button', { name: 'Save resolution' }).click()
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText('at least 15')
  await page
    .getByRole('textbox', { name: 'Resolution and rationale' })
    .fill(
      'Retries stay disabled until Samir attaches passing replay evidence. Aisha will approve the release gate.',
    )
  await page.getByRole('button', { name: 'Save resolution' }).click()
  await page.getByRole('button', { name: 'Resolved', exact: true }).click()
  await expect(page.locator('.conflict-card')).toHaveCount(1)
  await expect(page.locator('.resolution-box')).toContainText('Retries stay disabled')
  await navigate(page, 'Overview')
  await expect(page.locator('.stat-amber .stat-value-row')).toContainText('02')
})

test('handover preview, table of contents, review, and export work', async ({ page }) => {
  await loadDemo(page)
  await page.goto('/handovers')
  await page.getByRole('button', { name: 'Generate Handover' }).click()
  await page.getByRole('combobox', { name: 'Handover project' }).selectOption('shopsphere')
  await page.getByRole('button', { name: 'Create sample report', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('Sample report · No AI used')
  await expect(dialog.locator('.report-section')).toHaveCount(9)
  await dialog.getByRole('link', { name: '09 Evidence and References' }).click()
  await expect(dialog.locator('#report-section-8')).toBeInViewport()
  await dialog.getByRole('button', { name: 'Mark reviewed' }).click()
  await expect(dialog.getByRole('button', { name: 'Reviewed', exact: true })).toBeDisabled()
  const downloadPromise = page.waitForEvent('download')
  await dialog.getByRole('button', { name: 'Export .txt' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toContain('sample-handover.txt')
  const stream = await download.createReadStream()
  const parts = []
  for await (const chunk of stream!) parts.push(chunk)
  const text = Buffer.concat(parts).toString()
  expect(text).toContain('SAMPLE REPORT')
  expect(text).toContain('9. Evidence and References')
})

test('workspace tabs, project-scoped records, and local task checklist work', async ({ page }) => {
  await loadDemo(page)
  await page.goto('/projects/shopsphere')
  const tabs = page.getByRole('navigation', { name: 'Project navigation' })
  await page.locator('.task-item').first().click()
  await expect(page.locator('.task-item input').first()).toBeChecked()
  await tabs.getByRole('link', { name: 'Sources', exact: false }).click()
  await expect(page.locator('.source-table-row')).toHaveCount(7)
  await tabs.getByRole('link', { name: 'Context', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'The bigger picture' })).toBeVisible()
  await expect(page.locator('.task-item input').first()).toBeChecked()
  await tabs.getByRole('link', { name: 'Decisions', exact: true }).click()
  await expect(page.locator('.decision-card')).toHaveCount(4)
  await tabs.getByRole('link', { name: 'Conflicts', exact: false }).click()
  await expect(page.locator('.conflict-card')).toHaveCount(1)
  await tabs.getByRole('link', { name: 'Handover', exact: true }).click()
  await expect(page.locator('.report-card')).toHaveCount(1)
  await tabs.getByRole('link', { name: 'Overview', exact: true }).click()
  await expect(page.locator('.workspace-stat')).toHaveCount(4)
})

test('exit demo mode returns to the live backend view and live copy', async ({ page }) => {
  await loadDemo(page)
  await page.getByRole('button', { name: 'Exit demo mode' }).first().click()
  await expect(page.getByText('Live workspace').first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Welcome back, Alex' })).toBeVisible()

  await navigate(page, 'Projects')
  await expect(
    page.getByText('Projects are stored by the NEXUM backend', { exact: false }),
  ).toBeVisible()

  await page.goto('/projects/missing-project')
  await expect(page.getByRole('heading', { name: 'Project not found' })).toBeVisible()
  await expect(
    page.getByText('This project does not exist in the backend', { exact: false }),
  ).toBeVisible()
})

test('settings, keyboard search, FAQs, and unknown routes work', async ({ page }) => {
  await loadDemo(page)
  await page.goto('/settings')
  await page.getByRole('textbox', { name: 'Display name' }).fill('Taylor Lee')
  await page.getByRole('button', { name: 'Save profile' }).click()
  await page.getByRole('switch', { name: 'Compact layout' }).click()
  await expect(page.locator('.app-shell')).toHaveClass(/compact/)
  await page.getByRole('switch', { name: 'Reduce motion' }).click()
  await expect(page.locator('.app-shell')).toHaveClass(/reduce-motion/)
  await page.getByLabel('Default project view').selectOption('list')
  await navigate(page, 'Projects')
  await expect(page.locator('.project-list-card')).toHaveCount(3)
  await navigate(page, 'Overview')
  await expect(page.getByRole('heading', { name: 'Welcome back, Taylor' })).toBeVisible()
  await page.keyboard.press('ControlOrMeta+k')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('textbox', { name: 'Search anything...' }).fill('JWT')
  await page
    .locator('.search-results > button')
    .filter({ hasText: 'Use JWT-based authentication' })
    .click()
  await expect(page.getByRole('dialog')).toContainText('Rationale')
  await page.keyboard.press('Escape')
  await navigate(page, 'Help & Documentation')
  await page.getByText('Will my changes be here when I come back?', { exact: true }).click()
  await expect(page.locator('details').first()).toHaveAttribute('open', '')
  await page.goto('/does-not-exist')
  await expect(page.getByRole('heading', { name: 'A little off the map' })).toBeVisible()
  await page.goto('/projects/expired-session')
  await expect(page.getByRole('heading', { name: 'Project not found' })).toBeVisible()
})

for (const width of [1440, 1024, 768, 390]) {
  test(`responsive routes have no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await loadDemo(page)
    for (const route of [
      '/',
      '/projects',
      '/projects/shopsphere',
      '/knowledge',
      '/decisions',
      '/conflicts',
      '/handovers',
      '/settings',
      '/help',
    ]) {
      await page.goto(route)
      await expect(page.locator('main h1')).toBeVisible()
      await assertNoOverflow(page)
    }
    if (width === 390) {
      await page.getByRole('button', { name: 'Open navigation' }).click()
      await navigate(page, 'Projects')
      await expect(page.locator('.sidebar')).not.toHaveClass(/mobile-open/)
    }
    await page.goto('/')
    await page.screenshot({ path: `test-artifacts/overview-${width}.png`, fullPage: true })
    if (width === 1440) {
      await page.goto('/conflicts')
      await page.screenshot({ path: 'test-artifacts/conflicts-desktop.png', fullPage: true })
      await page.goto('/settings')
      await page.screenshot({ path: 'test-artifacts/settings-desktop.png', fullPage: true })
    }
  })
}
