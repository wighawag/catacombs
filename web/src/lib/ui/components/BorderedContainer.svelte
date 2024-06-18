<div class={$$props.class}>
	<slot />
</div>

<style>
	div {
		width: 100%;
		height: 100%;
		--s: 10px; /* the size on the corner */
		--t: 2px; /* the thickness of the border */
		--g: 20px; /* the gap between the border and image */

		padding: calc(var(--g) + var(--t));
		outline: var(--t) solid #6f6e6e; /* the color here */
		outline-offset: calc(-1 * var(--t));
		mask:
			conic-gradient(at var(--s) var(--s), #0000 75%, #000 0) 0 0 / calc(100% - var(--s)) calc(100% - var(--s)),
			linear-gradient(#000 0 0) content-box;
		transition: 0.4s;
	}
</style>
