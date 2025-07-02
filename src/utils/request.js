import axios from 'axios'
import {
	ElNotification,
	ElMessageBox,
	ElMessage,
	ElLoading
} from 'element-plus'
import {
	getToken,
	refreshUserInfo,
	getRefreshToken
} from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import {
	tansParams
} from "@/utils/tongyong";




axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'

// 创建axios实例
const service = axios.create({
	// axios中请求配置有baseURL选项，表示请求URL公共部分
	baseURL: import.meta.env.VITE_APP_BASE_API,
	// 超时
	timeout: 10000
})

// request拦截器
service.interceptors.request.use(config => {
	// 是否需要设置 token
	const isToken = (config.headers || {}).isToken === false
	// 是否需要防止数据重复提交
	const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
	if (getToken() && !isToken) {
		config.headers['Authorization'] = 'Bearer ' + getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
	}
	// get请求映射params参数
	if (config.method === 'get' && config.params) {
		let url = config.url + '?' + tansParams(config.params);
		url = url.slice(0, -1);
		config.params = {};
		config.url = url;
	}
	if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
		const requestObj = {
			url: config.url,
			data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
			time: new Date().getTime()
		}
		const requestSize = Object.keys(JSON.stringify(requestObj)).length; // 请求数据大小
		const limitSize = 5 * 1024 * 1024; // 限制存放数据5M
		if (requestSize >= limitSize) {
			console.warn(`[${config.url}]: ` + '请求数据大小超出允许的5M限制，无法进行防重复提交验证。')
			return config;
		}
	}
	return config
}, error => {
	console.log(error)
	Promise.reject(error)
})


let isRefreshing = false;
let requests = [];
// 响应拦截器
service.interceptors.response.use(res => {
		// 未设置状态码则默认成功状态
		const code = res.status || 200;
		// 获取错误信息
		const msg = errorCode[code] || res.data.error || errorCode['default']
		// 二进制数据则直接返回
		if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
			return res.data
		}
		if (code === 401) {

		} else if (code === 500) {
			ElMessage({
				message: msg,
				type: 'error'
			})
			return Promise.reject(new Error(msg))
		} else if (code >= 400) {
			ElNotification.error({
				title: msg
			})
			return Promise.reject('error')
		} else {
			return Promise.resolve(res.data)
		}

	},
	async error => {
		const originalRequest = error.config;


		let {
			message
		} = error;
		let code = ''
		if (message == "Network Error") {
			message = "后端接口连接异常";
		} else if (message.includes("timeout")) {
			message = "系统接口请求超时";
		} else if (message.includes("Request failed with status code")) {
			code = message.substr(message.length - 3);
			message = "系统接口" + message.substr(message.length - 3) + "异常";
		}
		if (code == 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			if (!isRefreshing) {
				isRefreshing = true;
				if (getRefreshToken()) {
					await refreshUserInfo() 
					let newAccessToken=getToken()
					requests.forEach(cb => cb(newAccessToken));
					requests = [];
					originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
					return service(originalRequest);
				} else {
					window.location.href = '/';
					return Promise.reject(error);
				}
			} else {
				return new Promise(resolve => {
					requests.push((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`;
						resolve(service(originalRequest));
					});
				});
			}
			return Promise.reject(error)
		} else {
			let msg = errorCode[code] || errorCode['default']
			ElMessage({
				message: msg,
				type: 'error',
				duration: 5 * 1000
			})
			return Promise.reject(error)
		}

	}
)

export default service