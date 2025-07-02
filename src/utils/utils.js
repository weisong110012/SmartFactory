import {
	loadModule
} from "vue3-sfc-loader";
import * as Vue from "vue";

import ElementPlus from 'element-plus'
import sass from 'sass.js';
import * as echarts from 'echarts'
import * as router from 'vue-router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import axios from 'axios'

// 封装远程加载
export async function loadComponent(url) {
	const options = {
		moduleCache: {
			vue: Vue,
			'element-plus': ElementPlus,
			echarts: echarts,
			"vue-router": router,
			'@element-plus/icons-vue': ElementPlusIconsVue,
			axios: axios
		},
		async getFile(url) {
			let urlArr=url.split('/');
			if(urlArr[0]=='http:' || urlArr[0]=='https:'){
				if(urlArr[1]!=''){
					urlArr.splice(1,0,'')
				}
			}
			const res = await fetch(urlArr.join('/'));
			const code = await res.text();
			urlArr.pop();
			let frontUrl=urlArr.join('/');
			const { processedCode, extractedImages } = processVueSfcImages(code, (url) => {
			  return `${frontUrl}/${url}`;
			});
			
			return processedCode;
		},
		// 编译样式的方法
		async processStyles(srcRaw, lang) {
			if (lang === 'scss' || lang === 'sass') {
				return new Promise((resolve, reject) => {
					// 使用sass.js编译SCSS
					sass.compile(srcRaw, {
						indentedSyntax: lang === 'sass'
					}, (result) => {
						if (result.status === 0) {
							const remCode = result.text.replace(/(\d+)px/g, (match,
								num) => {
								return `${num / 16}rem`; // 假设根字体大小为16px
							});
							resolve(remCode);
						} else {
							reject(new Error(`SCSS编译错误: ${result.formatted}`));
						}
					});
				});
			}
			return srcRaw.replace(/(\d+)px/g, (match,
				num) => {
				return `${num / 16}rem`; // 假设根字体大小为100px
			});
		},
		addStyle(textContent) {
			const style = Object.assign(document.createElement("style"), {
				textContent,
			});
			const ref = document.head.getElementsByTagName("style")[0] || null;
			document.head.insertBefore(style, ref);
		},
		
	};
	const code = loadModule(
		url,
		options
	);
	return code;
}

// 封装框架通用方法

function isRemoteUrl(url) {
  return /^https?:\/\//i.test(url.trim());
}


function processVueSfcImages(sfcCode, replacer) {
  const extractedImages = {
    original: [],
    replaced: [],
    skipped: []
  };
  
  // 1. 处理<template>部分
  sfcCode = sfcCode.replace(/(<template[^>]*>)([\s\S]*?)(<\/template>)/gi, (match, startTag, templateContent, endTag) => {
    templateContent = templateContent.replace(/(<img[^>]+src=")([^"]+\.(png|jpg|jpeg|gif|svg|webp))(")/gi, (m, p1, src, ext, p4) => {
      if (isRemoteUrl(src)) {
        extractedImages.skipped.push(src);
        return m;
      }
      
      const newSrc = replacer(src);
      extractedImages.original.push(src);
      extractedImages.replaced.push(newSrc);
      return `${p1}${newSrc}${p4}`;
    });
    
    // 替换:src绑定中的静态图片路径
    templateContent = templateContent.replace(/(:src="(['"]))([^'"]+\.(png|jpg|jpeg|gif|svg|webp))(\2")/gi, (m, p1, quote, src, ext, p5) => {
      if (isRemoteUrl(src)) {
        extractedImages.skipped.push(src);
        return m;
      }
      
      const newSrc = replacer(src);
      extractedImages.original.push(src);
      extractedImages.replaced.push(newSrc);
      return `${p1}${newSrc}${p5}`;
    });
    
    templateContent = templateContent.replace(/(style="[^"]*background-image:\s*url\(['"]?)([^'")]+\.(png|jpg|jpeg|gif|svg|webp))(['"]?\))/gi, (m, p1, src, p3) => {
      if (isRemoteUrl(src)) {
        extractedImages.skipped.push(src);
        return m;
      }
      
      const newSrc = replacer(src);
      extractedImages.original.push(src);
      extractedImages.replaced.push(newSrc);
      return `${p1}${newSrc}${p3}`;
    });
    
    return `${startTag}${templateContent}${endTag}`;
  });
  
  // 2. 处理<style>部分 - 最终修复版
  sfcCode = sfcCode.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi, (match, startTag, styleContent, endTag) => {
    // 替换background-image中的图片路径 - 更精确的正则
    styleContent = styleContent.replace(/(background-image:\s*url\(['"]?)([^'")]+?\.(png|jpg|jpeg|gif|svg|webp))(['"]?\))/gi, (m, p1, src, ext, p4) => {
      if (isRemoteUrl(src)) {
        extractedImages.skipped.push(src);
        return m;
      }
      
      const newSrc = replacer(src);
      extractedImages.original.push(src);
      extractedImages.replaced.push(newSrc);
      return `${p1}${newSrc}${p4}`;
    });
	
	
	// 替换background中的图片路径 - 新增
	styleContent = styleContent.replace(/(background:\s*)([^;]*url\(['"]?)([^'")]+?\.(png|jpg|jpeg|gif|svg|webp))(['"]?[^;]*)(;?)/gi, (m, p1, p2, src, p4, p5, p6) => {
	  if (isRemoteUrl(src)) {
		extractedImages.skipped.push(src);
		return m;
	  }
	  
	  const newSrc = replacer(src);
	  extractedImages.original.push(src);
	  extractedImages.replaced.push(newSrc);
	  return `${p1}${p2}${newSrc}${p5}${p6}`;
	});
    
    return `${startTag}${styleContent}${endTag}`;
  });
  
  // 3. 处理<script>部分（简化版）
  sfcCode = sfcCode.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/gi, (match, startTag, scriptContent, endTag) => {
    // 替换被引号包裹的图片路径（排除变量声明）
    scriptContent = scriptContent.replace(/(['"])([^'"\s]+?\.(png|jpg|jpeg|gif|svg|webp))\1/gi, (m, quote, src) => {
      // 排除变量声明中的路径
      const precedingText = scriptContent.substring(0, scriptContent.indexOf(m));
      if (precedingText.match(/\b(const|let|var)\s+[^=]*\s*=\s*['"]\s*[^'"]+\s*['"]/)) {
        return m;
      }
      
      if (isRemoteUrl(src)) {
        extractedImages.skipped.push(src);
        return m;
      }
      
      const newSrc = replacer(src);
      extractedImages.original.push(src);
      extractedImages.replaced.push(newSrc);
      return `${quote}${newSrc}${quote}`;
    });
    
    return `${startTag}${scriptContent}${endTag}`;
  });
  
  return {
    processedCode: sfcCode,
    extractedImages
  };
}