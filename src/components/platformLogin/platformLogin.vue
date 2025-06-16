<template>
	<div class="login-wrap">
		<div class="logo">
			<img :src="applicationData.logo" alt="" />
		</div>
		<div class="content-wrap">
			<div class="content">
				<div class="date">
					{{dateString}}
				</div>
				<div class="title-wrap">
					<div class="mian-title">
						{{FamousSayings.title}}
					</div>
					<div class="sub-tltle">
						{{FamousSayings.subTitle}}
					</div>
				</div>
			</div>
			<div class="content-form" v-if='type!="config"'>
				<component v-if="loadedComponent" :is="loadedComponent" :data='detailData'></component>
			</div>
			<div class="content-form" v-else>
				<el-button type="primary" @click="hanldeSelect">选择登录组件</el-button>
			</div>
		</div>
		<div class="footer">
			版权所有@数智工场2025 京公网安备 123456789号 |京ICP备234578号-3
		</div>
	</div>

	<el-dialog v-model="dialogVisible" title="选择登录组件" width="500" :before-close="handleClose">
		<template #footer>
			<el-form :model="detailData" label-width="80px">
				<el-form-item label="登录组件">
					<el-select v-model="detailData.componentId" placeholder="请选择" @change="handleSelect" clearable>
						<el-option v-for="item in opationList" :key="item.componentId" :label="item.name"
							:value="item.componentId" />
					</el-select>
				</el-form-item>

				<el-form-item :label="attr.title" v-for="attr in selectComponent.attributes">
					<el-input v-model="detailData[attr.parameter]"></el-input>
				</el-form-item>

			</el-form>
			<div class="dialog-footer">
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" @click="addConfig">
					确认
				</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<script setup>
	import {
		onMounted,
		reactive,
		ref,
		defineExpose,
		defineEmits,
		nextTick,
		getCurrentInstance,
		watch,
		defineAsyncComponent
	} from "vue";
	const bgImg = ref('./loginBg.png')
	const dateString = (new Date().getMonth() + 1) + '月' + (new Date().getDate());

	// 定义接受组件id等数据
	const {
		id,
		data,
		emitEvent,
		type
	} = defineProps(['id', 'emitEvent', 'data', 'type']);

	const {
		proxy
	} = getCurrentInstance();

	const loadedComponent = ref(null)

	let opationList = [{
		name: '登录组件',
		componentId: 122,
		vue: "http://192.168.1.110:8011/base/files/122/loginForm/loginForm.vue",
		"attributes": [{
				"parameter": "isOpen",
				"title": "新窗口",
				"type": "number"
			},
			{
				"parameter": "targetPath",
				"title": "跳转地址",
				"type": "string"
			}
		]
	}]

	const detailData = reactive({
		"componentId": "",
		"componentUrl": "http://192.168.1.110:8011/base/files/122/loginForm/loginForm.vue",
		"targetPath": "/home",
		"isOpen": 0
	})



	if (data) {
		Object.assign(detailData, JSON.parse(data.json))
	}
	if (id) {

	}

	loadedComponent.value = defineAsyncComponent(async () => {
		const code = await proxy.$loadComponent(
			detailData.componentUrl
		);
		return code;
	});


	const dialogVisible = ref(false)

	function addConfig() {
		proxy.$httpRequest('componentLibrary.editComponentInstance', 'post', {
			applicationId: 1,
			componentInstanceId: 1,
			json: JSON.stringify(detailData)
		}).then(res => {
			dialogVisible.value = false;
		})
	}

	function hanldeSelect() {
		dialogVisible.value = true;
	}

	const FamousSayings = reactive({
		subTitle: "",
		title: ""
	})

	proxy.$httpRequest('componentLibrary.getFamousSayings', 'get', {
		applicationId: 1
	}).then(res => {
		Object.assign(FamousSayings, res)
	})

	const applicationData = reactive({})
	proxy.$httpRequest('application.getApplicationById', 'get', {
		applicationId: 1
	}).then(res => {
		Object.assign(applicationData, res.data)
	})

	const selectComponent = reactive({});

	function handleSelect(v) {
		let select = opationList.filter(item => {
			return item.componentId == v
		})
		select[0].attributes.filter(item => {
			detailData[item.parameter] = ''
		})

		Object.assign(selectComponent, select[0])
	}
	// 设置初始数据
	function setData(attributes) {
		const {
			id,
			data,
			emitEvent
		} = attributes;
		if (data) {
			Object.assign(detailData, JSON.parse(data.json))
		}
		if (id) {

		}
	}

	defineExpose({
		setData
	})
</script>

<style scoped lang="scss">
	.login-wrap {
		position: absolute;
		inset: 0;
		background-size: 100% 100%;
		background: url('./loginBg.png');

		.logo {
			position: absolute;
			top: 43px;
			left: 59px;

			img {
				width: 334px;
				height: 91px;
			}
		}

		.content-wrap {
			position: absolute;
			top: 180px;
			left: 0;
			right: 0;
			display: flex;

			.content {
				width: 66%;
				align-self: flex-start;
				text-align: center;
				display: flex;
				flex-wrap: wrap;
				justify-content: center;

				.date {
					font-family: Arial, Arial;
					font-weight: normal;
					font-size: 100px;
					color: #333333;
					line-height: 115px;
					letter-spacing: 1px;
					font-style: normal;
					width: 100%;
				}

				.title-wrap {
					font-family: SourceHanSansCN, SourceHanSansCN;
					font-weight: 400;
					font-size: 32px;
					color: #333333;
					line-height: 50px;
					margin-top: 52px;
					text-align: right;
					padding-left: 32px;

					.mian-title {
						text-align: left;

						.titleInput {
							background: rgba(0, 0, 0, 0);
							border: 1px solid #009BFF;
							font-family: SourceHanSansCN, SourceHanSansCN;
							font-weight: 400;
							font-size: 32px;
							color: #333333;
							text-align: center;
							width: 240px;
							height: 50px;
							border-color: rgba(0, 0, 0, 0);

							&:focus {
								border: 1px solid #009BFF;
								outline: none;
							}
						}
					}

					.sub-tltle {
						margin-top: 27px;
					}
				}
			}

			.content-form {
				width: 460px;
				height: 556px;
				box-sizing: border-box;
			}
		}

		.footer {
			position: absolute;
			bottom: 41px;
			text-align: center;
			width: 100%;
			font-family: SourceHanSansCN, SourceHanSansCN;
			font-weight: 400;
			font-size: 14px;
			color: #666666;
			line-height: 21px;
			font-style: normal;
		}
	}
</style>