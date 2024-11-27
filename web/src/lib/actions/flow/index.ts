import type {ComponentType} from 'svelte';
import {derived, get, writable, type Writable} from 'svelte/store';

export type Step<State> = {
	title: string;
	action?: string;
	description: string;
	component?: ComponentType;
	execute(state: State): Promise<{newState: State; nextStep?: number; auto?: boolean}>;
	end?: boolean;
};

export type Flow<State> = {
	type: string;
	steps: Step<State>[];
	state: Writable<State>;
	currentStepIndex: Writable<number>;
	completionMessage?: string;
};

export type FlowState = Flow<any> | undefined;

export function initFlow() {
	const store = writable<FlowState>(undefined);

	return {
		subscribe: store.subscribe,
		async start(flow: Flow<any>) {
			let currentStep: Step<any> | undefined;
			async function next() {
				if (!currentStep) {
					currentStep = flow.steps[0];
				} else {
					currentStep = flow.steps[get(flow.currentStepIndex)];
				}
				if (currentStep) {
					const {newState, nextStep, auto} = await currentStep.execute(get(flow.state));
					flow.state.set(newState);
					flow.currentStepIndex.update((v) => {
						if (nextStep) {
							v = nextStep;
						} else {
							v++;
						}

						return v;
					});
					if (auto) {
						next();
					}
				} else {
					store.set(undefined);
				}
			}

			store.set(flow);

			if (!flow.steps[0].action) {
				next();
			}
		},
		cancel() {
			console.log('canceling flow');
			store.set(undefined);
		},
	};
}

export const currentFlow = initFlow();

//-------------------------------------------------------------------------------------------------
// TODO test
//-------------------------------------------------------------------------------------------------
const currentStep = writable<Step<any> | undefined>(undefined);
export const action = derived(currentStep, ($currentStep) => {
	return $currentStep ? $currentStep.action : 'done';
});
let last:
	| {
			state: Writable<any>;
			unsubscribeFromState: () => void;
			currentStepIndex: Writable<number>;
			unsubscribeFromCurrentStepIndex: () => void;
	  }
	| undefined = undefined;

currentFlow.subscribe(($currentFlow) => {
	const state = $currentFlow?.state;
	const currentStepIndex = $currentFlow?.currentStepIndex;

	if (!state || !currentStepIndex) {
		if (last) {
			last.unsubscribeFromState();
			last.unsubscribeFromCurrentStepIndex();
			last = undefined;
		}
	} else {
		let needSubscribtion = false;

		if (last) {
			if (last.state != state || last.currentStepIndex != currentStepIndex) {
				last.unsubscribeFromState();
				last.unsubscribeFromCurrentStepIndex();
				needSubscribtion = true;
			}
		} else {
			needSubscribtion = true;
		}

		if (needSubscribtion) {
			const unsubscribeFromState = state.subscribe(($state) => {});
			const unsubscribeFromCurrentStepIndex = currentStepIndex.subscribe(($currentStepIndex) => {
				currentStep.set(
					$currentFlow && $currentStepIndex != undefined && $currentStepIndex < $currentFlow.steps.length
						? $currentFlow.steps[$currentStepIndex]
						: undefined,
				);
			});
			last = {
				state,
				currentStepIndex,
				unsubscribeFromCurrentStepIndex,
				unsubscribeFromState,
			};
		}
	}
});
//-------------------------------------------------------------------------------------------------

if (typeof window != 'undefined') {
	(window as any).currentFlow = currentFlow;
}
