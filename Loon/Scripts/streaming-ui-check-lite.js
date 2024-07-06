const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36';
var nodeName = $environment.params.node;
let result = {
    'title': '节点：' + nodeName,
    'ChatGPT': '<font color = #8A2BE2>GPT</font>',
    'Google': '<font color = #8A2BE2>G</font>',
    'Netflix': '<font color = #8A2BE2>NF</font>',
    'Disney': '<font color = #8A2BE2>Dᐩ</font>'
};

function flag(a) {
    return String.fromCodePoint(...a.toUpperCase().split('').map((char) => 127397 + char.charCodeAt()));
}

function testGPT() {
    return new Promise((resolve, reject) => {
        $httpClient.get({url: 'https://chat.openai.com', node: nodeName, timeout: 3000}, (errormsg, response, data) => {
            if (errormsg) {
                result['ChatGPT'] = '<font color = #8A2BE2>GPT</font>';
                resolve('ChatGPT 解锁无法检测');
                return;
            }
            if (JSON.stringify(data).indexOf('text/plain') == -1) {
                $httpClient.get({url: 'https://chat.openai.com/cdn-cgi/trace', node: nodeName, timeout: 3000}, (emsg, resheader, resData) => {
                    if (emsg) {
                        result['ChatGPT'] = '<font color = #1E90FF>GPT</font>';
                        resolve('ChatGPT 解锁检测失败');
                        return;
                    }
                    let region = resData.split('loc=')[1].split('\n')[0];
                    if (['T1','XX','AL','DZ','AD','AO','AG','AR','AM','AU','AT','AZ','BS','BD','BB','BE','BZ','BJ','BT','BA','BW','BR','BG','BF','CV','CA','CL','CO','KM','CR','HR','CY','DK','DJ','DM','DO','EC','SV','EE','FJ','FI','FR','GA','GM','GE','DE','GH','GR','GD','GT','GN','GW','GY','HT','HN','HU','IS','IN','ID','IQ','IE','IL','IT','JM','JP','JO','KZ','KE','KI','KW','KG','LV','LB','LS','LR','LI','LT','LU','MG','MW','MY','MV','ML','MT','MH','MR','MU','MX','MC','MN','ME','MA','MZ','MM','NA','NR','NP','NL','NZ','NI','NE','NG','MK','NO','OM','PK','PW','PA','PG','PE','PH','PL','PT','QA','RO','RW','KN','LC','VC','WS','SM','ST','SN','RS','SC','SL','SG','SK','SI','SB','ZA','ES','LK','SR','SE','CH','TH','TG','TO','TT','TN','TR','TV','UG','AE','US','UY','VU','ZM','BO','BN','CG','CZ','VA','FM','MD','PS','KR','TW','TZ','TL','GB'].indexOf(region) != -1) {
                        result['ChatGPT'] = 'GPT: ' + flag(region); // App 可能不行
                        resolve('ChatGPT 解锁');
                    } else {
                        result['ChatGPT'] = '<font color = #DC143C>GPT</font>'; // App 也许可行
                        resolve('ChatGPT 无法解锁');
                    }
                })
            } else {
                result['ChatGPT'] = '<font color = #DC143C>GPT</font>';
                resolve('ChatGPT 无法解锁');
            }
        });
    });
}

function testGg() {
    return new Promise((resolve, reject) => {
        $httpClient.get({url: 'https://www.youtube.com/premium', node: nodeName, timeout: 3000, headers: {'User-Agent': UA}}, (errormsg, response, data) => {
            if (errormsg) {
                result['Google'] = '<font color = #8A2BE2>G</font>';
                resolve('Google 送中无法检测');
                return;
            }
            if (response.status != 200) {
                result['Google'] = '<font color = #1E90FF>G</font>';
                resolve('Google 送中检测失败');
            } else {
                if (data.indexOf('Premium is not available in your country') != -1) {
                    result['Google'] = '<font color = #FFD700>G</font>';
                    resolve('Google 已送中');
                } else if (data.indexOf('Premium is not available in your country') == -1) {
                    result['Google'] = 'G';
                    resolve('Google 未送中');
                } else {
                    result['Google'] = '<font color = #1E90FF>G</font>';
                    resolve('Google 送中检测超时');
                }
            }
        });
    });
}

function testNF() {
    return new Promise((resolve, reject) => {        
        $httpClient.get({url: 'https://www.netflix.com/title/81280792', node: nodeName, timeout: 5000, headers: {'User-Agent': UA}}, (errormsg, response, data) => {
            if (errormsg) {
                result['Netflix'] = '<font color = #8A2BE2>NF</font>';
                resolve('Netflix 解锁无法检测');
                return;
            }
            if (response.status == 403) {
                result['Netflix'] = '<font color = #DC143C>NF</font>';
                resolve('Netflix 无法解锁');
            } else if (response.status == 404) {
                result['Netflix'] = '<font color = #FFD700>NF</font>';
                resolve('Netflix 仅支持自制剧集');
            } else if (response.status == 200) {
                let region = response.headers['X-Originating-URL'].split('/')[3].split('-')[0];
                if (region == 'title') {
                    region = 'us';
                }
                result['Netflix'] = 'NF: ' + flag(region);
                resolve('Netflix 完全解锁');
            } else {
                result['Netflix'] = '<font color = #1E90FF>NF</font>';
                resolve('Netflix 解锁检测失败');
            }
        });
    });
}

function getDSNYLI() {
    return new Promise((resolve, reject) => {
        $httpClient.post({url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql', node: nodeName, timeout: 5000, headers: {'Accept-Language': 'en', 'Authorization': 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84', 'Content-Type': 'application/json', 'User-Agent': UA}, body: JSON.stringify({query: 'mutation registerDevice($input: RegisterDeviceInput!) {registerDevice(registerDevice: $input) {grant{grantType assertion}}}', variables: {input: {applicationRuntime: 'chrome', attributes: {browserName: 'chrome', browserVersion: '94.0.4606', manufacturer: 'apple', model: null, operatingSystem: 'macintosh', operatingSystemVersion: '10.15.7', osDeviceIds: []}, deviceFamily: 'browser', deviceLanguage: 'en', deviceProfile: 'macosx'}}})}, (errormsg, response, data) => {
            if (errormsg) {
                result['Disney'] = '<font color = #8A2BE2>Dᐩ</font>';
                resolve('Disney 解锁无法检测');
                return;
            }
            if (response.status == 200) {
                let resData = JSON.parse(data);
                if (resData?.extensions?.sdk?.session != null) {
                    let {
                        inSupportedLocation,
                        location: {countryCode}
                    } = resData?.extensions?.sdk?.session;
                    if (inSupportedLocation == false) {
                        result['Disney'] = '<font color = #FFD700>Dᐩ</font>: ' + flag(countryCode);
                        resolve('Disney 即将解锁');
                    } else {
                        result['Disney'] = '<font color = #00CD66>Dᐩ</font>: ' + flag(countryCode);
                        resolve('Disney 完全解锁');
                    }
                } else {
                    result['Disney'] = '<font color = #DC143C>Dᐩ</font>';
                    resolve('Disney 无法解锁');
                }
            } else {
                result['Disney'] = '<font color = #1E90FF>Dᐩ</font>';
                resolve('Disney 解锁检测失败');
            }
        });
    });
}

Promise.all([testGPT(), testGg(), testNF(), getDSNYLI()]).then(value => {
    $done({'title': result['title'], 'htmlMessage': "<p style = 'text-align: center; font-family: -apple-system; font-size: large; font-weight: thin'><br><br><b>" + ([result['ChatGPT'], result['Google'], result['Netflix'], result['Disney']]).join('｜') + '</b><br></p>'});
}).catch (values => {
    $done({'title': result['title'], 'htmlMessage': "<p style = 'text-align: center; font-family: -apple-system; font-size: large; font-weight: thin'><br><br><b>" + ([result['ChatGPT'], result['Google'], result['Netflix'], result['Disney']]).join('｜') + '</b><br></p>'});
});