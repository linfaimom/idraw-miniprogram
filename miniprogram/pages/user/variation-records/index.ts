// pages/user/variation/index.ts

type VariationRecord = {
  id: number,
  type: string,
  input: string,
  output: Array<string>
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    records: new Array<VariationRecord>(),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    let _this = this
    wx.request({
      url: getApp().globalData.backendUrl + "/api/images/records",
      data: {
        openId: getApp().globalData.openId,
        calledType: "VARIATION"
      },
      success(res: any) {
        console.log("variation records fetch: ", res.data)
        let result: Array<VariationRecord> = res.data.data
        result.forEach(r => {
          for (let index = 0; index < r.output.length; index++) {
            r.output[index] = getApp().globalData.backendUrl + "/api/images?fileName=" + r.output[index]
          }
        })
        _this.setData({
          records: result
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})