<template>
  <div id="appointVaccine">
    <iframe
        id="geoPage"
        width="0"
        height="0"
        frameborder="0"
        style="display: none"
        scrolling="no"
        src="https://apis.map.qq.com/tools/geolocation?key=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77&referer=myapp"
    ></iframe>
    <van-nav-bar
      class="van-nav-bar"
      ref="nav_bar"
      :title="'核酸检测预约'"
      left-arrow
      :fixed="true"
      @click-left="$router.go(-1)"
    />
    <div :style="{marginTop: mTop}">当前定位：<span>{{position}}</span></div>
    <div class="appoint_container">
      <van-form :key='formKey' ref="userFormData" @submit="onSubmit">
        <van-field
          v-model="userForm.userName"
          name="姓名"
          label="姓名："
          placeholder="请输入姓名"
          :rules="[{ pattern: namePattern, message: '请输入正确的姓名' }]"
        />
        <van-field name="stepper" label="年龄：">
          <template #input>
            <van-stepper :min='18' v-model="userForm.age" />
          </template>
        </van-field>
        <van-field
          v-model="userForm.userId"
          name="身份证"
          label="身份证："
          placeholder="请输入身份证"
          :rules="[{ pattern: idPattern, required: true, message: '请输入正确的身份证' }]"
        />
        <van-field
          v-model="userForm.phone"
          name="手机号"
          label="手机号："
          placeholder="请输入手机号"
          :rules="[{ pattern: phonePattern, required: true, message: '请输入正确的手机号' }]"
        />
        <van-field name="radio" label="性别：">
          <template #input>
            <van-radio-group v-model="userForm.gender" direction="horizontal">
              <van-radio name="男">男</van-radio>
              <van-radio name="女">女</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field
          v-model="userForm.location"
          name="家庭住址"
          label="家庭住址："
          placeholder="请输入家庭住址"
          :rules="[{ required: true, message: '家庭住址不能为空' }]"
        />
        <van-field
          readonly
          clickable
          name="calendar"
          :value="userForm.calendar"
          label="预约日期："
          placeholder="选择预约接种日期"
          @click="showCalendar = true"
          :rules="[{ trigger: 'onChange',required: true, message: '预约接种日期不能为空' }]"
        />
        <van-field
          readonly
          clickable
          name="datetimePicker"
          :value="userForm.dateTime"
          label="预约时间："
          placeholder="选择预约接种时间"
          @click="showPicker = true"
          :rules="[{ trigger: 'onChange',required: true, message: '预约接种时间不能为空' }]"
        />
        <van-field
            readonly
            clickable
            name="picker"
            :value="$store.state.hospitalDetail"
            label="选择医院："
            placeholder="选择预约接种医院"
            @click="$router.push('./searchInstitution')"
        >
        </van-field>
        <van-field name="radio" label="是否有病史：">
          <template #input>
            <van-radio-group @change='radioChange' v-model="userForm.hasDisease" direction="horizontal">
              <van-radio name="无">无</van-radio>
              <van-radio name="有">有</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field
          v-if="testareaShow"
          v-model="userForm.message"
          rows="2"
          autosize
          label="病例史："
          type="textarea"
          maxlength="50"
          placeholder="请输入您的病例史"
          show-word-limit
        />
      </van-form>
      <div class="btn_box">
        <van-button @click="submitData" color="#1d99d3" plain>提交信息</van-button>
      </div>
    </div>
    <!-- 时间选择 -->
    <van-popup class="vaccinePopup" v-model="showPicker" position="bottom">
      <van-datetime-picker
        :min-hour="8"
        :max-hour="22"
        type="time"
        @confirm="onConfirmTime"
        @cancel="showPicker = false"
      />
    </van-popup>
    <!-- 日历 -->
    <van-calendar @confirm='confirmDate' :color="'#1d99d3'"  v-model="showCalendar" :min-date="minDate" :max-date="maxDate" />
    <!-- 城市选择 -->
    <city-list-sheet
      @selectCity="selectCity"
      ref="transferCitySheet"
    ></city-list-sheet>
  </div>
</template>


<script>
import "assets/css/vantCss/provinceDetail.css"; // 导入css样式
import "assets/css/vantCss/appointVaccine.css"
import cityListSheet from "components/private/cityListSheet"
import AMap from '@amap/amap-jsapi-loader';
import { Toast } from 'vant';
import {getNcpHospList} from "../../../network/toolsBox";

export default {
  name: 'appointVaccine',
  components: {
    cityListSheet
  },
  data() {
    return {
      mTop: 0,
      userForm: {  // 表单
        userName: '',
        phone: '',
        age: 18,
        userId: '',
        gender: '男',
        hospital:this.$store.state.hospitalDetail,
        hasDisease: '无',
        message: '',
        sms: '',
        calendar: '',
        dateTime: '',
        city: this.position
      },
      testareaShow: false,  // 文本域
      smsText: '发送验证码',  // 按钮文本
      disabledBtn: false,  // 是否禁用按钮
      time: 59,  // 时间
      timerFun: null,  // 定时器
      showCalendar: false,  // 显示/隐藏日历
      showPicker: false,  // 显示/隐藏时间
      minDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
      maxDate: new Date(new Date().getFullYear(), 11, 31),
      idPattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,  // 身份证正则
      phonePattern: /^[1][3,4,5,7,8,9][0-9]{9}$/,  // 手机号正则
      namePattern: /^[\u4E00-\u9FA5]{2,4}$/,  // 姓名正则
      formKey: 0,
      position: ''
    }
  },
  // created 中调用
  created() {
    console.log(this.$store.state.hospitalDetail,'ll')
    this.$store.state.hospitalDetail = ''
    // 此处为调用精确定位之后，调取ip定位，可根据实际情况改写
    // this.getLocation();
    this.tMap();
    // this.getNcpHospList()
  },
  mounted() {
    this.mTop = document.getElementsByClassName("van-nav-bar")[0].clientHeight + "px";
  },
  methods: {
    tMap() {
      window.addEventListener('message', (event) => {
        let loc = event.data;
        console.log(loc, 'loc')
        this.position = loc.city;
        this.userForm.city = this.position
        console.log(this.position)  // 显示你当前位置
      }, false);

    },
    onSubmit() {
    },

    radioChange(str) {
      if (str == '有') {
        this.testareaShow = true
      } else {
        this.testareaShow = false
      }
    },

    // intervalTime() {  // 验证码
    //   this.smsText = this.time + '秒后重新发送'
    //   if (this.time == 0) {
    //     this.disabledBtn = false
    //     this.smsText = '发送验证码'
    //     clearInterval(this.timerFun)
    //     return
    //   }
    //   this.time--
    //   this.smsText = this.time + '秒后重新发送'
    // },

    // sendSms() {  // 发送验证码
    //   this.disabledBtn = true
    //   this.smsText = this.time + '秒后重新发送'
    //   this.timerFun = setInterval(this.intervalTime, 1000);
    // },

    confirmDate(date) {  // 确定日期
      let dt = new Date(date)
      const y = dt.getFullYear();  // 获取年份
      const m = (dt.getMonth() + 1 + '').padStart(2, '0');  // 获取月份
      const d = (dt.getDate() + '').padStart(2, '0');  // 获取日期
      this.userForm.calendar = y + '-' + m + '-' + d
      this.showCalendar = false
    },

    onConfirmTime(time) {  // 确定时间
      this.showPicker = false
      this.userForm.dateTime = time
    },

    selectCity(name, id, result) {  // 选择城市
      let str = ''
      for (const item of result) {
        str += item.text
      }
      this.userForm.city = str
    },

    submitData() {  // 提交数据
      this.$refs.userFormData.validate().then(res => {  // 表单验证
        if (res == undefined) {
          Toast.success('信息提交成功');  // 提示
          for (const key in this.userForm) {  // 清除数据
            if (key != 'gender' && key != 'age' && key != 'hasDisease') {
              this.userForm[key] = ''
            } else {
              switch (key) {
                case 'gender':
                  this.userForm['gender'] = '男'
                  break;
                case 'age':
                  this.userForm['age'] = '18'
                  break;
                case 'hasDisease':
                  this.userForm['hasDisease'] = '无'
                  break;
                default:
                  break;
              }
            }
          }
          this.formKey++  // 刷新表单
          this.$router.push({
            path: '/ToolsBox',
          })
        }
      }, err => {
      })
    },
    components: {
      cityListSheet
    }
  },
}
</script>
<style scoped>
#appointVaccine{
  min-width: 100vw;
  min-height: 100vh;
  background-color: #fff;
  position: relative;
  z-index: 11;
  font-size: 12px;
}
.appoint_container {
  padding: 15px;
}
.btn_box {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}
.btn_box .van-button {
  color: #fff !important;
  border-radius: 8px;
  padding: 0 30px;
  background-color: var(--color);
  letter-spacing: 1px;
}
.timePopup {
  height: 50%;
}
</style>