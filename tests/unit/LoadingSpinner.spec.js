import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '../../components/LoadingSpinner.vue'

describe('LoadingSpinner.vue', () => {
  it('s\'affiche correctement', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.exists()).toBe(true)
  })

  it('contient 3 points d\'animation', () => {
    const wrapper = mount(LoadingSpinner)
    const dots = wrapper.findAll('span')
    expect(dots).toHaveLength(3)
  })

  it('chaque point a la classe animate-bounce', () => {
    const wrapper = mount(LoadingSpinner)
    const dots = wrapper.findAll('span')
    dots.forEach(dot => {
      expect(dot.classes()).toContain('animate-bounce')
    })
  })

  it('chaque point est rond (rounded-full)', () => {
    const wrapper = mount(LoadingSpinner)
    const dots = wrapper.findAll('span')
    dots.forEach(dot => {
      expect(dot.classes()).toContain('rounded-full')
    })
  })

  it('a un conteneur centré', () => {
    const wrapper = mount(LoadingSpinner)
    const container = wrapper.find('div')
    expect(container.classes()).toContain('flex')
    expect(container.classes()).toContain('items-center')
    expect(container.classes()).toContain('justify-center')
  })
})
