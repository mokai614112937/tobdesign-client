/**
                   _ooOoo_
                  o8888888o
                  88" . "88
                  (| -_- |)
                  O\  =  /O
               ____/`---'\____
             .'  \\|     |//  `.
            /  \\|||  :  |||//  \
           /  _||||| -:- |||||-  \
           |   | \\\  -  /// |   |
           | \_|  ''\---/''  |   |
           \  .-\__  `-`  ___/-. /
         ___`. .'  /--.--\  `. . __
      ."" '<  `.___\_<|>_/___.'  >'"".
     | | :  `- \`.;`\ _ /`;.`/ - ` : | |
     \  \ `-.   \_ __\ /__ _/   .-` /  /
======`-.____`-.___\_____/___.-`____.-'======
                   `=---='

^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
           佛祖保佑       永无霸葛
           心外无法       法外无心
**/
import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'

window.axiosMock = window.axiosMock || new AxiosMockAdapter(axios, { delayResponse: 1000 })

// 路由设置
const routes = [{
  path: '/',
  redirect: '/platform/systemInfo'
},
{
  path: '/_samples',
  component: '_samples/index',
  children: [{
    path: '/_samples/vueditor',
    meta: { title: 'UEditor使用' },
    component: '_samples/vueditor'
  }]
},
{
  path: '/platform',
  meta: { title: '系统管理', icon: 'fa fa-wrench' },
  component: 'platform/index',
  children: [{
    path: '/platform/systemInfo',
    meta: {title: '系统信息', icon: 'fa fa-info-circle'},
    component: 'platform/systemInfo'
  }]
},
{
  path: '/*',
  component: 'error/notFound404'
}
]
window.routes = routes

export default routes
