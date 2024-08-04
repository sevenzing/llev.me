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
