import {mockType} from '../../helpers/mock';
import {assertOption} from '../../helpers/assertions';
import DecorationRegistry from '../../../lib/decoration/decoration-registry';
import PatternFactory from '../../../lib/pattern/pattern-factory';
import MatchingModeRegistry from '../../../lib/matching-mode-registry';
import ConfigStore from '../../../lib/config-store';
import * as assert from 'assert';
import * as O from 'fp-ts/lib/Option';
import {pipe} from 'fp-ts/lib/pipeable';

suite('DecorationRegistry', () => {
    const pink = 'rgba(255,192,203,1)';
    const yellow = 'rgba(255,255,0,1)';

    test('it registers a pattern and returns registry information', () => {
        const registry = createDecorationRegistry();

        const pattern = createPattern('PATTERN');
        assert.deepEqual(registry.issue(pattern), O.some({
            id: 'UUID_1',
            colour: pink,
            pattern
        }));
    });

    test('it does not register the same pattern multiple times', () => {
        const registry = createDecorationRegistry();

        const firstResult = registry.issue(createPattern('PATTERN'));
        const secondResult = registry.issue(createPattern('PATTERN'));

        assertOption(firstResult, d => {
            assert.equal(d.colour, pink);
        });
        assert.equal(secondResult, O.none);
    });

    test('it returns a registered decoration type for the passed decoration id', () => {
        const registry = createDecorationRegistry();

        const pattern = createPattern('PATTERN');
        registry.issue(createPattern('PATTERN'));

        assert.deepEqual(registry.inquireById('UUID_1'), O.some({
            id: 'UUID_1',
            colour: pink,
            pattern
        }));
    });

    test('it returns a registered decoration type for the passed regex', () => {
        const registry = createDecorationRegistry();

        const pattern = createPattern('PATTERN');
        registry.issue(pattern);

        assert.deepEqual(registry.inquireByPattern(pattern), O.some({
            id: 'UUID_1',
            colour: pink,
            pattern: pattern
        }));
    });

    test("it can remove given pattern and it's associated decoration type from the registry", () => {
        const registry = createDecorationRegistry();

        const pattern = createPattern('PATTERN');
        pipe(registry.issue(pattern), O.map(d => registry.revoke(d.id)));
        assert.equal(registry.inquireByPattern(pattern), O.none);
    });

    test('it can return all registered decorations at once', () => {
        const registry = createDecorationRegistry();
        const pattern1 = createPattern('PATTERN_1');
        const pattern2 = createPattern('PATTERN_2');
        registry.issue(pattern1);
        registry.issue(pattern2);
        assert.deepEqual(registry.retrieveAll(), [
            {
                id: 'UUID_1',
                colour: pink,
                pattern: pattern1
            },
            {
                id: 'UUID_2',
                colour: yellow,
                pattern: pattern2
            }
        ]);
    });

    test('it does not return revoked decorations', () => {
        const registry = createDecorationRegistry();
        const pattern1 = createPattern('PATTERN_1');
        const pattern2 = createPattern('PATTERN_2');
        registry.issue(pattern1);
        registry.issue(pattern2);
        registry.revoke('UUID_1');

        assert.deepEqual(registry.retrieveAll(), [
            {
                id: 'UUID_2',
                colour: yellow,
                pattern: pattern2
            }
        ]);
    });

    test('it issues new decoration with new color if color not provided', () => {
        const registry = createDecorationRegistry({window: {}});

        const pattern1 = createPattern('TEXT_1');
        assertOption(registry.issue(pattern1), d => {
            assert.equal(d.colour, pink);
        });
        const pattern2 = createPattern('TEXT_2');
        assertOption(registry.issue(pattern2), d => {
            assert.equal(d.colour, yellow);
        });
    });

    test('it does not issue a colour that is used by a saved pattern', () => {
        const registry = createDecorationRegistry({window: {}});
        const savedPattern = createPattern('TEXT_1');
        const newPattern = createPattern('TEXT_2');

        registry.issue(savedPattern, pink);
        assertOption(registry.issue(newPattern), d => {
            assert.equal(d.colour, yellow);
        });
    });

    test('it issues new decoration with provided color', () => {
        const registry = createDecorationRegistry({window: {}});

        const pattern1 = createPattern('TEXT_1');
        assertOption(registry.issue(pattern1, '#DB4D6D'), d => {
            assert.equal(d.colour, '#DB4D6D');
        });
    });

    test('it toggles the case sensitivity of a pattern', () => {
        const registry = createDecorationRegistry();

        const pattern = createPattern('TEXT');
        const decoration = registry.issue(pattern);

        assertOption(decoration, d => {
            const id = d.id;
            const newDecoration = d.withCaseSensitivityToggled();
            registry.update(d, newDecoration);
            assert.deepEqual(registry.inquireById(id), O.some(newDecoration));
        });
    });

    function createDecorationRegistry(options: any = {}) {
        const generateUuid = createGenerateUuid();
        const configStore = options.configStore || mockType<ConfigStore>({
            highlightColors: [pink, yellow]
        });
        return new DecorationRegistry(configStore, generateUuid);
    }

    function createPattern(phrase: string) {
        const matchingModeRegistry = mockType<MatchingModeRegistry>({mode: {ignoreCase: false}});
        return new PatternFactory(matchingModeRegistry).create({phrase});
    }

    function createGenerateUuid() {
        let i = 1;
        return () => `UUID_${i++}`;
    }
});
