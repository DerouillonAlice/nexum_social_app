describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  it('should display login form correctly', () => {
    cy.visit('/login')
    cy.contains('h1', 'Nexum').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('contain', 'Se connecter')
  })

  it('should show error with invalid credentials', () => {
    // Mock 401 response
    cy.intercept('POST', '**/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' }
    }).as('loginFail')

    cy.visit('/login')
    cy.get('input[type="email"]').type('wrong@example.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    
    cy.wait('@loginFail')
    
    // Check for error message
    cy.contains(/impossible|erreur|check/i).should('be.visible')
  })

  it('should login successfully with valid credentials', () => {
    // Mock success response
    cy.intercept('POST', '**/login', {
      statusCode: 200,
      body: { token: 'fake-token-123' }
    }).as('loginSuccess')

    cy.intercept('GET', '**/users*', {
      statusCode: 200,
      body: {
        'hydra:member': [
          {
            '@id': '/api/users/1',
            id: 1,
            email: 'alice@example.com',
            displayName: 'Alice',
            avatar: 'avatar.png'
          }
        ]
      }
    }).as('getUser')

    cy.visit('/login')
    cy.get('input[type="email"]').type('alice@example.com')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()

    cy.wait('@loginSuccess')
    cy.wait('@getUser')

    // Should redirect to home
    cy.location('pathname').should('eq', '/')
    // Should see user avatar or menu
    cy.get('#user-menu-trigger').should('be.visible')
  })
})


