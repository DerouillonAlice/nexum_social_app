describe('Publication Flow', () => {
  beforeEach(() => {
    // Login via API directe et injection dans les cookies pour Pinia persist
    cy.request({
      method: 'POST',
      url: 'https://wra506d.davidannebicque.ovh/api/login',
      body: { email: 'alice@example.com', password: 'password123' },
      headers: { 'Content-Type': 'application/json' }
    }).then((response) => {
      const token = response.body.token

      const piniaState = JSON.stringify({
        token: token,
        user: {
          id: 125,
          '@id': '/api/users/125',
          email: 'alice@example.com',
          displayName: 'Alice'
        }
      })

      // pinia-plugin-persistedstate stocke dans un cookie nommé d'après le store
      cy.setCookie('auth', encodeURIComponent(piniaState))
      cy.visit('/')
    })
  })

  it('affiche le compositeur de publication', () => {
    cy.get('textarea', { timeout: 30000 }).should('be.visible')
    cy.contains('button', 'Publier').should('exist')
  })

  it('crée une nouvelle publication', () => {
    const postContent = 'Test E2E Cypress ' + Date.now()

    // Attendre que la page soit chargée
    cy.get('textarea', { timeout: 30000 }).should('be.visible')

    // Écrire dans le compositeur
    cy.get('textarea').type(postContent)

    // Cliquer sur Publier
    cy.contains('button', 'Publier').click()

    // Vérifier que la publication apparaît dans le feed
    cy.contains(postContent, { timeout: 15000 }).should('be.visible')
  })
})


