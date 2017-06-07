
const PatternAction = require('../../../lib/const').PatternAction;
const ToggleWholeMatchCommand = require('../../../lib/commands/toggle-whole-match');

suite('ToggleWholeMatchCommand', () => {

    test('it toggles partial/whole match of the decoration', () => {
        const windowComponent = {visibleTextEditors: ['EDITOR_1', 'EDITOR_2']};
        const decorationOperator = {updateDecoration: sinon.spy()};
        const decorationOperatorFactory = {create: sinon.stub().returns(decorationOperator)};
        const highlightPatternPicker = {pick: sinon.stub().returns(Promise.resolve('DECORATION_ID'))};
        const command = new ToggleWholeMatchCommand({decorationOperatorFactory, highlightPatternPicker, windowComponent});

        return command.execute().then(() => {
            expect(decorationOperatorFactory.create).to.have.been.calledWith(['EDITOR_1', 'EDITOR_2']);
            expect(decorationOperator.updateDecoration).to.have.been.calledWith('DECORATION_ID', PatternAction.TOGGLE_WHOLE_MATCH);
            expect(highlightPatternPicker.pick).to.have.been.calledWith('Select a pattern to toggle partial/whole match');
        });
    });

    test('it does nothing if text is not selected', () => {
        const windowComponent = {visibleTextEditors: ['EDITOR_1', 'EDITOR_2']};
        const decorationOperatorFactory = {create: sinon.spy()};
        const highlightPatternPicker = {pick: () => Promise.resolve()};
        const command = new ToggleWholeMatchCommand({decorationOperatorFactory, highlightPatternPicker, windowComponent});

        return command.execute().then(() => {
            expect(decorationOperatorFactory.create).to.have.been.not.called;
        });
    });

});
