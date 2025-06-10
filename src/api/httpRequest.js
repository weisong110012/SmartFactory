import request from '@/utils/request'

// 封装请求方法
export function httpRequest(url, method, data, isUpload) {
	let headers = {
		"X-API": url,
		'Content-Type': isUpload?'multipart/form-data;charset=utf-8':'application/json;charset=utf-8'
	}
	return request({
		url: '/do',
		method,
		data,
		params: data,
		headers
	})
}
