import ContentSplit from './ContentSplit'
// import install from "vuex/dist/vuex.mjs";
const components={
	install(Vue){
		Vue.component('ContentSplit',ContentSplit)
  }
}
//判断
// if(typeof window !=='undefined' && window.Vue){
// 	install(window.Vue);
// }
 
export default components;