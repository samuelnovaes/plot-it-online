<template>
	<v-app dark>
		<v-toolbar dense color="toolbar" dark tabs fixed app>
			<v-spacer></v-spacer>
			<v-btn icon :disabled="!isEditor" outline @click="download" title="Save (Ctrl + S)">
				<v-icon>mdi-content-save</v-icon>
			</v-btn>
			<v-btn icon :disabled="!isEditor" outline @click="upload" title="Open (Ctrl + O)">
				<v-icon>mdi-folder-open</v-icon>
			</v-btn>
			<v-btn icon outline @click="run" title="Run (Ctrl + Enter)">
				<v-icon>mdi-play</v-icon>
			</v-btn>
			<v-spacer></v-spacer>
			<v-tabs slot="extension" color="toolbar" fixed-tabs v-model="aba">
				<v-tab>Code</v-tab>
				<v-tab>Logs</v-tab>
				<v-tab>Plot</v-tab>
			</v-tabs>
		</v-toolbar>
		<v-content>
			<div id="editor" ref="editor" v-show="aba == 0"></div>
			<div v-show="aba == 1">
				<v-container>
					<v-alert :value="true" v-for="(log, i) in logs" :key="i" :type="log.type">
						<pre v-html="log.text"></pre>
					</v-alert>
				</v-container>
			</div>
			<div id="plot" ref="plot" v-show="aba == 2"></div>
		</v-content>
		<v-snackbar v-model="snackbar" color="error">
			An error has occurred
			<v-btn flat dark @click="seeLogs">See logs</v-btn>
		</v-snackbar>
		<a id="download" ref="download"></a>
	</v-app>
</template>

<style scoped>
#editor, #plot {
	width: 100%;
	height: 100%;
}
#download {
	display: none;
}
pre {
	word-break: break-all;
	white-space: normal;
}
</style>

<script>
export default {
	data() {
		return {
			aba: 0,
			code: '',
			data: [],
			logs: [],
			snackbar: false,
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
			theme: 'ace/theme/monokai',
			mode: 'ace/mode/javascript',
			fontSize: '14pt',
			showPrintMargin: false,
			tabSize: 4,
			useSoftTabs: false
		})
		this.editor.session.on('change', () => {
			this.code = this.editor.getValue()
		})
		window.onresize = () => {
			if (this.aba == 2) {
				Plotly.newPlot('plot', this.data, this.layout, this.options)
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
				else if (e.key == '=' && this.isEditor) {
					this.$refs.editor.style.fontSize = this.$refs.editor.style.fontSize.replace(/^([\d.]+)/, m => Math.round(m * 1.2))
					e.preventDefault()
				}
				else if (e.key == '-' && this.isEditor) {
					this.$refs.editor.style.fontSize = this.$refs.editor.style.fontSize.replace(/^([\d.]+)/, m => Math.round(m / 1.2))
					e.preventDefault()
				}
				else if (e.key == '0' && this.isEditor) {
					this.$refs.editor.style.fontSize = '14pt'
					e.preventDefault()
				}
			}
		}
		window.onerror = (err, file, line) => {
			console.error(`File <u>${file}</u>, Line <strong>${line}</strong><br>${err}`)
			this.snackbar = true
		}
		const log = (args, type) => {
			this.logs.push({
				text: args.map(arg => typeof arg == 'string' ? arg : JSON.stringify(arg)).join(' '),
				type
			})
		}
		console.log = (...args) => log(args, 'success')
		console.warn = (...args) => log(args, 'warning')
		console.info = (...args) => log(args, 'info')
		console.error = (...args) => log(args, 'error')
	},
	methods: {
		run() {
			this.logs = []
			this.data = []
			const plot = chart => {
				this.data.push(chart)
			}
			const range = (...args) => math.map(math.range(...args.map(x => math.bignumber(x))), x => math.number(x)).toArray()
			const file = new Blob([`window.run = function(plot, range){${this.code}};`], { type: 'application/javascript' })
			const url = URL.createObjectURL(file)
			const script = document.createElement('script')
			script.src = url
			document.body.appendChild(script)
			URL.revokeObjectURL(url)
			script.onload = () => {
				run(plot, range)
				if (this.aba == 2) {
					Plotly.newPlot('plot', this.data, this.layout, this.options)
					this.empty = false
				}
				document.body.removeChild(script)
			}
		},
		download() {
			const a = this.$refs.download
			const file = new Blob([this.code], { type: 'octet/stream' })
			const url = URL.createObjectURL(file)
			a.href = url
			a.download = 'plot-it.js'
			a.click()
			URL.revokeObjectURL(url)
		},
		upload() {
			const input = document.createElement('input')
			input.type = 'file'
			input.onchange = () => {
				const reader = new FileReader()
				reader.onload = e => {
					this.editor.setValue(e.target.result, 1)
				}
				reader.readAsText(input.files[0])
			}
			input.click()
		},
		seeLogs() {
			this.snackbar = false
			this.aba = 1
		}
	},
	watch: {
		aba(v) {
			if (v == 2) {
				this.$nextTick(() => {
					Plotly.newPlot('plot', this.data, this.layout, this.options)
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
