<script lang="ts">
	import {currentFlow} from './';
	import Modal from '$utils/ui/modals/Modal.svelte';

	let flowState = $derived($currentFlow?.state);
	let currentStepIndex = $derived($currentFlow?.currentStepIndex);

	let currentStep =
		$derived($currentFlow && $currentStepIndex != undefined && $currentStepIndex < $currentFlow.steps.length
			? $currentFlow.steps[$currentStepIndex]
			: undefined);
	let action = $derived(currentStep ? currentStep.action : 'done');

	function cancel() {
		currentFlow.cancel();
	}

	async function execute() {
		if ($currentStepIndex != undefined && currentStep) {
			const {newState, nextStep} = await currentStep.execute($flowState);
			$flowState = newState;
			if (nextStep) {
				$currentStepIndex = nextStep;
			} else {
				$currentStepIndex++;
			}
			if ($currentFlow) {
				// TODO recursive
				const newStep = $currentFlow.steps[$currentStepIndex];
				if (newStep && !newStep.action) {
					const {newState, nextStep} = await newStep.execute($currentFlow.state);
					$flowState = newState;
					if (nextStep) {
						$currentStepIndex = nextStep;
					} else {
						$currentStepIndex++;
					}
				}
			}
		} else {
			currentFlow.cancel();
		}
	}
</script>

{#if $currentFlow && $currentStepIndex !== undefined && $flowState}
	<Modal oncancel={() => cancel()}>
		<div class="wrapper-top">
			{#if currentStep}
				<div class="title">
					{currentStep.title}
				</div>
				{#if currentStep.component}
					<currentStep.component state={flowState} />
				{:else}
					<p class="description">{currentStep.description}</p>
				{/if}
			{:else}
				<p>{$currentFlow.completionMessage ? $currentFlow.completionMessage : 'Steps Completed'}</p>
			{/if}
		</div>

		<div class="wrapper-bottom">
			{#if !currentStep || currentStep.action}
				<div class="actions">
					{#if currentStep}
						<button onclick={() => cancel()}>Back</button>
					{/if}
					{#if !currentStep || !currentStep.end}
						<button class="primary" onclick={() => execute()}>{action}</button>
					{/if}
				</div>
			{:else}
				<p>Please wait...</p>
			{/if}
		</div>
	</Modal>
{/if}

<style>
	.wrapper-top {
		height: calc(100% - 48px);
		display: flex;
		flex-direction: column;
		justify-content: start;

		width: 100%;
		overflow: auto;
	}
	.wrapper-bottom {
		display: flex;
		flex-direction: column;
		justify-content: end;
		height: 48px;

		width: 100%;
	}
	.title {
		font-weight: bold;
		font-size: clamp(1rem, 4vw, 1.25rem);
		margin-bottom: 2rem;
	}

	.description {
		margin-bottom: 1rem;
	}
</style>
