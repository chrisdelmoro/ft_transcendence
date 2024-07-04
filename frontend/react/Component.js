const componentState = new Map();
function deepEqual(a, b) {
    if (a === b) {
        return true;
    }

    if (a == null || b == null || typeof a !== "object" || typeof b !== "object") {
        return false;
    }

    if (Array.isArray(a) !== Array.isArray(b)) {
        return false;
    }

    if (Array.isArray(a)) {
        if (a.length !== b.length) {
            return false;
        }

        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) {
                return false;
            }
        }

        return true;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
        return false;
    }

    for (let key of keysA) {
        if (!deepEqual(a[key], b[key])) {
            return false;
        }
    }

    return true;
}

export default class Component {
    constructor(to) {
        this.to = to;
        this.componentId = Math.random().toString(36).substr(2, 9);
        if (!componentState.has(this.componentId)) {
            componentState.set(this.componentId, { state: [], effects: [], cleanups: [] });
        }
        this.stateCursor = 0;
        this.effectCursor = 0;
    }

    setState(newState) {
        const currentState = componentState.get(this.componentId).state;
        componentState.set(this.componentId, { ...componentState.get(this.componentId), state: { ...currentState, ...newState } });
        this.reRender();
    }

    useState(initialValue) {
        const currentState = componentState.get(this.componentId).state;
        const stateIndex = this.stateCursor;

        if (currentState[stateIndex] === undefined) {
            currentState[stateIndex] = initialValue;
        }

        const setState = (newValue) => {
            if (deepEqual(newValue, currentState[stateIndex])) return;
            currentState[stateIndex] = newValue;
            componentState.set(this.componentId, { ...componentState.get(this.componentId), state: currentState });
            this.reRender();
        };

        const value = () => currentState[stateIndex];

        this.stateCursor++;
        return [value, setState];
    }

    useEffect(effect, deps) {
        const { effects, cleanups } = componentState.get(this.componentId);
        const effectIndex = this.effectCursor;
        if (effects[effectIndex] === undefined) {
            effects[effectIndex] = { effect, deps: deps };
        }
        const hasChangedDeps = deps
            ? !effects[effectIndex].deps ||
              deps.some((dep, i) => dep !== effects[effectIndex].deps[i])
            : true;
        if (hasChangedDeps) {
            if (cleanups[effectIndex]) {
                cleanups[effectIndex]();
            }
            cleanups[effectIndex] = effect();
            effects[effectIndex].deps = deps;
        }
        this.effectCursor++;
    }

    destroy() {
        
    }

    render() {
        // Implementado pelos componentes derivados
    }
    
    async reRender() {
        const activeElementId = document.activeElement.id;

        this.element = this.render();
        if (typeof this.to === 'string') {
            document.querySelector(this.to).innerHTML = this.element;
        } else {
            this.to.innerHTML = this.element;
        }
        await this.mount();

        const activeElement = document.getElementById(activeElementId);
        if (activeElement && (activeElement.type === 'email' || activeElement.type === 'password' || activeElement.type === 'text')) {
            let change = false;
            activeElement.focus();
            if (activeElement.type === 'email') {
                activeElement.type = 'text';
                change = true;
            }
            activeElement.setSelectionRange(activeElement.value.length, activeElement.value.length);
            if (change) {
                activeElement.type = 'email';
            }
        }

        // Executar efeitos após a renderização
        this.effectCursor = 0;
        const { effects, cleanups } = componentState.get(this.componentId);
        effects.forEach((effectObj, index) => {
            const { effect, deps } = effectObj;
            const hasChangedDeps = deps
                ? !effects[index].deps ||
                  deps.some((dep, i) => dep !== effects[index].deps[i])
                : true;

            if (hasChangedDeps) {
                if (cleanups[index]) {
                    cleanups[index]();
                }
                effects[index].deps = deps;
                cleanups[index] = effect();
            }
        });
    }

    mount() {
        // Implementado pelos componentes derivados para adicionar event listeners
    }
}
