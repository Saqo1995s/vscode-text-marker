import {mock, verify, when} from '../../helpers/mock';
import HighlightUsingRegexCommand from '../../../lib/commands/highlight-using-regex';
import DecorationOperatorFactory from '../../../lib/decoration/decoration-operator-factory';
import DecorationOperator from '../../../lib/decoration/decoration-operator';
import RegexPattern from '../../../lib/pattern/regex';
import MatchingModeRegistry from '../../../lib/matching-mode-registry';
import WindowComponent from '../../../lib/vscode/window';
import {none, some} from 'fp-ts/lib/Option';
import {task} from 'fp-ts/lib/Task';

suite('HighlightUsingRegexCommand', () => {
    const matchingModeRegistry = mock(MatchingModeRegistry);

    suite('When regex is given', () => {
        const decorationOperator = mock(DecorationOperator);
        const decorationOperatorFactory = mock(DecorationOperatorFactory);
        when(decorationOperatorFactory.createForVisibleEditors()).thenReturn(decorationOperator);

        const windowComponent = mock(WindowComponent);
        when(windowComponent.showInputBox({placeHolder: 'Enter a regular expression to highlight text'}))
            .thenReturn(task.of(some('pattern')));

        const command = new HighlightUsingRegexCommand(decorationOperatorFactory, matchingModeRegistry, windowComponent);

        test('it decorates text that matches to the specified regex', async () => {
            await command.execute();

            verify(decorationOperator.addDecoration(new RegexPattern({phrase: 'pattern'})));
        });
    });

    suite('When regex is NOT given', () => {
        const decorationOperatorFactory = mock(DecorationOperatorFactory);

        const windowComponent = mock(WindowComponent);
        when(windowComponent.showInputBox({placeHolder: 'Enter a regular expression to highlight text'})).thenReturn(task.of(none));

        const command = new HighlightUsingRegexCommand(decorationOperatorFactory, matchingModeRegistry, windowComponent);

        test('it does nothing if regex is not given', async () => {
            await command.execute();

            verify(decorationOperatorFactory.createForVisibleEditors(), {times: 0});
        });
    });
});
