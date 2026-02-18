// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
Cypress.Commands.add('login', (email = 'alice@example.com', password = 'password123') => {
  cy.visit('/login')
  cy.get('input[type="email"]').should('be.visible').type(email)
  cy.get('input[type="password"]').should('be.visible').type(password)
  cy.get('button[type="submit"]').click()
  // Wait for redirect to home
  cy.location('pathname').should('eq', '/')
  cy.get('#user-menu-trigger', { timeout: 10000 }).should('be.visible')
})


Cypress.Commands.add('register', (email, password, name) => {
  cy.visit('/register')
  cy.get('input[placeholder*="Alice"]').should('be.visible').type(name)
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.contains('button', "S'inscrire").click()
  // Should redirect to login
  cy.url().should('include', '/login')
})

Cypress.Commands.add('registerAPI', (email, password, name) => {
  const code = '6c4bd706' // Hardcoded from .env for test reliability
  const apiBaseUrl = 'https://wra506d.davidannebicque.ovh/api'

  return cy.request({
    method: 'POST',
    url: `${apiBaseUrl}/register`,
    body: {
      email,
      password,
      displayName: name,
      codeInscription: code
    },
    failOnStatusCode: false // Don't fail if user already exists
  }).then((response) => {
    if (response.status !== 201 && response.status !== 200) {
      cy.log('API Registration Failed:', JSON.stringify(response.body))
    }
  })
})

