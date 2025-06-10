import ElementPlus from 'element-plus'
import FcDesigner from '@form-create/designer';
import {
	genFileId,
	ElMessage
} from 'element-plus'
import 'element-plus/dist/index.css'
import './utils/style/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import './utils/rem.js'
import {
	createApp
} from 'vue'
import store from './stores'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {
	httpRequest
} from '@/api/httpRequest.js'
import App from './App.vue'
import router from './router'
import {loadComponent} from './utils/utils.js'
import {useRouter} from 'vue-router'
import { setToken } from '@/utils/auth'


const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	app.component(key, component)
}
app.config.globalProperties.$echarts = echarts
app.config.globalProperties.$httpRequest = httpRequest
app.config.globalProperties.$loadComponent = loadComponent
app.config.globalProperties.$genFileId = genFileId
app.config.globalProperties.$message = ElMessage
app.config.globalProperties.$router = useRouter();
app.config.globalProperties.$setToken = setToken

app.use(ElementPlus, {
	locale: zhCn,
})
app.use(FcDesigner);
app.use(FcDesigner.formCreate);
app.use(store)
app.use(router)

app.mount('#app')