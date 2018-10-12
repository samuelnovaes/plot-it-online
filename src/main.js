import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import colors from 'vuetify/es5/util/colors'
import 'vuetify/dist/vuetify.css'

Vue.use(Vuetify, {
	theme: {
		toolbar: colors.grey.darken2
	}
})

new Vue({
	el: '#app',
	render: h => h(App)
})
