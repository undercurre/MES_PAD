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

