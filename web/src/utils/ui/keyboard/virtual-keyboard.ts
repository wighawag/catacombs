import {browser} from '$app/environment';
import {createStore} from '$utils/stores/utils';

export type VirtualkeyBoardState = {visible: boolean};

// TODO
export function initVirtualKeyboardDetector() {
	const initialScreenSize = browser ? screen.height : 0;
	const {readable, set} = createStore<VirtualkeyBoardState>({visible: false});

	if (browser) {
		window.addEventListener('resize', (ev) => {
			set({visible: screen.height != initialScreenSize});
		});
	}

	return {...readable};
}
