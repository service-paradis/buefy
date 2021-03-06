import { mount, shallowMount } from '@vue/test-utils'
import BDatepicker from '@components/datepicker/Datepicker'

import config, {setOptions} from '@utils/config'

const dropdownMenu = '.dropdown-menu'
let wrapper, defaultProps, $dropdown, $input

describe('BDatepicker', () => {
    beforeEach(() => {
        setOptions(Object.assign(config, {
            defaultMonthNames: [
                'January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'
            ],
            defaultDayNames: ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'S'],
            focusedDate: new Date('2018-07')
        }))

        defaultProps = () => ({
            dayNames: config.defaultDayNames,
            monthNames: config.defaultMonthNames,
            focused: {
                month: config.focusedDate.getMonth(),
                year: config.focusedDate.getFullYear()
            }
        })
    })

    describe('simple', () => {
        beforeEach(() => {
            wrapper = shallowMount(BDatepicker, {
                propsData: {
                    ...defaultProps
                },
                stubs: {
                    transition: false
                }
            })
        })

        it('is called', () => {
            expect(wrapper.name()).toBe('BDatepicker')
            expect(wrapper.isVueInstance()).toBeTruthy()
        })

        it('render correctly', () => {
            wrapper.setProps({dateCreator: () => {}})
            expect(wrapper.html()).toMatchSnapshot()
        })

        it('it react accordingly when setting computedValue', () => {
            const date = new Date()
            wrapper.vm.updateInternalState = jest.fn()
            wrapper.vm.togglePicker = jest.fn()
            wrapper.vm.computedValue = date
            expect(wrapper.vm.updateInternalState).toHaveBeenCalled()
            expect(wrapper.vm.togglePicker).toHaveBeenCalled()
            expect(wrapper.emitted()['input']).toBeTruthy()
        })

        describe('#dateFormatter', () => {
            it('should add one to month since month in dates starts from 0', () => {
                const dateToFormat = new Date(2019, 3, 1)
                const formattedDate = wrapper.vm.dateFormatter(dateToFormat, wrapper.vm)
                expect(formattedDate).toEqual('2019-4-1')
            })

            it('should format based on 2-digit numeric locale date with type === month', () => {
                wrapper.setProps({
                    type: 'month'
                })
                const dateToFormat = new Date(2019, 3, 1)
                const formattedDate = wrapper.vm.dateFormatter(dateToFormat, wrapper.vm)
                expect(formattedDate).toEqual('2019-04')
            })

            it('should format a range of dates passed via array', () => {
                const dateToFormat = [
                    new Date(2019, 3, 1),
                    new Date(2019, 3, 3)
                ]
                const formattedDate = wrapper.vm.dateFormatter(dateToFormat, wrapper.vm)
                expect(formattedDate).toEqual('2019-4-1 - 2019-4-3')
            })
        })

        describe('#formatValue', () => {
            it('should call dateFormatter, passing the date', () => {
                const mockDateFormatter = jest.fn()
                wrapper.setProps({
                    dateFormatter: mockDateFormatter
                })
                const date = new Date()
                wrapper.vm.formatValue(date)
                expect(mockDateFormatter.mock.calls[0][0]).toEqual(date)
            })

            it('should not call dateFormatter when value is undefined or NaN', () => {
                const mockDateFormatter = jest.fn()
                wrapper.setProps({
                    dateFormatter: mockDateFormatter
                })
                wrapper.vm.formatValue(undefined)
                expect(mockDateFormatter.mock.calls.length).toEqual(0)
                wrapper.vm.formatValue('buefy')
                expect(mockDateFormatter.mock.calls.length).toEqual(0)
            })

            it('should not call dateFormatter when value is an array with undefined or NaN elements', () => {
                const mockDateFormatter = jest.fn()
                wrapper.setProps({
                    dateFormatter: mockDateFormatter
                })
                wrapper.vm.formatValue([new Date(), undefined])
                expect(mockDateFormatter.mock.calls.length).toEqual(0)
                wrapper.vm.formatValue([new Date(), 'buefy'])
                expect(mockDateFormatter.mock.calls.length).toEqual(0)
            })
        })
    })

    describe('advanced', () => {
        beforeEach(() => {
            wrapper = mount(BDatepicker, {
                propsData: {
                    ...defaultProps
                },
                stubs: {
                    transition: false
                }
            })
            $dropdown = wrapper.find(dropdownMenu)
            $input = wrapper.find('input')
        })

        it('has an input type', () => {
            expect(wrapper.contains('.control .input[type=text]')).toBeTruthy()
        })

        it('has a dropdown menu hidden by default', () => {
            expect(wrapper.contains(dropdownMenu)).toBeTruthy()
            expect($dropdown.isVisible()).toBeFalsy()
        })

        it('has no input type when inline', () => {
            wrapper.setProps({
                inline: 'true'
            })
            expect(wrapper.contains('.control .input[type=text]')).toBeFalsy()
        })

        it('has a dropdown menu visible when inline', () => {
            wrapper.setProps({
                inline: 'true'
            })
            expect(wrapper.contains(dropdownMenu)).toBeTruthy()
            expect($dropdown.isVisible()).toBeTruthy()
        })

        it('call toggle method', async () => {
            wrapper.vm.$refs.dropdown.isActive = false
            wrapper.vm.toggle()
            await wrapper.vm.$nextTick()
            expect(wrapper.vm.$refs.dropdown.isActive).toBeTruthy()
            expect($dropdown.isVisible()).toBeTruthy()
            wrapper.vm.toggle()
            await wrapper.vm.$nextTick()
            expect(wrapper.vm.$refs.dropdown.isActive).toBeFalsy()
        })

        it('can emit input, focus and blur events', () => {
            $input.trigger('focus')
            expect(wrapper.emitted()['focus']).toBeTruthy()
            $input.trigger('blur')
            expect(wrapper.emitted()['blur']).toBeTruthy()
        })

        it('can open datepicker on openOnfocus', () => {
            wrapper.setProps({
                openOnFocus: true
            })
            $input.trigger('focus')
            expect(wrapper.vm.$refs.dropdown.isActive).toBeTruthy()
            expect($dropdown.isVisible()).toBeTruthy()
        })

        it('can open datepicker on enter', () => {
            wrapper.setProps({
                openOnFocus: false
            })
            $input.trigger('focus')
            $input.trigger('keyup.enter')
            expect(wrapper.vm.$refs.dropdown.isActive).toBeTruthy()
            expect($dropdown.isVisible()).toBeTruthy()
        })

        it('can close datepicker on esc', () => {
            wrapper.vm.$refs.dropdown.isActive = true
            const keyupEvent = new Event('keyup')
            keyupEvent.keyCode = 27
            window.document.dispatchEvent(keyupEvent)
            wrapper.vm.$nextTick(() => expect($dropdown.isVisible()).toBeFalsy())
        })
    })
})
