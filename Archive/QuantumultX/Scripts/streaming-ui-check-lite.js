const nodeName = $environment.params, UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36';
let result = {
    ChatGPT: '<font color = #8A2BE2>GPT</font>',
    Google: '<font color = #8A2BE2>G</font>',
    Netflix: '<font color = #8A2BE2>NF</font>',
    Disney: '<font color = #8A2BE2>Dᐩ</font>'
};

function flag(a) {
    return String.fromCodePoint(...a.toUpperCase().split('').map((char) => 127397 + char.charCodeAt()));
}

function httpGet(url, headers = {}) {
    return new Promise((resolve, reject) => {
        $task.fetch({ url: url, opts: { policy: nodeName }, timeout: 5000, headers: headers }).then(response => {
            resolve(response);
        }, reason => {
            reject(reason);
        });
    });
}

async function testGPT() {
    let region = '🇺🇳';
    try {
        const locOtcm = await httpGet('https://chat.openai.com/cdn-cgi/trace');
        if (locOtcm.statusCode === 200) {
            for (let line of locOtcm.body.split('\n')) {
                if (line.startsWith('loc=')) {
                    const [, lcCd] = line.split('=');
                    region = `${flag(lcCd)}`;
                    break;
                }
            }
        }
    } catch (error) {
    }
    try {
        const unlkOtcm = await httpGet('https://api.openai.com/compliance/cookie_requirements', { 'User-Agent': UA });
        const data = unlkOtcm.body;
        if (data?.toLowerCase().includes('unsupported_country')) {
            result.ChatGPT = '<font color = #DC143C>GPT</font>';
            return 'ChatGPT 无法解锁';
        } else if (data && unlkOtcm.statusCode == 200) {
            result.ChatGPT = 'GPT: ' + region;
            return 'ChatGPT 解锁';
        } else {
            result.ChatGPT = '<font color = #1E90FF>GPT</font>';
            return 'ChatGPT 解锁检测结果有误';
        }
    } catch (error) {
        return 'ChatGPT 解锁检测失败';
    }
}

async function testGg() {
    try {
        const otcm = await httpGet('https://www.youtube.com/premium', { 'User-Agent': UA });
        if (otcm.statusCode != 200) {
            result.Google = '<font color = #1E90FF>G</font>';
            return 'Google 送中检测响应有误';
        } else {
            if (otcm.body.includes('Premium is not available in your country')) {
                result.Google = '<font color = #FFD700>G</font>';
                return 'Google 已送中';
            } else {
                result.Google = 'G';
                return 'Google 未送中';
            }
        }
    } catch (error) {
        return 'Google 送中检测失败';
    }
}

async function testNF() {
    try {
        const otcm = await httpGet('https://www.netflix.com/title/81280792', { 'User-Agent': UA });
        if (otcm.statusCode == 403) {
            result.Netflix = '<font color = #DC143C>NF</font>';
            return 'Netflix 无法解锁';
        } else if (otcm.statusCode == 404) {
            result.Netflix = '<font color = #FFD700>NF</font>';
            return 'Netflix 仅支持自制剧集';
        } else if (otcm.statusCode == 200) {
            let region = otcm.headers['X-Originating-URL'].split('/')[3].split('-')[0];
            if (region == 'title') {
                region = 'us';
            }
            result.Netflix = 'NF: ' + flag(region);
            return 'Netflix 完全解锁';
        } else {
            result.Netflix = '<font color = #1E90FF>NF</font>';
            return 'Netflix 解锁检测响应有误';
        }
    } catch (error) {
        return 'Netflix 解锁检测失败';
    }
}

async function testDSNY() {
    try {
        const headers = {
            'Accept-Language': 'en',
            Authorization: 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
            'Content-Type': 'application/json',
            'User-Agent': UA
        };
        const body = JSON.stringify({ query: 'mutation registerDevice($input: RegisterDeviceInput!) {registerDevice(registerDevice: $input) {grant{grantType assertion}}}', variables: { input: { applicationRuntime: 'chrome', attributes: { browserName: 'chrome', browserVersion: '94.0.4606', manufacturer: 'apple', model: null, operatingSystem: 'macintosh', operatingSystemVersion: '10.15.7', osDeviceIds: [] }, deviceFamily: 'browser', deviceLanguage: 'en', deviceProfile: 'macosx' } } });
        const otcm = await new Promise((resolve, reject) => {
            $task.fetch({ url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql', method: 'POST', opts: { policy: nodeName }, timeout: 5000, headers: headers, body: body }).then(response => {
                resolve(response);
            }, reason => {
                reject(reason);
            });
        });
        if (otcm.statusCode == 200) {
            const jsonDt = JSON.parse(otcm.body);
            if (jsonDt?.extensions?.sdk?.session != null) {
                const {
                    inSupportedLocation,
                    location: { countryCode }
                } = jsonDt?.extensions?.sdk?.session;
                if (inSupportedLocation == false) {
                    result.Disney = '<font color = #FFD700>Dᐩ</font>: ' + flag(countryCode);
                    return 'Disney⁺ 即将解锁';
                } else {
                    result.Disney = '<font color = #00CD66>Dᐩ</font>: ' + flag(countryCode);
                    return 'Disney⁺ 完全解锁';
                }
            } else {
                result.Disney = '<font color = #DC143C>Dᐩ</font>';
                return 'Disney⁺ 无法解锁';
            }
        } else {
            result.Disney = '<font color = #1E90FF>Dᐩ</font>';
            return 'Disney⁺ 解锁检测响应有误';
        }
    } catch (error) {
        return 'Disney⁺ 解锁检测失败';
    }
}

Promise.allSettled([testGPT(), testGg(), testNF(), testDSNY()]).finally(() => {
    $done({
        title: '节点：' + nodeName,
        htmlMessage: '<p style=\'text-align: center; font-family: -apple-system; font-size: large; font-weight: thin\'><br><br><b>' + [result.ChatGPT, result.Google, result.Netflix, result.Disney].join('｜') + '</b></p>'
    });
});