<template>
	<div class="overlay p-absolute w-100 h-100 pointer-events-none">
		<div class="pointer-events-all overlay-element top-left pa-4">
			<slot name="top-left" />
		</div>
		<div class="top p-absolute pa-4 w-100 d-flex align-center justify-center">
			<div class="p-relative">
				<slot name="top" />
			</div>
		</div>
		<div class="pointer-events-all overlay-element top-right pa-4">
			<slot name="top-right" />
		</div>
		<div class="pointer-events-all overlay-element bottom-left pa-4">
			<slot name="bottom-left" />
		</div>
		<div class="bottom p-absolute pa-4 w-100 d-flex align-center justify-center">
			<div class="pointer-events-all p-relative">
				<slot name="bottom" />
			</div>
		</div>
		<div class="pointer-events-all overlay-element bottom-right pa-4">
			<slot name="bottom-right" />
		</div>
	</div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.overlay {
	.overlay-element {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: start;
	}
}

.top {
	top: 0;
	left: 0;
}
.top-left {
	top: 0;
	left: 0;
}
.top-right {
	top: 0;
	right: 0;
}
.bottom-left {
	bottom: 0;
	left: 0;
}
.bottom {
	bottom: 0;
}
.bottom-right {
	bottom: 0;
	right: 0;
}
</style>
