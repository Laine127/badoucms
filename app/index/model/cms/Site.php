<?php

// +----------------------------------------------------------------------
// | BADOUCMS [ 八斗网站系统 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2024-2030 http://doc.ldcode.com.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: lande <939134342@qq.com>
// +----------------------------------------------------------------------

namespace app\index\model\cms;

use think\Model;
use badou\TableManager;

class Site extends Model
{
    protected $name = 'cms_site';

    public function getSiteData()
    {
        return $this->getSiteDataByLanguage(get_frontend_lang());
    }

    public function getSiteDataByLanguage(string $language): array
    {
        $language = trim($language);
        $info = $this->where('acode', $language)->cache('cms_site_' . $language, 3600 * 24, 'cms_cache')->find();
        $data = [];
        if (!$info) {
            $columns = TableManager::getTableColumns('cms_site', false, 'mysql');
            foreach ($columns as $key => $value) {
                $data['site'.$key] = '';
            }
            return $data;
        }
        $data = $info->toArray();
        foreach ($data as $key => $value) {
            $value = htmlspecialchars_decode_improve($value);
            $data['site'.$key] = $value;
        }
        return $data;
    }
}
