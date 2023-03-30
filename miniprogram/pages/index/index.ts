// index.ts
// 获取应用实例
const app = getApp<IAppOption>()

Page({
  data: {
    text: "",
    buttonLoading: false
  },
  onLoad() {
  },
  // 事件处理函数
  onTextChange(e: any) {
    this.setData({
      text: e.detail
    })
  },
  postToGenerate(e: any) {
    console.log(this.data.text)
    wx.request({
      url: "https://idraw.doulikeme4i10.cn/api/images/generations",
      method: "POST",
      data: {
        "user": "marcus",
        "n": 1,
        "size": "256x256",
        "prompt": this.data.text
      },
      success (res) {
        console.log(res.data)
      }
    })
  },
})
