(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
		typeof define === 'function' && define.amd ? define(['jquery'], factory) :
			(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Page = factory(global.jQuery));
}(this, (function ($) {
	'use strict';

	/**
	 * 加载页面内容
	 * @param {string} url 请求地址
	 * @param {jQuery} $frame 页面容器
	 * @param {jQuery} [$frameLoad] 加载动画容器
	 */
	function loadPageContent(url, $frame, $frameLoad) {
		return $.ajax({
			url: url,
			type: 'get',
			dataType: 'html',
			success: function (data) {
				$frame.html(data);
				if ($frameLoad) {
					$frameLoad.fadeOut(1000);
				}
			},
			error: function (xhr) {
				ElementPlus.ElMessage.error('页面加载失败！');
			}
		});
	}

	var Page = function (opt) {
		// 确保 opt 存在且有默认值
		this.option = opt || {};
	};

	/**
	 * 创建页面
	 * @param {Object} opt 配置项
	 */
	Page.prototype.render = function (opt) {
		// 保存配置到实例
		this.option = {
			elem: opt.elem,
			url: opt.url + '?view=1',
			width: opt.width || "100%",
			height: opt.height || "100%",
			title: opt.title,
			type: opt.type || 'ajax'
		};

		renderContent(this.option);
		return this;  // 返回实例本身而不是新实例
	}

	/**
	 * 切换页面
	 */
	Page.prototype.changePage = function (options) {
		const $frame = $(`#${this.option.elem} .pear-page-content`);
		if (options.type === "_iframe") {
			$frame.html(`<iframe src='${options.href}' scrolling='auto' frameborder='0' allowfullscreen='true'></iframe>`);
		} else {
			loadPageContent(options.href, $frame);
		}
		$frame.attr("type", options.type);
		$frame.attr("href", options.href);
	};

	/**
	 * 刷新页面
	 */
	Page.prototype.refresh = function (loading) {
		const $frameLoad = $(`#${this.option.elem} .pear-page-loading`);
		const $frame = $(`#${this.option.elem} .pear-page-content`);

		if (loading) {
			$frameLoad.css({ display: 'block' });
		}

		if ($frame.attr("type") === "_iframe") {
			$frame.html(`<iframe src='${$frame.attr("href")}' scrolling='auto' frameborder='0' allowfullscreen='true'></iframe>`);
			const $contentFrame = $frame.find("iframe");
			$contentFrame.on("load", () => {
				$frameLoad.fadeOut(1000);
			});
		} else {
			loadPageContent($frame.attr("href"), $frame, $frameLoad);
		}
	};

	function renderContent(option) {
		$(`#${option.elem}`).html(`
            <div style='width:${option.width};'>
                <div class="main-content-warpper" style='width:${option.width};' type='${option.type}' href='${option.url}'></div>
                <div class="pear-page-loading">
                    <div class="ball-loader">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `);

		const $frame = $(`#${option.elem}`).find(".main-content-warpper");

		if (option.type === "_iframe") {
			$frame.html(`<iframe src='${option.url}' scrolling='auto' frameborder='0' allowfullscreen='true'style='width:${option.width};height:${option.height};'></iframe>`);
		} else {
			loadPageContent(option.url, $frame);
		}
	}

	return Page;
})));