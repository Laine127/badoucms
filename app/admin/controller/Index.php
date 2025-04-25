<?php

declare (strict_types=1);

namespace app\admin\controller;

use Throwable;
use ba\ClickCaptcha;
use think\facade\Config;
use think\facade\Validate;
use app\common\facade\Token;
use app\admin\model\AdminLog;
use app\common\controller\Backend;

class Index extends Backend
{
    protected array $noNeedLogin      = ['logout', 'login'];
    protected array $noNeedPermission = ['index'];

    /**
     * 后台初始化请求
     * @throws Throwable
     */
    public function index()
    {
        if (!$this->request->isAjax()) {
            return $this->view->fetch();
        }
        $adminInfo          = $this->auth->getInfo();
        $adminInfo['super'] = $this->auth->isSuperAdmin();
        unset($adminInfo['token'], $adminInfo['refresh_token']);

        $menus = $this->auth->getMenus();
        if (!$menus) {
            $this->error(__('No background menu, please contact super administrator!'));
        }
        $this->success('ok', '', ['menus' => $menus]);
    }

    /**
     * 管理员登录
     * @throws Throwable
     */
    public function login(): mixed
    {
        $url = $this->request->get('url', '', 'clean_xss');
        $url = $url ?: 'index/index';
        // 检查登录态
        if ($this->auth->isLogin()) {
            $this->success(__('You have already logged in. There is no need to log in again~'), $url);
        }
        $captchaSwitch = Config::get('buildadmin.admin_login_captcha');

        // 检查提交
        if ($this->request->isPost()) {
            $username = $this->request->post('username');
            $password = $this->request->post('password');
            $keep     = $this->request->post('keep');

            $rule = [
                'username|' . __('Username') => 'require|length:3,30',
                'password|' . __('Password') => 'require|regex:^(?!.*[&<>"\'\n\r]).{6,32}$',
            ];
            $data = [
                'username' => $username,
                'password' => $password,
            ];
            if ($captchaSwitch) {
                $rule['captchaId|' . __('CaptchaId')] = 'require';
                $rule['captchaInfo|' . __('Captcha')] = 'require';

                $data['captchaId']   = $this->request->post('captchaId');
                $data['captchaInfo'] = $this->request->post('captchaInfo');
            }
            $validate = Validate::rule($rule);
            if (!$validate->check($data)) {
                $this->error($validate->getError());
            }

            if ($captchaSwitch) {
                $captchaObj = new ClickCaptcha();
                if (!$captchaObj->check($data['captchaId'], $data['captchaInfo'])) {
                    $this->error(__('Captcha error'));
                }
            }

            AdminLog::instance()->setTitle(__('Login'));

            $res = $this->auth->login($username, $password, (bool)$keep);
            if ($res === true) {
                $this->success(__('Login succeeded!'), $url, [
                    'userInfo' => $this->auth->getInfo()
                ]);
            } else {
                $msg = $this->auth->getError();
                $msg = $msg ?: __('Incorrect user name or password!');
                $this->error($msg);
            }
        }

        // $this->success('', '', [
        //     'captcha' => $captchaSwitch
        // ]);

        $this->view->assign('title', __('Login'));
        return $this->view->fetch();
    }

    /**
     * 管理员注销
     * @return void
     */
    public function logout(): void
    {
        $refreshToken = $this->request->post('refreshToken', '');
        if ($refreshToken) {
            Token::delete((string)$refreshToken);
        }
        $this->auth->logout();
        $this->success('退出登录成功！', 'index/login');
    }
}
