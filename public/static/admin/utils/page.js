(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
		typeof define === 'function' && define.amd ? define(['jquery'], factory) :
			(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Page = factory(global.jQuery));
}(this, (function ($) {
	'use strict';

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
			url: opt.url,
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
			$.ajax({
				url: options.href,
				type: 'get',
				data: {
					view: 1
				},
				dataType: 'html',
				success: function (data) {
					$frame.html(data);
				},
				error: function (xhr) {
					ElementPlus.ElMessage.error('页面加载失败！');
				}
			});
		}
		$frame.attr("type", options.type);
		$frame.attr("href", options.href);
	}

	/**
	 * 刷新页面
	 */
	Page.prototype.refresh = function (loading) {
		var $frameLoad = $(`#${this.option.elem} .pear-page-loading`);
		var $frame = $(`#${this.option.elem} .pear-page-content`);

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
			$.ajax({
				type: 'get',
				url: $frame.attr("href"),
				data: {
					view: 1,
				},
				dataType: 'html',
				success: function (data) {
					$frame.html(data);
					$frameLoad.fadeOut(1000);
				},
				error: function (xhr) {
					ElementPlus.ElMessage.error('页面加载失败！');
				}
			});
		}
	}

	function renderContent(option) {
		$(`#${option.elem}`).html(`
            <div class='pear-page'>
                <div class='pear-page-content' type='${option.type}' href='${option.url}'></div>
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

		var $frame = $(`#${option.elem}`).find(".pear-page-content");

		if (option.type === "_iframe") {
			$frame.html(`<iframe src='${option.url}' scrolling='auto' frameborder='0' allowfullscreen='true'></iframe>`);
		} else {
			$.ajax({
				url: option.url,
				type: 'get',
				data: {
					view: 1
				},
				dataType: 'html',
				success: function (data) {
					$frame.html(data);
				},
				error: function (xhr) {
					ElementPlus.ElMessage.error('页面加载失败！');
				}
			});
		}
	}

	return Page;
})));