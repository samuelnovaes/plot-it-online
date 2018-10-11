'use strict';

var vm = new Vue({
	el: '#app',
	data: {
		aba: 0,
		code: '',
		data: [],
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
	},
	mounted: function mounted() {
		var _this = this;

		this.editor = ace.edit('editor', {
			theme: 'ace/theme/chrome',
			mode: 'ace/mode/javascript',
			fontSize: '14pt',
			showPrintMargin: false
		});
		this.editor.session.on('change', function () {
			_this.code = _this.editor.getValue();
		});
		window.onresize = function () {
			if (!_this.empty) {
				Plotly.relayout('plot', {
					width: _this.$refs.plot.offsetWidth,
					height: _this.$refs.plot.offsetHeight
				});
			}
		};
		window.onkeydown = function (e) {
			if (e.ctrlKey) {
				if (e.key == 's' && _this.isEditor) {
					_this.download();
					e.preventDefault();
				} else if (e.key == 'o' && _this.isEditor) {
					_this.upload();
					e.preventDefault();
				} else if (e.key == 'Enter' && _this.aba == 1) {
					_this.run();
					e.preventDefault();
				} else if (e.key == '=') {
					_this.$refs.editor.style.fontSize = _this.$refs.editor.style.fontSize.replace(/^([\d.]+)/, function (m) {
						return Math.round(m * 1.2);
					});
					e.preventDefault();
				} else if (e.key == '-') {
					_this.$refs.editor.style.fontSize = _this.$refs.editor.style.fontSize.replace(/^([\d.]+)/, function (m) {
						return Math.round(m / 1.2);
					});
					e.preventDefault();
				} else if (e.key == '0') {
					_this.$refs.editor.style.fontSize = '14pt';
					e.preventDefault();
				}
			}
		};
	},

	methods: {
		run: function run() {
			var _this2 = this;

			if (this.aba == 1) {
				this.data = [];
				var plot = function plot(chart) {
					_this2.data.push(chart);
				};
				eval('try{' + this.code + '}catch(e){console.error(e.stack)}');
				Plotly.newPlot('plot', this.data, this.layout, this.options);
				this.empty = false;
			}
		},
		download: function download() {
			var a = document.createElement('a');
			var file = new Blob([this.code], { type: 'text/plain' });
			a.href = URL.createObjectURL(file);
			a.download = 'plot-it.js';
			a.click();
		},
		upload: function upload() {
			var _this3 = this;

			var input = document.createElement('input');
			input.type = 'file';

			input.onchange = function () {
				var reader = new FileReader();
				reader.onload = function (e) {
					_this3.editor.setValue(e.target.result);
				};
				reader.readAsText(input.files[0]);
			};

			input.click();
		}
	},
	watch: {
		aba: function aba(v) {
			var _this4 = this;

			if (v == 1 && this.empty) {
				setTimeout(function () {
					Plotly.newPlot('plot', [], _this4.layout, _this4.options);
				});
			}
		}
	},
	computed: {
		isEditor: function isEditor() {
			return this.aba == 0 && this.editor;
		}
	}
});
