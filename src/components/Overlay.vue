<template>
	<div class="overlay p-absolute w-100 h-100 pointer-events-none">
		<div class="pointer-events-all top-right pa-4">
			<slot></slot>
		</div>
	</div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.overlay {
	* {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: start;
	}
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
.bottom-right {
	bottom: 0;
	right: 0;
}
</style>
