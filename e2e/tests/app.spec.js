/* eslint-env mocha */
const { expect } = require('chai')
const { test } = require('../browser')

describe('Home screen', () => {
  it(
    'Title can be seen at /',
    test(async (browser, opts) => {
      const page = await browser.newPage()
      await page.goto(`${opts.appUrl}/`)

      const BODY_SELECTOR = 'body'
      await page.waitFor(BODY_SELECTOR)

      const innerText = await page.evaluate(sel => {
        return document.querySelector(sel).innerText
      }, BODY_SELECTOR)

      expect(innerText).to.contain('Battle Math')
    })
  )

  it(
    'Hero be seen at /',
    test(async (browser, opts) => {
      const page = await browser.newPage()
      await page.goto(`${opts.appUrl}/`)

      const result = await page.$eval('body', e => e.innerHTML)

      expect(result).to.contain('hero')
    })
  )

  it(
    'Correct addition answer reduces enemies by one /',
    test(async (browser, opts) => {
      const page = await browser.newPage()
      await page.goto(`${opts.appUrl}/`)

      const val1 = await page.$eval('#val1', e => e.innerText)
      const val2 = await page.$eval('#val2', e => e.innerText)

      const answer = val1 + val2

      await page.type('#answerInput', answer)

      await page.click('#submit')

      // There should only be 2 elements with the class enemy
      const result = await page.$eval('body', e => e.innerHTML)

      expect(result).to.contain('hero')
    })
  )
})
