// index.ts
// 获取应用实例
const app = getApp<IAppOption>()

Page({
  data: {
    text: "",
    number: 2,
    size: "256x256",
    loading: false,
    images: []
  },
  onLoad() {
  },
  // 事件处理函数
  onTextChange(e: any) {
    this.setData({
      text: e.detail
    })
  },
  toggleLoading() {
    this.setData({
      loading: !this.data.loading
    })
  },
  postToGenerate(e: any) {
    if (this.data.text === null || this.data.text === "") {
      wx.showToast({
        title: '要输入文字哦～',
        icon: 'error',
        duration: 1000
      })
      return
    }
    this.toggleLoading()
    let _this = this
    wx.request({
      url: "https://idraw.doulikeme4i10.cn/api/images/generations",
      method: "POST",
      data: {
        "user": "marcus",
        "n": _this.data.number,
        "size": _this.data.size,
        "prompt": _this.data.text
      },
      success(res: any) {
        console.log(res.data)
        _this.setData({
          images: res.data.data
        })
      },
      fail(err) {
        console.log(err)
      },
      complete() {
        _this.toggleLoading()
      }
    })
  },
})
