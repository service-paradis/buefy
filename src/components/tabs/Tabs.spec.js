import { shallowMount } from '@vue/test-utils'
import BTabs from '@components/tabs/Tabs'

let wrapper

describe('BTabs', () => {
    beforeEach(() => {
        wrapper = shallowMount(BTabs)
    })

    it('is called', () => {
        expect(wrapper.name()).toBe('BTabs')
        expect(wrapper.isVueInstance()).toBeTruthy()
    })

    it('render correctly', () => {
        expect(wrapper.html()).toMatchSnapshot()
    })
})
