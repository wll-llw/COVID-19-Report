import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import 'lib-flexible/flexible' // 弹性布局

import {
  Swipe,
  SwipeItem
} from 'vant'; // 导入轮播图
import {
  NavBar
} from 'vant'; // 导航栏组件
import {
  Icon
} from 'vant'; // 图标组件
import {
  Sticky
} from 'vant'; // 粘性布局
import {
  Popup
} from 'vant'; // 弹出层
import { Cascader } from 'vant';
import { Dialog } from 'vant';  // 对话框
import { Form } from 'vant';  // 表单
import { Field } from 'vant';  // 表单
import { Calendar } from 'vant';  // 日历
import { ActionSheet } from 'vant';  // 活动面板
import { List } from 'vant';  // 下拉加载
import { Tab, Tabs } from 'vant';  // tab栏
import { Stepper } from 'vant';  // 步进器
import { RadioGroup, Radio } from 'vant';  // 单选框
import { Button } from 'vant';  // 按钮
import { DatetimePicker } from 'vant';
import AMap from "@amap/amap-jsapi-loader";

// 全局注册
Vue.use(Swipe);
Vue.use(SwipeItem);
Vue.use(NavBar);
Vue.use(Icon);
Vue.use(Sticky);
Vue.use(Popup);
Vue.use(Cascader);
Vue.use(Dialog);
Vue.use(Form);
Vue.use(Field);
Vue.use(Calendar);
Vue.use(ActionSheet);
Vue.use(List);
Vue.use(Tab);
Vue.use(Tabs);
Vue.use(Stepper);
Vue.use(Radio);
Vue.use(RadioGroup);
Vue.use(Button);
Vue.use(DatetimePicker);
Vue.use(AMap);

import ContentSplit from "components/private/contentSplit/index.js" // 引入分割线组件
Vue.use(ContentSplit)

import 'vant/lib/index.css' // 引入vantCss文件

import 'assets/css/base.css' // 导入全局样式
import 'assets/icon/common.css' // 导入全局字体图标

import * as echarts from 'echarts' // 导入echarts
Vue.prototype.$echarts = echarts


import 'static/js/china.js' // 导入china.js配合地图显示

Vue.config.productionTip = false

Vue.prototype.fGetChartFontSize = () => {
    // 获取像素比
    const dpr = window.devicePixelRatio;

    let fontSize = 14;
    if (dpr == 2) {
      fontSize = 19;
    } else if (dpr == 3) {
      fontSize = 30;
    } else if (dpr > 3) {
      fontSize = 30;
    }
    return fontSize;
  },

  Vue.filter('addCount', function (val) { // 设置数据显示方式
    if (val > 0) {
      return '较昨日+' + val
    } else if (val == 0) {
      return '较昨日无新增'
    } else {
      return '较昨日' + val
    }
  })

Vue.prototype.setUnitChar = (number, decimalDigit) => { // 设置单位
  decimalDigit = decimalDigit == null ? 2 : decimalDigit;
  var integer = Math.floor(number);
  var digit = getDigit(integer);
  // ['个', '十', '百', '千', '万', '十万', '百万', '千万']; 
  var unit = [];
  if (digit > 3) {
    var multiple = Math.floor(digit / 8);
    if (multiple >= 1) {
      var tmp = Math.round(integer / Math.pow(10, 8 * multiple));
      unit.push(addWan(tmp, number, 8 * multiple, decimalDigit));
      for (var i = 0; i < multiple; i++) {
        unit.push('亿');
      }
      return unit.join('');
    } else {
      return addWan(integer, number, 0, decimalDigit);
    }
  } else {
    return number;
  }
}

Vue.filter('setUnit', function (number, decimalDigit) { // 设置数据格式
  return Vue.prototype.setUnitChar(number, decimalDigit)
})

var addWan = function (integer, number, mutiple, decimalDigit) {
  var digit = getDigit(integer);
  if (digit > 3) {
    var remainder = digit % 8;
    if (remainder >= 5) { // ‘十万’、‘百万’、‘千万’显示为‘万’ 
      remainder = 4;
    }
    return Math.round(number / Math.pow(10, remainder + mutiple - decimalDigit)) / Math.pow(10, decimalDigit) + '万';
  } else {
    return Math.round(number / Math.pow(10, mutiple - decimalDigit)) / Math.pow(10, decimalDigit);
  }
}
var getDigit = function (integer) {
  var digit = -1;
  while (integer >= 1) {
    digit++;
    integer = integer / 10;
  }
  return digit;
}

Vue.prototype.$EventBus = new Vue() // 创建事件总线

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')