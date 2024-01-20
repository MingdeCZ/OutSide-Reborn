const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36";
var opts = {
  policy: $environment.params
};
var optsgpt = {
  policy: $environment.params,
  redirection: false
};
let result = {
    "title": "节点：" + $environment.params,
    "ChatGPT": "<b>GPT: </b>‼️",
    //"Google": "Google 定位：检测失败，请重试",
    "Netflix": "<b>NF: </b>⚠️",
    "Disney": "<b>Dᐩ: </b>❗️",
};
const message = {
  action: "get_policy_state",
  content: $environment.params
};

function flag(a) {
    return String.fromCodePoint(...a.toUpperCase().split("").map((char) => 127397 + char.charCodeAt()));
}

;(async() => {
    let [{region, status}] = await Promise.all([testDisneyPlus(), testNf(81280792), testChatGPT()]);
    //console.log("Netflix: " + result["Netflix"]);
    //console.log(`Disney+: region = ${region}, status = ${status}`);
    if (status == 2) {
        //console.log(1);
        result["Disney"] = "<b>Dᐩ: </b>🛵";
    } else if (status == 1){
        //console.log(2);
        result["Disney"] = "<b>Dᐩ: </b>" + flag(region);
        //console.log(result["Disney"]);
    } else if (status == 0) {
        //console.log(3);
        result["Disney"] = "<b>Dᐩ: </b>❌";
    } else if (status == -1) {
        result["Disney"] = "<b>Dᐩ: </b>⌛️";
    }
    let content = '<p style = "text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">' + "<br>" +  ([result["Netflix"], result["ChatGPT"], result["Disney"]]).join("｜") + "</font>" + "</p>";
    $configuration.sendMessage(message).then(resolve => {
        if (resolve.error) {
            //console.log(resolve.error);
            $done();
        }
        if (resolve.ret) {
            let output = JSON.stringify(resolve.ret[message.content])? JSON.stringify(resolve.ret[message.content]).replace(/\"|\[|\]/g, "").replace(/\,/g, " ➟ "): $environment.params;
            let content = '<p style = "text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">' + "<br>" +  ([result["Netflix"], result["ChatGPT"], result["Disney"]]).join("｜") + "</font>" + "</p>";
            //$notify(typeof(output),output);
            //console.log(output);
            $done({"title": result["title"], "htmlMessage": content});
        }
        //$done();
    }, reject => {
        // Normally will never happen.
        $done();
    });
    //$done({"title": result["title"], "htmlMessage": content});
})().finally(() => {
    $configuration.sendMessage(message).then(resolve => {
        if (resolve.error) {
            //console.log(resolve.error);
            $done();
        }
        if (resolve.ret) {
            let output = JSON.stringify(resolve.ret[message.content]) ? JSON.stringify(resolve.ret[message.content]).replace(/\"|\[|\]/g, "").replace(/\,/g, " ➟ "): $environment.params;
            let content = '<p style = "text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">' + "<br>" + ([result["Netflix"], result["ChatGPT"], result["Disney"]]).join("｜") + "</font>" + "</p>";
            //$notify(typeof(output), output);
            //console.log(output);
            $done({"title": result["title"], "htmlMessage": content});
        }
        //$done();
    }, reject => {
        // Normally will never happen.
        $done();
    });
    $done({"title": result["title"], "htmlMessage": '<p style = "text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">' + "----------------------<br><br>" + "🚥 检测异常" + "<br><br>----------------------<br>" + output + "</p>"});
});

function testChatGPT() {
    return new Promise((resolve, reject) => {
        $task.fetch({url: "https://chat.openai.com/", opts: optsgpt, timeout: 2800}).then(response => {
            //console.log("ChatGPT Main Test");
            if(JSON.stringify(response).indexOf("text/plain") == -1) {
                $task.fetch({url: "https://chat.openai.com/cdn-cgi/trace", opts: optsgpt, timeout: 2800}).then(response => {
                    //console.log("ChatGPT Region Test");
                    let region = response.body.split("loc=")[1].split("\n")[0];
                    //console.log("ChatGPT Region: " + region);
                    if (["T1","XX","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ","BS","BD","BB","BE","BZ","BJ","BT","BA","BW","BR","BG","BF","CV","CA","CL","CO","KM","CR","HR","CY","DK","DJ","DM","DO","EC","SV","EE","FJ","FI","FR","GA","GM","GE","DE","GH","GR","GD","GT","GN","GW","GY","HT","HN","HU","IS","IN","ID","IQ","IE","IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG","LV","LB","LS","LR","LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR","MU","MX","MC","MN","ME","MA","MZ","MM","NA","NR","NP","NL","NZ","NI","NE","NG","MK","NO","OM","PK","PW","PA","PG","PE","PH","PL","PT","QA","RO","RW","KN","LC","VC","WS","SM","ST","SN","RS","SC","SL","SG","SK","SI","SB","ZA","ES","LK","SR","SE","CH","TH","TG","TO","TT","TN","TR","TV","UG","AE","US","UY","VU","ZM","BO","BN","CG","CZ","VA","FM","MD","PS","KR","TW","TZ","TL","GB"].indexOf(region) != -1) {
                        result["ChatGPT"] = "<b>GPT: </b>" + flag(region);
                        //console.log("支持 ChatGPT");
                        resolve("支持 ChatGPT");
                        return;
                    } else {
                        result["ChatGPT"] = "<b>GPT: </b>⛔️";
                        //console.log("不支持 ChatGPT");
                        resolve("不支持 ChatGPT");
                        return;
                    }
                }, reason => {
                    //console.log("Check-Error: " + reason);
                    resolve("ChatGPT Failed");
                })
            } else {
                result["ChatGPT"] = "<b>GPT: </b>⛔️";
                //console.log("不支持 ChatGPT");
                resolve("不支持 ChatGPT");
            }
        }, reason => {
            //console.log("ChatGPT-Error: " + reason);
            resolve("ChatGPT Failed");
        });
    });
}

function testNf(filmId) {
    return new Promise((resolve, reject) => {
        $task.fetch({url: "https://www.netflix.com/title/" + filmId, opts: opts, timeout: 5200, headers: {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36"}}).then(response => {
            //$notify("nf: " + response.statusCode);
            //console.log("nf: " + response.statusCode);
            if (response.statusCode === 404) {
                result["Netflix"] = "<b>NF: </b>©️";
                //console.log("nf: " + result["Netflix"]);
                resolve("Not Found");
                return;
            } else if (response.statusCode === 403) {
                //console.log("nfnf");
                result["Netflix"] = "<b>NF: </b>🚫";
                //console.log("nf: " + result["Netflix"]);
                //$notify("nf: " + result["Netflix"]);
                resolve("Not Available");
                return;
            } else if (response.statusCode === 200) {
                let region =  response.headers["X-Originating-URL"].split("/")[3].split("-")[0];
                if (region == "title") {
                    region = "us";
                }
                //console.log("nf: " + region);
                result["Netflix"] = "<b>NF: </b>" + flag(region);
                //$notify("nf: " + result["Netflix"]);
                resolve("nf: " + result["Netflix"]);
                return;
            }
            resolve("Netflix Test Error");
        }, reason => {
            result["Netflix"] = "<b>NF: </b>⌛️";
            //console.log(result["Netflix"]);
            resolve("timeout");
        });
    });
}

function timeout(delay = 5000) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject("Timeout")
        }, delay)
    });
}

async function testDisneyPlus() {
    try {
        let {region, cnbl} = await Promise.race([testHomePage(), timeout(7000)])
        //console.log(`homepage: region=${region}, cnbl=${cnbl}`);
        let {countryCode, inSupportedLocation, accessToken} = await Promise.race([getLocationInfo(), timeout(7000)]);
        //console.log(`getLocationInfo: countryCode = ${countryCode},  inSupportedLocation = ${inSupportedLocation}`);
        region = countryCode ?? region;
        //console.log("region: " + region);
        // 即将登陆
        if (inSupportedLocation === false || inSupportedLocation === "false") {
            return {region, status: 2};
        } else {
            // 支持解锁
            return {region, status: 1};
        }
        //let support = await Promise.race([testPublicGraphqlAPI(accessToken),  timeout(7000)]);
        if (!await Promise.race([testPublicGraphqlAPI(accessToken), timeout(7000)])) {
            return {status: 0};
        }
        // 支持解锁
        return {region, status: 1};
    } catch (error) {
        //console.log("Error: " + error);
        // 不支持解锁
        if (error === "Not Available") {
            //console.log("不支持");
            return {status: 0};
        }
        // 检测超时
        if (error === "Timeout") {
            return {status: -1};
        }
        return {status: -2};
    }
}

function getLocationInfo() {
    return new Promise((resolve, reject) => {
        $task.fetch({url: "https://disney.api.edge.bamgrid.com/graph/v1/device/graphql", method: "POST", opts: opts, headers: {"Accept-Language": "en", "Authorization": "ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84", "Content-Type": "application/json", "User-Agent": UA}, body: JSON.stringify({query: "mutation registerDevice($input: RegisterDeviceInput!) {registerDevice(registerDevice: $input) {grant{grantType assertion}}}", variables: {input: {applicationRuntime: "chrome", attributes: {browserName: "chrome", browserVersion: "94.0.4606", manufacturer:  "apple", model: null, operatingSystem: "macintosh",  operatingSystemVersion: "10.15.7", osDeviceIds: []},  deviceFamily: "browser", deviceLanguage: "en", deviceProfile:  "macosx"}}})}).then(response => {
            let data = response.body;
            //console.log("locationinfo: " + response.statusCode);
            if (response.statusCode !== 200) {
                //console.log("getLocationInfo: " + data);
                reject("Not Available");
                return;
            } else {
                let {
                token: {accessToken},
                session: {inSupportedLocation, location: {countryCode}},
                } = JSON.parse(data)?.extensions?.sdk;
                resolve({inSupportedLocation, countryCode, accessToken});
            }
        }, reason => {
            reject("Error");
            return;
        });
    });
}

function testHomePage() {
    return new Promise((resolve, reject) => {
        $task.fetch({url: "https://www.disneyplus.com/", opts: opts, headers: {"Accept-Language": "en", "User-Agent": UA}}).then(response => {
            let data = response.body;
            //console.log("Disney+: homepage " + response.statusCode);
            if (response.statusCode !== 200 || data.indexOf("not available in your region") !== -1) {
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
                    //console.log("homepage: " + region + cnbl);
                    resolve({region, cnbl});
                }
            }
        }, reason => {
            reject("Error");
            return;
        });
    });
}

function testPublicGraphqlAPI(accessToken) {
    return new Promise((resolve, reject) => {
        $task.fetch({url: "https://disney.api.edge.bamgrid.com/v1/public/graphql", headers: {"Accept-Language": "en", Authorization: accessToken, "Content-Type": "application/json", "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36"}, body: JSON.stringify({query: "query($preferredLanguages: [String!]!, $version: String) {globalization(version: $version) {uiLanguage(preferredLanguages: $preferredLanguages)}}", variables: {version: "1.5.0", preferredLanguages: ["en"]}})}).then(response => {
            resolve(response.status === 200);
        }, reason => {
            reject("Error");
            return;
        });
    });
}
