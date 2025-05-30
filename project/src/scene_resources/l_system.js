/**
 * Grammar of the l_system
 */


// TODO: Maybe try and replace this with a map or perhaps pass a rules var wihtin apply trre
export function rule(char) {
    switch (char) {
        case 'B':
            return 'B[XB][YB][ZB][B]';
        default:
            return char;
    }
}

export function applyTree(state) {
    if (state == '') {
        return '';
    }
    let new_state = '';

    for (let i = 0; i < state.length; i++) {
        let optionRule = rule(state[i]);

        if (optionRule == '') {
            new_state += state[i];
        } else {
            new_state += optionRule;
        }
    }

    return new_state;
}

export function applyNTree(state, n) {
    let new_state = state;
    for (let i = 0; i < n; i++) {
        new_state = applyTree(new_state);
    }
    return new_state;
}