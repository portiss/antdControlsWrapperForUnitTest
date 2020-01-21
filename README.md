# antdControlsWrapperForUnitTest
Ant design wrappers to use access controls(get/set) via unit tests (React-Enzyme UT)



"data-test-id" is a unique control id, use to idetify the control by dom selector


usage examples: 

const input = new wrappers.Input(formWrapper, 'input-id')

const select = new wrappers.Select(formWrapper, 'select-id')

const selectMultiple = new wrappers.SelectMultiple(formWrapper, 'select-multiple-id')

const switch = new wrappers.Switch(formWrapper, 'switch-id')

const radioGroup = new wrappers.RadioGroup(formWrapper, 'radio-group-id')

const message = new wrappers.Alert(formWrapper, 'message-id')
