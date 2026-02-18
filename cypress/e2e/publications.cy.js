describe('Publication Flow', () => {
  beforeEach(() => {
    // Mock Login
    cy.intercept('POST', /\/login/, {
      statusCode: 200,
      body: { token: 'fake-token-123' }
    }).as('loginSuccess')

    // Mock User Fetch
    cy.intercept('GET', /\/users/, {
      statusCode: 200,
      body: {
        'hydra:member': [
          {
            '@id': '/api/users/1',
            id: 1,
            email: 'alice@example.com',
            displayName: 'Alice'
          }
        ]
      }
    }).as('getUser')

    // Login via UI (using mocks)
    cy.visit('/login')
    cy.get('input[type="email"]').type('alice@example.com')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.location('pathname').should('eq', '/')
  })


  it('should create a new publication', () => {
    const postContent = `Test publication ${Date.now()}`

    // Mock Post Creation
    cy.intercept('POST', /\/messages/, {
      statusCode: 201,
      body: {
        id: 100,
        content: postContent,
        author: { displayName: 'Alice' },
        createdAt: new Date().toISOString()
      }
    }).as('createPost')

    // Mock Feed Refresh (GET messages)
    cy.intercept('GET', /\/messages/, (req) => {
        req.reply({
            statusCode: 200,
            body: {
                'hydra:member': [
                    {
                        id: 100,
                        content: postContent,
                        author: { displayName: 'Alice' },
                        createdAt: new Date().toISOString()
                    }
                ]
            }
        })
    }).as('getFeed')

    // 2. Find publication composer
    cy.get('textarea[placeholder="Quoi de neuf ?"]').should('be.visible')

    // 3. Type content
    cy.get('textarea[placeholder="Quoi de neuf ?"]').type(postContent)

    // 4. Click publish button
    cy.contains('button', 'Publier').click()

    // 5. Verify post appeared (mocked)
    cy.contains(postContent).should('be.visible')
  })
})


