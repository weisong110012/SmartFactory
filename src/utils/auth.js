import Cookies from 'js-cookie'
import {
	httpRequest
} from '@/api/httpRequest.js'

const TokenKey = 'Admin-Token'
const refreshTokenKey = 'Admin-refresh-Token'
const userInfoKey = 'Admin-user-info'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}


export function getRefreshToken() {
  return Cookies.get(refreshTokenKey)
}

export function setRefreshToken(token) {
  return Cookies.set(refreshTokenKey, token)
}

export function removeRefreshToken() {
  return Cookies.remove(refreshTokenKey)
}

export function getUserInfo(){
	return  JSON.parse(Cookies.get(userInfoKey))
}

export function setUserInfo(info){
	setToken(info.token)
	setRefreshToken(info.refreshToken)
	return Cookies.set(userInfoKey,JSON.stringify(info))
}

export function refreshUserInfo(){
	let refreshToken=getRefreshToken();
	let userInfo=getUserInfo()
	
	return httpRequest('user.refreshToken','post',{"username":userInfo.username,refreshToken},true).then(res=>{
		setUserInfo(res)
	})
}


export function removeUserInfo() {
	removeToken()
	removeRefreshToken()
  return Cookies.remove(userInfoKey)
}