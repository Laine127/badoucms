(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global = global || self, global.BaUpload = factory());
})(this, function () {
    'use strict';

    // 模板字符串
    const template = `
        <div class="w100">
            <div class="ba-upload" :class="[
                type,
                attrs.disabled ? 'is-disabled' : '',
                hideImagePlusOnOverLimit && attrs.limit && fileList.length >= attrs.limit ? 'hide-image-plus' : ''
            ]">
                <div class="el-upload">
                    <template v-if="type == 'image' || type == 'images'">
                        <div v-if="!hideSelectFile" @click.stop="showSelectFile" class="ba-upload-select-image">
                            {{ t('utils.choice') }}
                        </div>
                        <i class="ba-upload-icon el-icon-plus" style="font-size: 30px; color: #c0c4cc;"></i>
                    </template>
                    <template v-else>
                        <button class="el-button el-button--primary" @click="handleClick">
                            <i class="el-icon-plus" style="color: #ffffff;"></i>
                            <span>{{ t('Upload') }}</span>
                        </button>
                        <button v-if="!hideSelectFile" class="el-button el-button--success" @click.stop="showSelectFile">
                            <i class="fa fa-th-list" style="font-size: 14px; color: #ffffff;"></i>
                            <span class="ml-6">{{ t('utils.choice') }}</span>
                        </button>
                    </template>
                </div>
                <ul class="el-upload-list">
                    <li v-for="file in fileList" :key="file.uid" class="el-upload-list__item">
                        <img v-if="file.url" :src="file.url" class="el-upload-list__item-thumbnail">
                        <span class="el-upload-list__item-name">{{ file.name }}</span>
                        <span class="el-upload-list__item-status-label">
                            <i class="el-icon-upload-success el-icon-check"></i>
                        </span>
                        <i class="el-icon-close" @click="handleRemove(file)"></i>
                        <i class="el-icon-zoom-in" @click="handlePreview(file)"></i>
                    </li>
                </ul>
            </div>
            <div v-if="preview.show" class="el-dialog__wrapper ba-upload-preview">
                <div class="el-dialog">
                    <div class="el-dialog__body">
                        <div class="ba-upload-preview-scroll ba-scroll-style">
                            <img :src="preview.url" class="ba-upload-preview-img" alt="">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 组件定义
    return {
        name: 'BaUpload',
        template: template,
        props: {
            type: {
                type: String,
                default: 'image'
            },
            data: {
                type: Object,
                default: () => ({})
            },
            modelValue: {
                type: [String, Array],
                default: () => []
            },
            returnFullUrl: {
                type: Boolean,
                default: false
            },
            hideSelectFile: {
                type: Boolean,
                default: false
            },
            forceLocal: {
                type: Boolean,
                default: false
            },
            hideImagePlusOnOverLimit: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                fileList: [],
                attrs: {},
                uploading: 0,
                preview: {
                    show: false,
                    url: ''
                },
                defaultReturnType: 'string'
            };
        },
        methods: {
            handleClick() {
                if (this.attrs.disabled) return;
                const input = document.createElement('input');
                input.type = 'file';
                if (this.type === 'images' || this.type === 'files') {
                    input.multiple = true;
                }
                input.accept = this.type.includes('image') ? 'image/*' : '';
                input.onchange = (e) => this.handleFileChange(e.target.files);
                input.click();
            },
            handleFileChange(files) {
                Array.from(files).forEach(file => {
                    const fileReader = new FileReader();
                    fileReader.onload = (e) => {
                        const fileObj = {
                            uid: this.generateUid(),
                            name: file.name,
                            url: e.target.result,
                            raw: file
                        };
                        this.fileList.push(fileObj);
                        this.handleUpload(fileObj);
                    };
                    fileReader.readAsDataURL(file);
                });
            },
            handleUpload(file) {
                const formData = new FormData();
                formData.append('file', file.raw);
                // 添加额外数据
                Object.keys(this.data).forEach(key => {
                    formData.append(key, this.data[key]);
                });

                this.uploading++;
                // 这里需要实现具体的上传逻辑
                // 示例：
                fetch('/upload', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => response.json())
                    .then(result => {
                        if (result.code === 1) {
                            file.serverUrl = result.data.file.url;
                            file.status = 'success';
                            this.$emit('update:modelValue', this.getAllUrls());
                        }
                    })
                    .catch(() => {
                        file.status = 'error';
                        const index = this.fileList.indexOf(file);
                        if (index > -1) this.fileList.splice(index, 1);
                    })
                    .finally(() => {
                        this.uploading--;
                    });
            },
            handleRemove(file) {
                const index = this.fileList.indexOf(file);
                if (index > -1) {
                    this.fileList.splice(index, 1);
                    this.$emit('update:modelValue', this.getAllUrls());
                }
            },
            handlePreview(file) {
                if (!file || !file.url) return;
                if (this.type === 'file' || this.type === 'files') {
                    window.open(this.getFullUrl(file.url));
                    return;
                }
                this.preview.show = true;
                this.preview.url = this.getFullUrl(file.url);
            },
            showSelectFile() {
                if (this.attrs.disabled) return;
                // 这里需要实现文件选择器的逻辑
            },
            generateUid() {
                return Math.random().toString(36).substring(2);
            },
            getFullUrl(url) {
                // 实现获取完整URL的逻辑
                return url;
            },
            getAllUrls() {
                const urls = this.fileList
                    .filter(file => file.serverUrl)
                    .map(file => this.returnFullUrl ? this.getFullUrl(file.serverUrl) : file.serverUrl);
                return this.defaultReturnType === 'string' ? urls.join(',') : urls;
            },
            t(key) {
                // 实现国际化翻译的逻辑
                const translations = {
                    'utils.choice': '选择',
                    'Upload': '上传'
                };
                return translations[key] || key;
            }
        },
        mounted() {
            // 初始化文件列表
            const urls = Array.isArray(this.modelValue) ? this.modelValue : this.modelValue.split(',');
            this.fileList = urls.map(url => ({
                uid: this.generateUid(),
                name: url.split('/').pop(),
                url: this.getFullUrl(url),
                serverUrl: url
            }));
        }
    };
});