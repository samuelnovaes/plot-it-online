<template>
	<v-app dark>
		<v-tabs fixed-tabs v-model="aba">
			<v-tab>Code</v-tab>
			<v-tab>Plot</v-tab>
		</v-tabs>
		<v-content>
			<div id="editor" ref="editor" v-show="aba == 0"></div>
			<div id="plot" ref="plot" v-show="aba == 1"></div>
		</v-content>
		<v-footer height="auto">
			<v-spacer></v-spacer>
			<v-tooltip top :disabled="!isEditor">
				<v-btn :color="isEditor ? 'primary' : 'secondary'" :disabled="!isEditor" slot="activator" icon @click="download">
					<v-icon>mdi-content-save</v-icon>
				</v-btn>
				<span>Save file (Ctrl + S)</span>
			</v-tooltip>
			<v-tooltip top :disabled="!isEditor">
				<v-btn :color="isEditor ? 'primary' : 'secondary'" :disabled="!isEditor" slot="activator" icon @click="upload">
					<v-icon>mdi-folder-open</v-icon>
				</v-btn>
				<span>Open file (Ctrl + O)</span>
			</v-tooltip>
			<v-tooltip top>
				<v-btn color="primary" slot="activator" icon @click="run">
					<v-icon>mdi-play</v-icon>
				</v-btn>
				<span>Run (Ctrl + Enter)</span>
			</v-tooltip>
			<v-spacer></v-spacer>
		</v-footer>
	</v-app>
</template>

<style scoped>
#editor,
#plot {
  width: 100%;
  height: 100%;
}
</style>


<script>
export default {
	data() {
		return {
			aba: 0,
			code: '',
			layout: {
				dragmode: 'pan',
				xaxis: {
					scaleanchor: 'y'
				}
			},
			options: {
				displayModeBar: true,
				scrollZoom: true,
				displaylogo: false
			},
			empty: true,
			editor: null
		}
	},
	mounted() {
		this.editor = ace.edit('editor', {
			theme: 'ace/theme/chrome',
			mode: 'ace/mode/javascript',
			fontSize: '14pt',
			showPrintMargin: false
		})
		this.editor.session.on('change', () => {
			this.code = this.editor.getValue()
		})
		window.onresize = () => {
			if (!this.empty) {
				Plotly.relayout('plot', {
					width: this.$refs.plot.offsetWidth,
					height: this.$refs.plot.offsetHeight
				})
			}
		}
		window.onkeydown = e => {
			if (e.ctrlKey) {
				if (e.key == 's' && this.isEditor) {
					this.download()
					e.preventDefault()
				}
				else if (e.key == 'o' && this.isEditor) {
					this.upload()
					e.preventDefault()
				}
				else if (e.key == 'Enter') {
					this.run()
					e.preventDefault()
				}
				else if (e.key == '=') {
					this.$refs.editor.style.fontSize = this.$refs.editor.style.fontSize.replace(/^([\d.]+)/, m => Math.round(m * 1.2))
					e.preventDefault()
				}
				else if (e.key == '-') {
					this.$refs.editor.style.fontSize = this.$refs.editor.style.fontSize.replace(/^([\d.]+)/, m => Math.round(m / 1.2))
					e.preventDefault()
				}
				else if (e.key == '0') {
					this.$refs.editor.style.fontSize = '14pt'
					e.preventDefault()
				}
			}
		}
	},
	methods: {
		run() {
			const _data = []
			const plot = chart => {
				_data.push(chart)
			}
			eval(`try{${this.code}}catch(e){console.error(e.stack)}`)
			if (this.aba == 1) {
				Plotly.newPlot('plot', _data, this.layout, this.options)
				this.empty = false
			}
		},
		download() {
			const a = document.createElement('a')
			const file = new Blob([this.code], { type: 'text/plain' })
			a.href = URL.createObjectURL(file)
			a.download = 'plot-it.js'
			a.click()
		},
		upload() {
			const input = document.createElement('input')
			input.type = 'file'

			input.onchange = () => {
				const reader = new FileReader()
				reader.onload = e => {
					this.editor.setValue(e.target.result)
				}
				reader.readAsText(input.files[0])
			}

			input.click()
		}
	},
	watch: {
		aba(v) {
			if (v == 1 && this.empty) {
				setTimeout(() => {
					Plotly.newPlot('plot', [], this.layout, this.options)
				})
			}
		}
	},
	computed: {
		isEditor() {
			return this.aba == 0 && this.editor
		}
	}
}
</script>
