/// <reference types="Cypress" />

// Above line is used to get autocompletion in vscode

describe('Home screen', () => {
  it('Title can be seen at /', () => {
    cy.visit('/')
    cy.contains('Battle Math')
  })

  it('Hero be seen at /', () => {
    cy.visit('/')
    cy.get('#hero').should('have.length', 1)
  })

  it('Correct addition answer reduces enemies by one /', () => {
    cy.visit('/').wait(200) // wait is important as we will get the initial state otherwise

    cy.get('#val1')
      .invoke('text')
      .then(text1 => {
        cy.get('#val2')
          .invoke('text')
          .then(text2 => {
            const answer = parseInt(text1, 10) + parseInt(text2, 10)
            cy.get('#answer-input').type(answer)
            cy.get('[data-testid=submit]').click()
            cy.get('.enemy').should('have.length', 2)
          })
      })
  })
})
