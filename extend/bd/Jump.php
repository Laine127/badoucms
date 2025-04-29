<?php

namespace bd;

use think\Response;
use think\exception\HttpResponseException;

trait Jump
{
    /**
     * 操作成功跳转的快捷方法
     * @access protected
     * @param  mixed $msg 提示信息
     * @param  mixed $data 跳转的URL地址
     * @param  integer $code 返回code
     * @param  array $header 发送的Header信息
     * @return void
     */
    protected function success($msg = '', mixed $data = '', int $code = 1, ?string $type = null, array $header = [], array $options = [])
    {
        $result = $this->prepareResult($msg, $data, $code);

        // 把跳转模板的渲染下沉，这样在 response_send 行为里通过getData()获得的数据是一致性的格式
        if ($this->isView) {
            $type = 'view';
            $response = Response::create($this->app->config->get('jump.dispatch_success_tmpl'), $type)->assign($result)->header($header);
        } else {
            $type = 'json';
            $response = Response::create($result, $type)->header($header);
        }

        throw new HttpResponseException($response);
    }


    /**
     * 操作错误跳转的快捷方法
     * @access protected
     * @param  mixed $msg 提示信息
     * @param  mixed $data 跳转的URL地址
     * @param  mixed $code 状态码
     * @param string $type 返回数据格式
     * @param  integer $wait 跳转等待时间
     * @param  array $header 发送的Header信息
     * @return void
     */
    protected function error($msg = '', mixed $data = '', int $code = 0, ?string $type = null, array $header = [], array $options = [])
    {
        $result = $this->prepareResult($msg, $data, $code);

        if ($this->isView) {
            $type = 'view';
            $response = Response::create($this->app->config->get('jump.dispatch_error_tmpl'), $type)->assign($result)->header($header);
        } else {
            $response = Response::create($result, 'json')->header($header);
        }

        throw new HttpResponseException($response);
    }

    /**
     * 返回封装后的API数据到客户端
     * @access protected
     * @param  mixed $data 要返回的数据
     * @param  integer $code 返回的code
     * @param  mixed $msg 提示信息
     * @param  string $type 返回数据格式
     * @param  array $header 发送的Header信息
     * @return void
     */
    protected function result($data, $code = 0, $msg = '', $type = '', array $header = [])
    {
        $result = [
            'code' => $code,
            'msg' => $msg,
            'time' => time(),
            'data' => $data,
        ];

        $type = $type ?: $this->getResponseType();
        $response = Response::create($result, $type)->header($header);

        throw new HttpResponseException($response);
    }

    /**
     * URL重定向
     * @access protected
     * @param  string $url 跳转的URL表达式
     * @param  integer $code http code
     * @param  array $with 隐式传参
     * @return void
     */
    protected function redirect($url, $code = 302, $with = [])
    {

        $response = Response::create($url, 'redirect');

        $response->code($code)->with($with);

        throw new HttpResponseException($response);
    }

    /**
     * 准备通用响应数据
     */
    private function prepareResult($msg, &$url, $code)
    {
        $wait = 3;
        $data = []; // 初始化变量

        if (is_array($url)) {
            $data = $url;
            if (isset($data['url'])) {
                $url = $data['url'];
                unset($data['url']);
            }
            if (isset($data['wait'])) {
                $wait = $data['wait'];
                unset($data['wait']);
            }
        }

        if (is_null($url) && isset($_SERVER["HTTP_REFERER"])) {
            $url = $_SERVER["HTTP_REFERER"];
        } elseif ($url && is_string($url)) { // 增加类型检查
            $url = (strpos($url, '://') !== false || strpos($url, '/') === 0)
                ? $url
                : (string)$this->app->route->buildUrl($url);
        }

        return [
            'code' => $code,
            'msg' => $msg,
            'data' => $data, // 确保变量已定义
            'url' => $url,
            'tourl' => $url,
            'wait' => $wait,
        ];
    }
}
