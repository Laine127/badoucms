<?php

namespace bd;

use ba\Auth as BaAuth;
use Throwable;
use think\facade\Db;

/**
 * 权限规则类
 */
class Auth extends BaAuth
{
    /**
     * 获得权限规则原始数据
     * @param int $uid 用户id
     * @return array
     * @throws Throwable
     */
    public function getOriginAuthRules(int $uid): array
    {
        $ids = $this->getRuleIds($uid);
        if (empty($ids)) {
            return [];
        }

        $where   = [];
        $where[] = ['status', '=', '1'];
        // 如果没有 * 则只获取用户拥有的规则
        if (!in_array('*', $ids)) {
            $where[] = ['id', 'in', $ids];
        }
        $rules = Db::name($this->config['auth_rule'])
            ->withoutField(['remark', 'status', 'weigh', 'update_time', 'create_time'])
            ->where($where)
            ->order('weigh desc,id asc')
            ->select()
            ->toArray();
        $app_url = request()->root(true).'/';
        foreach ($rules as $key => $rule) {
            if ($rule['type'] == 'menu_dir') {
                $rules[$key]['type'] = 0;
            } elseif ($rule['type'] == 'menu') {
                $rules[$key]['type'] = 1;
            }
            if ($rule['menu_type'] == 'iframe') {
                $rules[$key]['openType'] = '_iframe';
            } elseif ($rule['menu_type'] == 'tab') {
                $rules[$key]['openType'] = '_component';
            }
            if (!empty($rule['keepalive'])) {
                $rules[$key]['keepalive'] = $rule['name'];
            }
            if (!empty($rule['href'])) {
                $rules[$key]['href'] = $app_url . $rule['href'].'?view=1';
            }
        }

        return $rules;
    }
}
