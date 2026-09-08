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

namespace app\index\controller\cms;

use app\index\model\cms\Area;
use app\index\model\cms\ContentSort;
use app\index\model\cms\Content;
use app\index\model\cms\Site;
use think\Response;

class Sitemap extends Base
{
    protected $noNeedLogin = ['*'];
    protected $model = null;

    public function index(): Response
    {
        $list = [];
        $sortModel = new ContentSort();
        $contentModel = new Content();
        $originalLanguage = get_frontend_lang();
        $areas = $this->getAreas($originalLanguage);

        // 先为每个已启用语言添加首页，再处理栏目和内容。
        foreach ($areas as $language => $area) {
            $language = (string)($area['acode'] ?? $language);
            if ($language !== '') {
                $list[] = $this->makeNode('', date('Y-m-d'), '1.00', 'always', $language, $area, true);
            }
        }

        foreach ($sortModel->getSortListAll() as $value) {
            $language = (string)($value['acode'] ?? '');
            if ($language === '' || !isset($areas[$language]) || $value['outlink']) {
                continue;
            }

            $area = $areas[$language];
            $list[] = $this->makeNode($value['link'], date('Y-m-d'), '0.80', 'daily', $language, $area);
            if ($value['type'] == 1) {
                continue;
            }

            $contents = $contentModel->getSortContent($value['scode'], $language);
            foreach ($contents as $value2) {
                if (!empty($value2['outlink'])) { // 外链
                    continue;
                }
                $list[] = $this->makeNode(
                    $value2['link'],
                    date('Y-m-d', strtotime($value2['date'])),
                    '0.60',
                    'daily',
                    $language,
                    $area
                );
            }
        }

        return response($list, 200, [], 'xml')->options([
            'root_node' => 'urlset',
            'item_node' => 'url',
            'root_attr' => ['xmlns' => 'http://www.sitemaps.org/schemas/sitemap/0.9'],
            'item_key'  => ''
        ]);
    }

    /**
     * 获取所有已启用的前台语言；没有区域配置时保留原有单语言行为。
     */
    protected function getAreas(string $originalLanguage): array
    {
        $areas = (new Area())->getList();
        if (!empty($areas)) {
            return $areas;
        }

        return [
            $originalLanguage => [
                'acode'      => $originalLanguage,
                'domain'     => '',
                'is_default' => $originalLanguage === get_default_lang() ? '1' : '0',
            ],
        ];
    }

    private function makeNode(
        string $link,
        string $date,
        string $priority = '0.60',
        string $changefreq = 'always',
        string $language = '',
        array $area = [],
        bool $root = false
    ): array {
        $url = $this->buildUrl($link, $language, $area, $root);

        return [
            'loc'        => htmlspecialchars($url, ENT_XML1 | ENT_QUOTES, 'UTF-8'),
            'lastmod'    => $date,
            'changefreq' => $changefreq,
            'priority'   => $priority,
        ];
    }

    /**
     * 按语言生成完整 URL：
     * - 配置了独立域名时使用该语言域名；
     * - 目录模式使用 /{语言}/；
     * - 非目录模式使用 ?lg={语言}。
     */
    protected function buildUrl(string $link, string $language, array $area = [], bool $root = false): string
    {
        $language = trim($language);
        $defaultLanguage = trim(get_default_lang());
        $areaDomain = trim((string)($area['domain'] ?? ''));
        $hasIndependentDomain = $areaDomain !== '';
        $domain = $this->getLanguageDomain($area);
        $urlRuleType = (int)get_sys_config('url_rule_type');

        if ($root) {
            if ($hasIndependentDomain || $language === '' || $language === $defaultLanguage) {
                return $domain;
            }

            if ($urlRuleType === 1) {
                return $domain . '/' . rawurlencode($language) . '/';
            }

            return $domain . '/?lg=' . rawurlencode($language);
        }

        $link = (string)$link;
        if ($link === '') {
            return $domain;
        }

        // bdurl() 在目录模式下已经添加了语言前缀。独立域名本身已完成语言识别，去掉该前缀。
        if ($hasIndependentDomain && $urlRuleType === 1 && $language !== '' && $language !== $defaultLanguage) {
            $prefix = '/' . preg_quote(rawurlencode($language), '#') . '(?=/|$)';
            $link = preg_replace('#^' . $prefix . '#', '', $link) ?: $link;
        }

        if (!$hasIndependentDomain && $urlRuleType !== 1 && $language !== '' && $language !== $defaultLanguage) {
            $separator = str_contains($link, '?') ? '&' : '?';
            $link .= $separator . 'lg=' . rawurlencode($language);
        }

        return $domain . '/' . ltrim($link, '/');
    }

    protected function getLanguageDomain(array $area = []): string
    {
        $domain = trim((string)($area['domain'] ?? ''));
        if ($domain === '') {
            return rtrim($this->request->domain(), '/');
        }

        if (!preg_match('/^https?:\/\//i', $domain)) {
            $domain = $this->request->scheme() . '://' . $domain;
        }

        return rtrim($domain, '/');
    }

    /**
     * 输出 llms.txt Markdown 索引。
     *
     * 无语言参数时输出所有启用语言的索引入口；指定 language 参数，或在配置了
     * 独立语言域名时访问时，输出该语言的站点、栏目和公开内容。
     */
    public function llms(): Response
    {
        $areas = $this->getAreas(get_frontend_lang());
        $language = trim((string) $this->request->param('language', ''));
        if ($language !== '') {
            if (!isset($areas[$language])) {
                return response('Not Found', 404, ['Content-Type' => 'text/plain; charset=UTF-8']);
            }
            return $this->plainTextResponse($this->llmsLanguage($language, $areas[$language]));
        }

        $domainLanguage = $this->domainLanguage($areas);
        if ($domainLanguage !== '') {
            return $this->plainTextResponse($this->llmsLanguage($domainLanguage, $areas[$domainLanguage]));
        }

        return $this->plainTextResponse($this->llmsIndex($areas));
    }

    private function llmsIndex(array $areas): string
    {
        $defaultLanguage = trim(get_default_lang());
        $defaultSite = (new Site())->getSiteDataByLanguage($defaultLanguage);
        $name = $this->plainText($defaultSite['sitetitle'] ?? '') ?: 'Website';
        $description = $this->plainText($defaultSite['sitedescription'] ?? '');
        $lines = ['# ' . $name];
        if ($description !== '') {
            $lines[] = '';
            $lines[] = '> ' . $description;
        }
        $lines[] = '';
        $lines[] = '## Languages';

        foreach ($areas as $language => $area) {
            $language = (string) ($area['acode'] ?? $language);
            if ($language === '') {
                continue;
            }
            $site = (new Site())->getSiteDataByLanguage($language);
            $label = $this->plainText($area['name'] ?? '') ?: $language;
            $summary = $this->plainText($site['sitedescription'] ?? '');
            $url = $this->llmsUrl($language, $area);
            $lines[] = '- [' . $label . '](' . $url . ')' . ($summary === '' ? '' : ': ' . $summary);
        }

        return implode("\n", $lines) . "\n";
    }

    private function llmsLanguage(string $language, array $area): string
    {
        $site = (new Site())->getSiteDataByLanguage($language);
        $name = $this->plainText($site['sitetitle'] ?? '') ?: 'Website';
        $description = $this->plainText($site['sitedescription'] ?? '');
        $lines = ['# ' . $name];
        if ($description !== '') {
            $lines[] = '';
            $lines[] = '> ' . $description;
        }

        $homeUrl = $this->buildUrl('', $language, $area, true);
        $lines[] = '';
        $lines[] = '## Website';
        $lines[] = '- [' . $name . '](' . $homeUrl . ')' . ($description === '' ? '' : ': ' . $description);

        $sortModel = new ContentSort();
        $contentModel = new Content();
        $sorts = $sortModel->getLlmsSortList($language);
        $sortLines = [];
        $contentLines = [];
        foreach ($sorts as $sort) {
            if (!empty($sort['outlink'])) {
                continue;
            }
            $sortName = $this->plainText($sort['name'] ?? '');
            $sortUrl = $this->buildUrl((string) ($sort['link'] ?? ''), $language, $area);
            if ($sortName !== '' && $sortUrl !== '') {
                $sortDescription = $this->plainText($sort['description'] ?? '');
                $sortLines[] = '- [' . $sortName . '](' . $sortUrl . ')' . ($sortDescription === '' ? '' : ': ' . $sortDescription);
            }
            if ((int) ($sort['type'] ?? 0) === 1) {
                continue;
            }

            foreach ($contentModel->getLlmsSortContent((string) $sort['scode'], $language) as $content) {
                if (!empty($content['outlink'])) {
                    continue;
                }
                $title = $this->plainText($content['title'] ?? '');
                $url = $this->buildUrl((string) ($content['link'] ?? ''), $language, $area);
                if ($title === '' || $url === '') {
                    continue;
                }
                $contentDescription = $this->plainText($content['description'] ?? '');
                $contentLines[] = '- [' . $title . '](' . $url . ')' . ($contentDescription === '' ? '' : ': ' . $contentDescription);
            }
        }

        if ($sortLines !== []) {
            $lines[] = '';
            $lines[] = '## Sections';
            array_push($lines, ...$sortLines);
        }
        if ($contentLines !== []) {
            $lines[] = '';
            $lines[] = '## Content';
            array_push($lines, ...$contentLines);
        }

        return implode("\n", $lines) . "\n";
    }

    private function llmsUrl(string $language, array $area): string
    {
        return $this->getLanguageDomain($area) . '/llms-' . rawurlencode($language) . '.txt';
    }

    private function domainLanguage(array $areas): string
    {
        $host = strtolower($this->request->host());
        foreach ($areas as $language => $area) {
            $domain = strtolower((string) ($area['domain'] ?? ''));
            $domain = preg_replace('#^https?://#', '', $domain) ?: '';
            $domain = rtrim($domain, '/');
            if ($domain !== '' && $domain === $host) {
                return (string) ($area['acode'] ?? $language);
            }
        }
        return '';
    }

    private function plainText($value): string
    {
        if (!is_scalar($value)) {
            return '';
        }
        $value = html_entity_decode(strip_tags((string) $value), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        return trim((string) preg_replace('/\s+/u', ' ', $value));
    }

    private function plainTextResponse(string $content): Response
    {
        return response($content, 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }

    // 文本格式
    public function txt(): void
    {
        header("Content-Type: text/plain");
        header("Content-Disposition: inline");

        $sortModel = new ContentSort();
        $contentModel = new Content();
        $originalLanguage = get_frontend_lang();
        $areas = $this->getAreas($originalLanguage);
        $str = '';

        foreach ($areas as $language => $area) {
            $language = (string)($area['acode'] ?? $language);
            if ($language !== '') {
                $str .= $this->buildUrl('', $language, $area, true) . PHP_EOL;
            }
        }

        foreach ($sortModel->getSortListAll() as $value) {
            $language = (string)($value['acode'] ?? '');
            if ($language === '' || !isset($areas[$language]) || $value['outlink']) {
                continue;
            }

            $area = $areas[$language];
            $str .= $this->buildUrl($value['link'], $language, $area) . PHP_EOL;
            if ($value['type'] == 1) {
                continue;
            }

            $contents = $contentModel->getSortContent($value['scode'], $language);
            foreach ($contents as $value2) {
                if (!empty($value2['outlink'])) { // 外链
                    continue;
                }
                $str .= $this->buildUrl($value2['link'], $language, $area) . PHP_EOL;
            }
        }

        echo $str;
        exit;
    }
}
