import request from '@/utils/request'

// 封装请求方法
export function httpRequest(url, method, data, isNoToken, isUpload) {
	let urlArr = url.split('?')
	if (urlArr.length > 1) {
		const queryString = urlArr[1];
		const params = queryString.split('&');
		const paramObj = {};
		params.forEach(param => {
			const [key, value] = param.split('='); // 分割键和值
			paramObj[key] = value; // 存储到对象中
		});
		Object.assign(data, paramObj)
	}
	let headers = {
		'Content-Type': isUpload ? 'multipart/form-data;charset=utf-8' : 'application/json;charset=utf-8',
		isToken: !isNoToken
	}
	let requestData = {};
	if (method.toLowerCase() == 'get') {
		requestData.params = data
	} else {
		requestData.data = data
	}
	return request({
		url: '/do/' + urlArr[0],
		method,
		...requestData,
		headers
	})
}