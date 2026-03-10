describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  it('affiche le formulaire de connexion', () => {
    cy.visit('/login')
    cy.contains('h1', 'Nexum').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('contain', 'Se connecter')
  })

  it('affiche une erreur avec des identifiants invalides', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('faux-email-inexistant@test.com')
    cy.get('input[type="password"]').type('mauvais-mot-de-passe')
    cy.get('form').submit()

    // Le serveur retourne 401 → le composant affiche l'erreur
    cy.contains('Impossible de se connecter', { timeout: 15000 }).should('be.visible')
  })

  it('se connecte avec des identifiants valides', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').clear().type('alice@example.com')
    cy.get('input[type="password"]').clear().type('password123')
    cy.get('button[type="submit"]').should('not.be.disabled').click()

    // Doit rediriger vers la home
    cy.location('pathname', { timeout: 30000 }).should('not.eq', '/login')
  })

  it('affiche le lien vers la création de compte', () => {
    cy.visit('/login')
    cy.contains('Créer un compte gratuitement').should('be.visible')
    cy.contains('Créer un compte gratuitement').click()
    cy.location('pathname').should('eq', '/register')
  })
})


