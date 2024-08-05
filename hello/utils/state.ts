export const decodeSearchState = (stateSearch: string) => {
    return JSON.parse(atob(stateSearch));
}

export const encodeSearchState = (state: any) => {
    return btoa(JSON.stringify(state));
}

export const updateStateWhenCheckboxPressed = (state: any, id: number, index: number) => {
    const word = state[id] || 0;
    let newWord = word ^ (1 << index);
    const newState = { ...state, [id]: newWord };
    return newState;
}

export const isStateEmpty = (state: any) => {
    return Object.values(state).every((v) => v === 0)
}

export const getValueFromState = (state: any, id: number, index: number) => {
    return ((state[id] || 0) & (1 << index)) > 0;
}

export const StateIsSubset = (main: any, subset: any) => {
    for (const key in subset) {
        if (subset[key] != (main[key] & subset[key])) {
            return false;
        }
    }
    return true;
}

export const StateIsEqual = (state1: any, state2: any) => {
    for (const key in state1) {
        if (state1[key] !== (state2[key] || 0)) {
            return false;
        }
    }
    for (const key in state2) {
        if (state2[key] !== (state1[key] || 0)) {
            return false;
        }
    }
    return true;
}
