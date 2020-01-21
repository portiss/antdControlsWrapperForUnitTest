import { strict as assert } from 'assert'
import { wait } from '@testing-library/dom'

export function sleep(n) {
    return new Promise(resolve => {
        setTimeout(resolve, n)
    })
}

export function pause(scope) {
    return new Promise(_ => {
        for (let key in scope) {
            if (scope.hasOwnProperty(key)) window[key] = scope[key]
        }
    })
}

export function exists(wrapper, parent, testId) {
    try {
        new wrapper(parent, testId)
    }
    catch (err) {
        if (err.message.includes('not found'))
            return false
        throw err
    }
    return true
}

class Alert {
    static getSelector(testId) {
        return `[data-test-id='${testId}']`
    }

    constructor(parent, testId) {
        this.parent = parent
        this.selector = this.constructor.getSelector(testId)
        this.update()
    }

    update() {
        this.field = this.parent.find(this.selector).at(0)
        if (!this.field || !this.field.length) {
            throw Error('Alert not found: ' + this.selector)
        }
    }

    getValue() {
        this.update()
        return this.field.prop('message')
    }
}

class Input {
    static getSelector(testId) {
        return `[data-test-id='${testId}']`
    }

    constructor(parent, testId) {
        this.parent = parent
        this.selector = this.constructor.getSelector(testId)
        this.update()
    }

    update() {
        this.field = this.parent.find(this.selector).at(0)
        if (!this.field || !this.field.length) {
            throw Error('Input not found: ' + this.selector)
        }
    }

    getValue() {
        this.update()
        return this.field.prop('value')
    }

    changeValue(newValue) {
        this.field.simulate('change', { target: { value: newValue } })
    }
}

class BasicInput extends Input {
    static getSelector(testId) {
        return `input[data-test-id='${testId}']`
    }
}

class InputNumber extends Input {
    update() {
        this.field = this.parent.find('InputNumber' + this.selector).at(1)
        if (!this.field || !this.field.length) {
            throw Error('InputNumber not found: InputNumber' + this.selector)
        }
        this.input = this.parent.find('input' + this.selector).at(0)
        if (!this.input || !this.input.length) {
            throw Error('InputNumber not found: input' + this.selector)
        }
    }

    getValue() {
        this.update()
        return this.field.state('value')
    }

    changeValue(newValue) {
        this.input.simulate('change', { target: { value: '' + newValue } })
        this.input.simulate('blur')
    }
}

class Collapse {
    constructor(parent, testId) {
        this.parent = parent
        this.selector = `[data-test-id='${testId}'] .ant-collapse-header`
        this.update()
    }

    update() {
        this.panel = this.parent.find(this.selector).at(0)
        if (!this.panel || !this.panel.length) {
            throw Error('Collapse not found: ' + this.selector)
        }
    }

    getOpen() {
        this.update()
        return this.panel.prop('aria-expanded') === 'true'
    }

    toggle() {
        this.panel.simulate('click')
        return sleep(300)
    }

    open() {
        if (this.getOpen()) return
        return this.toggle()
    }

    close() {
        if (this.getOpen()) return this.toggle()
    }
}

class Select {
    static getSelector(testId) {
        return `Select[data-test-id='${testId}']`
    }

    static waitSelectValue = true

    constructor(parent, testId) {
        this.parent = parent
        this.selector = this.constructor.getSelector(testId)
        this.update()
    }

    update() {
        this.field = this.parent.find(this.selector).at(1)
        if (!this.field || !this.field.length) {
            throw Error('Select not found: ' + this.selector)
        }
    }

    getOpen() {
        this.update()
        return this.field.state('open')
    }

    open() {
        if (this.getOpen()) return

        this.field.simulate('click')
        return wait(() => {
            assert(this.getOpen())
        })
    }

    close() {
        if (this.getOpen()) {
            this.field.simulate('click')
            return wait(() => {
                assert.strictEqual(this.getOpen(), false)
            })
        }
    }

    getValue() {
        this.update()
        return this.field.prop('value')
    }

    getAllOptions() {
        return this.field.prop('children').map(x => x.props)
    }

    async selectValue(newValue) {
        await this.open()
        const items = this.field.find('li')
        const options = []
        for (let n = 0; n < items.length; ++n) {
            options[n] = items.at(n)
        }
        const opt = options.find(opt => opt.text() == newValue)

        if (opt) {
            opt.simulate('click')
            return this.constructor.waitSelectValue ? wait(() => {
                assert.strictEqual(this.getOpen(), false)
            }) : undefined
        }
        throw Error('Select option not found: ' + newValue)
    }
}

class RadioGroup {
    static getSelector(testId) {
        return `[data-test-id='${testId}']`
    }

    constructor(parent, testId) {
        this.parent = parent
        this.selector = this.constructor.getSelector(testId)
        this.update()
    }

    getValue() {
        this.update()
        return this.field.prop('value')
    }

    update() {
        this.field = this.parent.find(this.selector).at(0)
        if (!this.field || !this.field.length) {
            throw Error('RadioGroup not found: ' + this.selector)
        }
    }

    selectValue(newValue) {
        const items = this.field.find('input[type="radio"]')
        const options = []
        for (let n = 0; n < items.length; ++n) {
            options[n] = items.at(n)
        }
        const opt = options.find(opt => opt.prop('value') == newValue)
        if (opt) {
            return opt.simulate('change', { target: { checked: true } })
        }
        throw Error('Radio button option not found: ' + newValue)
    }
}

class CapacityInput {
    constructor(parent, testId) {
        this.parent = parent
        this.selector = `[data-test-id='${testId}']`
        this.field = new InputNumber(parent, `${testId}-value`)
        this.select = new Select(parent, `${testId}-unit`)
        this.update()
    }

    update() {
        this.input = this.parent.find(this.selector).at(0)
        if (!this.input || !this.input.length) {
            throw Error('CapacityInput not found: ' + this.selector)
        }
        this.field.update()
        this.select.update()
    }

    getValue() {
        this.update()
        return this.input.prop('value')
    }

    changeValue(newValue) {
        this.field.changeValue(newValue)
    }

    selectUnit(newUnit) {
        return this.select.selectValue(newUnit)
    }
}

class Switch {
    constructor(parent, testId) {
        this.parent = parent
        this.selector = `Switch[data-test-id='${testId}']`
        this.update()
    }

    update() {
        this.field = this.parent.find(this.selector).at(0)
        if (!this.field || !this.field.length) {
            throw Error('Switch not found: ' + this.selector)
        }
    }

    toggle() {
        this.field.simulate('click')
    }

    getValue() {
        this.update()
        return this.field.prop('checked')
    }

    changeValue(newValue) {
        if (typeof newValue !== 'boolean')
            throw Error('Switch: requires boolean value')

        if (this.getValue() === newValue) return
        this.toggle()
    }
}

class SelectMultiple extends Select {
    static waitSelectValue = false

    close() {
        if (this.getOpen()) {
            this.field.setState({ open: false })
            return wait(() => {
                assert.strictEqual(this.getOpen(), false)
            })
        }
    }
}

const wrappers = {
    Input,
    BasicInput,
    InputNumber,
    Collapse,
    Select,
    CapacityInput,
    Switch,
    SelectMultiple,
    Alert,
    RadioGroup,
}

export default wrappers
