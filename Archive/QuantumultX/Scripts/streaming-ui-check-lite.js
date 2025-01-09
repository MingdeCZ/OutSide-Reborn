var nodeName = $environment.params;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36";
var opts = {
  policy: nodeName
};
var optsgpt = {
  policy: nodeName,
  redirection: false
};
let result = {
    "title": "节点：" + nodeName,
    "ChatGPT": "<font color = #8A2BE2>GPT</font>",
    "Google": "<font color = #8A2BE2>G</font>",
    "Netflix": "<font color = #8A2BE2>NF</font>",
    "Disney": "<font color = #8A2BE2>Dᐩ</font>"
};
const message = {
  action: "get_policy_state",
  content: nodeName
};

function flag(a) {
    return String.fromCodePoint(...a.toUpperCase().split("").map((char) => 127397 + char.charCodeAt()));
}

function testGPT() {
    return new Promise((resolve, reject) => {
        $task.fetch({url: "https://chat.openai.com/", opts: optsgpt, timeout: 3000}).then(response => {
            if(JSON.stringify(response).indexOf("text/plain") == -1) {
                $task.fetch({url: "https://chat.openai.com/cdn-cgi/trace", opts: optsgpt, timeout: 3000}).then(response => {
                    let region = response.body.split("loc=")[1].split("\n")[0];
                    if (["T1","XX","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ","BS","BD","BB","BE","BZ","BJ","BT","BA","BW","BR","BG","BF","CV","CA","CL","CO","KM","CR","HR","CY","DK","DJ","DM","DO","EC","SV","EE","FJ","FI","FR","GA","GM","GE","DE","GH","GR","GD","GT","GN","GW","GY","HT","HN","HU","IS","IN","ID","IQ","IE","IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG","LV","LB","LS","LR","LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR","MU","MX","MC","MN","ME","MA","MZ","MM","NA","NR","NP","NL","NZ","NI","NE","NG","MK","NO","OM","PK","PW","PA","PG","PE","PH","PL","PT","QA","RO","RW","KN","LC","VC","WS","SM","ST","SN","RS","SC","SL","SG","SK","SI","SB","ZA","ES","LK","SR","SE","CH","TH","TG","TO","TT","TN","TR","TV","UG","AE","US","UY","VU","ZM","BO","BN","CG","CZ","VA","FM","MD","PS","KR","TW","TZ","TL","GB"].indexOf(region) != -1) {
                        result["ChatGPT"] = "GPT: " + flag(region);
                        resolve("ChatGPT 解锁");
                        return;
                    } else {
                        result["ChatGPT"] = "<font color = #DC143C>GPT</font>";
                        resolve("ChatGPT 无法解锁");
                        return;
                    }
                }, reason => {
                    resolve("ChatGPT 解锁检测失败");
                })
            } else {
                result["ChatGPT"] = "<font color = #DC143C>GPT</font>";
                resolve("ChatGPT 无法解锁");
            }
        }, reason => {
            resolve("ChatGPT 解锁无法检测");
        });
    });
}

function testGg() {
    return new Promise((resolve, reject) => {
        $task.fetch({url: "https://www.youtube.com/premium", opts: opts, timeout: 3000, headers: {"User-Agent": UA}}).then(response => {
            if (response.statusCode != 200) {
                result["Google"] = "<font color = #1E90FF>G</font>";
                resolve("Google 送中检测失败");
            } else {
                let data = response.body;
                if (data.indexOf("Premium is not available in your country") != -1) {
                    result["Google"] = "<font color = #FFD700>G</font>";
                    resolve("Google 已送中");
                } else if (data.indexOf("Premium is not available in your country") == -1) {
                    result["Google"] = "G";
                    resolve("Google 未送中");
                } else {
                    result["Google"] = "<font color = #1E90FF>G</font>";
                    resolve("Google 送中检测超时");
                }
            }
        }, reason => {
            reject("Google 送中无法检测");
        });
    });
}

function testNF() {
    return new Promise((resolve, reject) => {
        $task.fetch({url: "https://www.netflix.com/title/81280792", opts: opts, timeout: 5000, headers: {"User-Agent": UA}}).then(response => {
            if (response.statusCode === 404) {
                result["Netflix"] = "<font color = #FFD700>NF</font>";
                resolve("Netflix 仅支持自制剧集");
                return;
            } else if (response.statusCode === 403) {
                result["Netflix"] = "<font color = #DC143C>NF</font>";
                resolve("Netflix 无法解锁");
                return;
            } else if (response.statusCode === 200) {
                let region = response.headers["X-Originating-URL"].split("/")[3].split("-")[0];
                if (region == "title") {
                    region = "us";
                }
                result["Netflix"] = "NF: " + flag(region);
                resolve("Netflix 完全解锁");
                return;
            }
            result["Netflix"] = "<font color = #1E90FF>NF</font>";
            resolve("Netflix 解锁检测失败");
        }, reason => {
            resolve("Netflix 解锁无法检测");
        });
    });
}

function DSNYTO(delay = 5000) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject("Timeout")
        }, delay)
    });
}

async function testDSNY() {
    try {
        let {region, cnbl} = await Promise.race([testDSNYHP(), DSNYTO(7000)])
        let {countryCode, inSupportedLocation, accessToken} = await Promise.race([getDSNYLI(), DSNYTO(7000)]);
        region = countryCode ?? region;
        if (inSupportedLocation === false || inSupportedLocation === "false") {
            return {region, status: 2};
        } else {
            return {region, status: 1};
        }
        if (!(await Promise.race([testDSNYAPI(accessToken), DSNYTO(7000)]))) {
            return {status: 0};
        }
        return {region, status: 1};
    } catch (error) {
        if (error === "Not Available") {
            return {status: 0};
        }
        if (error === "Timeout") {
            return {status: -1};
        }
        return {status: -2};
    }
}

function getDSNYLI() {
    return new Promise((resolve, reject) => {
        $task.fetch({url: "https://disney.api.edge.bamgrid.com/graph/v1/device/graphql", method: "POST", opts: opts, headers: {"Accept-Language": "en", "Authorization": "ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84", "Content-Type": "application/json", "User-Agent": UA}, body: JSON.stringify({query: "mutation registerDevice($input: RegisterDeviceInput!) {registerDevice(registerDevice: $input) {grant{grantType assertion}}}", variables: {input: {applicationRuntime: "chrome", attributes: {browserName: "chrome", browserVersion: "94.0.4606", manufacturer: "apple", model: null, operatingSystem: "macintosh", operatingSystemVersion: "10.15.7", osDeviceIds: []}, deviceFamily: "browser", deviceLanguage: "en", deviceProfile:  "macosx"}}})}).then(response => {
            if (response.statusCode != 200) {
                reject("Not Available");
                return;
            } else {
                let {
                token: {accessToken},
                session: {inSupportedLocation, location: {countryCode}},
                } = JSON.parse(response.body)?.extensions?.sdk;
                resolve({inSupportedLocation, countryCode, accessToken});
            }
        }, reason => {
            reject("Error");
            return;
        });
    });
}

function testDSNYHP() {
    return new Promise((resolve, reject) => {
        $task.fetch({url: "https://www.disneyplus.com/", opts: opts, headers: {"Accept-Language": "en", "User-Agent": UA}}).then(response => {
            let data = response.body;
            if (response.statusCode != 200 || data.indexOf("not available in your region") != -1) {
                reject("Not Available");
                return;
            } else {
                let match = data.match(/Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/);
                if (!match) {
                    resolve({region: "", cnbl: ""});
                    return;
                } else {
                    let region = match[1];
                    let cnbl = match[2];
                    resolve({region, cnbl});
                }
            }
        }, reason => {
            reject("Error");
            return;
        });
    });
}

function testDSNYAPI(accessToken) {
    return new Promise((resolve, reject) => {
        $task.fetch({url: "https://disney.api.edge.bamgrid.com/v1/public/graphql", headers: {"Accept-Language": "en", "Authorization": accessToken, "Content-Type": "application/json", "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36"}, body: JSON.stringify({query: "query($preferredLanguages: [String!]!, $version: String) {globalization(version: $version) {uiLanguage(preferredLanguages: $preferredLanguages)}}", variables: {version: "1.5.0", preferredLanguages: ["en"]}})}).then(response => {
            resolve(response.status === 200);
        }, reason => {
            reject("Error");
            return;
        });
    });
}

;(async() => {
    let [{region, status}] = await Promise.all([testDSNY(), testGPT(), testGg(), testNF()]);
    if (status == 2) {
        result["Disney"] = "<font color = #FFD700>Dᐩ</font>: " + flag(region);
    } else if (status == 1){
        result["Disney"] = "<font color = #00CD66>Dᐩ</font>: " + flag(region);
    } else if (status == 0) {
        result["Disney"] = "<font color = #DC143C>Dᐩ</font>";
    } else if (status == -1) {
        result["Disney"] = "<font color = #1E90FF>Dᐩ</font>";
    }
    content = '<p style = "text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><br><b>' + ([result["ChatGPT"], result["Google"], result["Netflix"], result["Disney"]]).join("｜") + "</b></p>";
    $configuration.sendMessage(message).then(resolve => {
        if (resolve.error) {
            $done();
        }
        if (resolve.ret) {
            output = JSON.stringify(resolve.ret[message.content]) ? JSON.stringify(resolve.ret[message.content]).replace(/\"|\[|\]/g, "").replace(/\,/g, " ➟ "): $environment.params;
            let content = '<p style = "text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><br><b>' + ([result["ChatGPT"], result["Google"], result["Netflix"], result["Disney"]]).join("｜") + "</b></p>";
            $done({"title": result["title"], "htmlMessage": content});
        }
    }, reject => {
        $done();
    });
})().finally(() => {
    $configuration.sendMessage(message).then(resolve => {
        if (resolve.error) {
            $done();
        }
        if (resolve.ret) {
            output = JSON.stringify(resolve.ret[message.content]) ? JSON.stringify(resolve.ret[message.content]).replace(/\"|\[|\]/g, "").replace(/\,/g, " ➟ "): $environment.params;
            let content = '<p style = "text-align: center; font-family: -apple-system; font-size: large; font-weight: thin"><br><br><b>' + ([result["ChatGPT"], result["Google"], result["Netflix"], result["Disney"]]).join("｜") + "</b></p>";
            $done({"title": result["title"], "htmlMessage": content});
        }
    }, reject => {
        // Normally will never happen.
        $done();
    });
    $done({"title": result["title"], "htmlMessage": '<p style = "text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">----------------------<br><br>🚥 检测异常<br><br>----------------------<br>' + output + "</p>"});
});