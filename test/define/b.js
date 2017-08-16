define(['define/a'], function(a){
	console.info(a);
	return mini.extend({}, a, {
		b: 1
	})
})