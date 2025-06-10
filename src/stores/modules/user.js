import {
	defineStore
} from 'pinia'
import {
	getToken,
	setToken,
	removeToken
} from '@/utils/auth'
import {
	login,
	logout,
	getInfo,
	register
} from '@/api/login'
const useUserStore = defineStore(
	'user', {
		state: () => ({
			userId: '',
			phone: ''
		}),
		actions: {
			// 注册
			register(userInfo) {
				return new Promise((resolve, reject) => {
					register(userInfo).then(res => {
						let data = res.data;
						setToken(data.token)
						this.token = data.token
						resolve()
					}).catch(error => {
						reject(error)
					})
				})
			},
			// 登录
			login(userInfo) {
				return new Promise((resolve, reject) => {
					login(userInfo).then(res => {
						let data = res.data;
						setToken(data.token)
						this.token = data.token
						resolve()
					}).catch(error => {
						reject(error)
					})
				})
			},
			// 获取用户信息
			getInfo() {
				return new Promise((resolve, reject) => {
					getInfo(1).then(res => {
						const user = res.data
						resolve(res)
					}).catch(error => {
						reject(error)
					})
				})
			},
			// 退出系统
			logOut() {
				return new Promise((resolve, reject) => {
					logout(this.token).then(() => {
						this.token = ''
						this.roles = []
						this.permissions = []
						removeToken()
						resolve()
					}).catch(error => {
						reject(error)
					})
				})
			}
		}
	})

export default useUserStore