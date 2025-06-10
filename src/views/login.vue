<template>
	<div>
		<component :type='query.type' v-if="loadedComponent" :is="loadedComponent" :data='loginData'></component>
		<!-- 登录布局开发示例 -->
		<!-- <platformLogin :type='query.type' v-if="loadedComponent" :is="loadedComponent" :data='loginData'></platformLogin> -->
	</div>
</template>

<script setup>
	//登录布局开发示例
	// import platformLogin from "@/components/platformLogin/platformLogin.vue";
	
	import {ref,reactive,getCurrentInstance,defineProps,defineAsyncComponent} from "vue";
	const {
		proxy
	} = getCurrentInstance();
	import {
		useRouter,
		useRoute
	} from 'vue-router'
	const route = useRoute();
	let query = route.query;
	const loginData=reactive({})
	const loadedComponent=ref(null)
	proxy.$httpRequest('componentLibrary.getComponentByAppId','get',{applicationId:1}).then(res=>{
		Object.assign(loginData,res.data);
		loadedComponent.value = defineAsyncComponent(async () => {
			const code = await proxy.$loadComponent(
				res.data.vueFile
			);
			return code;
		});
	})
</script>

<style scoped lang="scss">
	
</style>