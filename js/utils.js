/**
 * 参数定义
 */
// var BASE_URL = 'http://47.107.170.153:58778/api/'
var UPLOAD_URL = ''
var BASE_PORT = ':58778'

/**
 * 网络请求库
 */
function http(options) {
	// token 封装在请求头
	var token = window.localStorage.getItem('Token')
	options.headers = options.headers || {}
	options.headers['Content-Type'] = 'application/json'
	options.headers['Authorization'] = 'Bearer ' + token
	// 开启loading
	var loading = plus.nativeUI.showWaiting(null, {
		style: "black",
		color: "#FF0000",
		background: "rgba(0,0,0,0)",
		loading: {
			display: "inline"
		}
	})
	//取出host
	var host = window.localStorage.getItem('host')
	
	if(host === null || host === undefined || host === ''){
		loading.close()
		var webview = plus.webview.getWebviewById('login')
		if (webview) {
			mui.fire(webview, 'refresh')
			webview.show()
		} else {
			href('/pages/login.html', 'login')
		}
		return false
	}
	var _BASE_PORT = ''
	if (host.indexOf(':') === -1) {
		_BASE_PORT = BASE_PORT
	}
	var BASE_URL = 'http://' + host + _BASE_PORT + '/api/'
	console.log(BASE_URL + options.url)
	
	mui.ajax(BASE_URL + options.url, {
		data: options.method && options.method === 'get' ? Qs.stringify(options.params || {}) : JSON.stringify(options.params ||
			{}),
		dataType: 'json',
		type: options.method || 'post',
		timeout: 10000,
		headers: options.headers,
		// 成功处理
		success: function(res) {
			loading.close()
			if (res.ErrorInfo && res.ErrorInfo.Status) {
				if (options.that) {
					options.that.$message.error(res.ErrorInfo.Message || '请求失败')
				} else {
					console.log('错误地址: ' + BASE_URL + options.url)
					plus.nativeUI.toast(res.ErrorInfo.Message || '请求失败')
				}
				tips('error')
				return false
			}
			options.success(res)
		},
		// 异常处理
		error: function(xhr, type, errorThrown) {
			console.log(JSON.stringify(xhr))
			console.log(type)
			console.log(errorThrown)
			loading.close()
			if (errorThrown === 'Unauthorized') {
				var webview = plus.webview.getWebviewById('login')
				if (webview) {
					mui.fire(webview, 'refresh')
					webview.show()
				} else {
					href('/pages/login.html', 'login')
				}
				return false
			}
			if (plus.networkinfo.getCurrentType() === plus.networkinfo.CONNECTION_NONE) {
				if (options.that) {
					options.that.$message.error('网络异常，请检查网络设置！')
				} else {
					plus.nativeUI.toast('网络异常，请检查网络设置！')
				}
			} else {
				if (options.that) {
					options.that.$message.error(type)
				} else {
					plus.nativeUI.toast(type)
				}
			}
			tips('error')
			if (options.error) {
				options.error(xhr, type, errorThrown)
			}
		}
	})
}

/**
 * 路由跳转方法
 */
function href(url, id, extras) {
	//取出host
	// var host = window.localStorage.getItem('host')
	// if(host === null || host === undefined || host === ''){
	// 	// loading.close()
	// 	var webview = plus.webview.getWebviewById('login')
	// 	if (webview) {
	// 		mui.fire(webview, 'refresh')
	// 		webview.show()
	// 	} else {
	// 		href('/pages/login.html', 'login')
	// 	}
	// 	return false
	// }
	console.log(url,id,extras)
	mui.openWindow({
		url: url,
		id: id,
		extras: extras || {},
		createNew: false, //是否重复创建同样id的webview，默认为false:不重复创建，直接显示
		show: {
			autoShow: true //页面loaded事件发生后自动显示，默认为true
		},
		waiting: {
			autoShow: true, //自动显示等待框，默认为true
			title: 'loading...' //等待对话框上显示的提示内容
		}
	})
}
/**
 * 播放声音	
 */
function tips(type, noShock, noVoice) {
	var voice = {
		'success': '/voice/ringin.wav',
		'error': '/voice/error.wav',
		'warning': '/voice/warning.wav'
	}
	if (noVoice || !voice[type]) {
		return false
	}
	plus.audio.createPlayer(voice[type]).play()
	plus.device.vibrate()
}

/**
 * 比较版本大小，如果新版本nv大于旧版本ov则返回true，否则返回false
 * @param {String} ov
 * @param {String} nv
 * @return {Boolean} 
 */
function compareVersion(ov, nv) {
	if (!ov || !nv || ov == "" || nv == "") {
		return false;
	}
	var b = false,
		ova = ov.split(".", 4),
		nva = nv.split(".", 4);
	for (var i = 0; i < ova.length && i < nva.length; i++) {
		var so = ova[i],
			no = parseInt(so),
			sn = nva[i],
			nn = parseInt(sn);
		if (nn > no || sn.length > so.length) {
			return true;
		} else if (nn < no) {
			return false;
		}
	}
	if (nva.length > ova.length && 0 == nv.indexOf(ov)) {
		return true;
	}
}

function checkUpdater(context) {	
	plus.runtime.getProperty(plus.runtime.appid, function(inf) {
		var currentId = inf.version;
		var cur_url = 'PADUpgrade/GetMesPADUpgradeInfo?' + Date.parse(new Date())
		http({
			url: cur_url,
			method: 'get',
			params: {},
			success: function(res) {
				if (currentId != res.Result.Version) {
					context.showUpdate = true
					context.updateInfo.Note = (res.Result.Note || '').split('br&gt;')
					context.updateInfo.Title = res.Result.Title
					context.updateInfo.Version = res.Result.Version
				} else {
					context.showUpdate = false
					context.updateInfo = {}
				}
			}
		})
	})
}

// 开始下载任务
function createTask(downloadLink) {
	var downloadTask = plus.downloader.createDownload(downloadLink, {
		method: 'GET'
	})
	var downloadProgress = ''
	var w = plus.nativeUI.showWaiting("下载中，请等待..." + downloadProgress, {
		style: "black",
		color: "#FF0000",
		background: "rgba(0,0,0,0.5)",
		loading: {
			display: "inline"
		}
	});
	downloadTask.addEventListener('statechanged', function(task, status) {
		switch (task.state) {
			case 1:
				plus.nativeUI.toast('开始下载...')
				break;
			case 2:
				plus.nativeUI.toast('连接到服务器...')
				break;
			case 3:
				downloadProgress = task.downloadedSize + "/" + task.totalSize
				w.setTitle("下载中，请等待..." + downloadProgress);
				break;
			case 4:
				plus.io.resolveLocalFileSystemURL(task.filename, function(entry) {
					var packgePath = entry.toLocalURL()
					console.log('文件绝对地址： ' + packgePath)
					if (task.downloadedSize === task.totalSize) {
						w.close()
						installPackge(packgePath)
					}
				})
				break;
		}
	})
	downloadTask.start()
}

function installPackge(packgePath) {
	// 安装更新
	plus.runtime.install(packgePath, {
		force: true
	});
	// 保存更新记录到stroage，方便下次启动app时删除安装包
	window.localStorage.setItem('updated', {
		completed: true,
		packgePath: packgePath
	})
	// 判断是否为热更新（判断文件名中是否含有.wgt）
	if (packgePath.match(RegExp(/.wgt/))) {
		plus.nativeUI.alert('应用将重启以完成更新', function(e) {
			plus.runtime.restart();
		}, '提示')
	}
}
