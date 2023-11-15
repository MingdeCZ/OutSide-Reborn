const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'

// 即将登陆
const STATUS_COMING = 2
// 支持解锁
const STATUS_AVAILABLE = 1
// 不支持解锁
const STATUS_NOT_AVAILABLE = 0
// 检测超时
const STATUS_TIMEOUT = -1
// 检测异常
const STATUS_ERROR = -2

var opts = {
  policy: $environment.params
};

var opts1 = {
  policy: $environment.params,
  redirection: false
};

function flag(s) {
    return String['fromCodePoint'](...s['toUpperCase']()['split']('')['map'](u => 0x1f1a5 + u['charCodeAt']()));
}

let result = {
  "title": '      📺  服务解锁检测',
  "YouTube": '<b>YouTube：</b>检测失败，请重试 😳',
  "Netflix": '<b>Netflix：</b>检测失败，请重试 😡',
  "Disney": "<b>Disneyᐩ：</b>检测失败，请重试 🤥",
  "ChatGPT" : "<b>ChatGPT：</b>检测失败，请重试 🤷‍♂️"
  //"Google": "Google 定位：检测失败，请重试"

}

const message = {
  action: "get_policy_state",
  content: $environment.params
};

;(async () => {
  testYTB()
  let [{ region, status }] = await Promise.all([testDisneyPlus(),testNf(81280792),testChatGPT()])
  console.log("NetFlix Result:"+result["Netflix"])
  console.log(`testDisneyPlus: region=${region}, status=${status}`)
  if (status==STATUS_COMING) {
    //console.log(1)
    result["Disney"] = "<b>Disneyᐩ：</b> 即将登陆" + ' ➟ ⟦' + flag(region) + "⟧ 😣"
  } else if (status==STATUS_AVAILABLE){
    //console.log(2)
    result["Disney"] = "<b>Disneyᐩ：</b> 支持" + ' ➟ ⟦' + flag(region) + "⟧ ✌️"
    console.log(result["Disney"])
  } else if (status==STATUS_NOT_AVAILABLE) {
    //console.log(3)
    result["Disney"] = "<b>Disneyᐩ：</b> 未支持 😭"
  } else if (status==STATUS_TIMEOUT) {
    result["Disney"] = "<b>Disneyᐩ：</b> 检测超时 🤦"
  }

  let content = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">` + "------------------------------" + "</br>" + ([result["YouTube"],result["Netflix"],result["Disney"],result["ChatGPT"]]).join("</br></br>") + "</br>------------------------------</br>" + "<font color=#CD5C5C >" + "<b>节点</b> ➟ " + $environment.params + "</font>" + `</p>`

$configuration.sendMessage(message).then(resolve => {
    if (resolve.error) {
      console.log(resolve.error);
      $done()
    }
    if (resolve.ret) {
      let output=JSON.stringify(resolve.ret[message.content])? JSON.stringify(resolve.ret[message.content]).replace(/\"|\[|\]/g,"").replace(/\,/g," ➟ ") : $environment.params
      let content = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">` + "--------------------------------------</br>" + ([result["Disney"],result["ChatGPT"],result["Netflix"],result["YouTube"]]).join("</br></br>") + "</br>--------------------------------------</br>" + "<font color=#CD5C5C>" + "<b>节点</b> ➟ " + output + "</font>" + `</p>`
      //$notify(typeof(output),output)
      console.log(output);
      $done({"title":result["title"],"htmlMessage":content}) 
    }
    //$done();|
  }, reject => {
    // Normally will never happen.
    $done();
  });  
  //$done({"title":result["title"],"htmlMessage":content})
})()
.finally(() => {
$configuration.sendMessage(message).then(resolve => {
    if (resolve.error) {
      console.log(resolve.error);
      $done()
    }
    if (resolve.ret) {
      let output=JSON.stringify(resolve.ret[message.content])? JSON.stringify(resolve.ret[message.content]).replace(/\"|\[|\]/g,"").replace(/\,/g," ➟ ") : $environment.params
      let content = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">` + "--------------------------------------</br>" +  ([result["Disney"],result["ChatGPT"],result["Netflix"],result["YouTube"]]).join("</br></br>") + "</br>--------------------------------------</br>" + "<font color=#CD5C5C>" + "<b>节点</b> ➟ " + output + "</font>" + `</p>`
      //$notify(typeof(output),output)
      console.log(output);
      $done({"title":result["title"],"htmlMessage":content})
    }
    //$done();|
  }, reject => {
    // Normally will never happen.
    $done();
  }); 
  
    $done({"title":result["title"],"htmlMessage":`<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">`+'----------------------</br></br>'+"🚥 检测异常"+'</br></br>----------------------</br>'+ output + `</p>`})
}
  );


async function testDisneyPlus() {
  try {
    let { region, cnbl } = await Promise.race([testHomePage(), timeout(7000)])
    console.log(`homepage: region=${region}, cnbl=${cnbl}`)

    let { countryCode, inSupportedLocation, accessToken } = await Promise.race([getLocationInfo(), timeout(7000)])
    console.log(`getLocationInfo: countryCode=${countryCode}, inSupportedLocation=${inSupportedLocation}`)
    
    region = countryCode ?? region
    console.log( "region:"+region)
    // 即将登陆
    if (inSupportedLocation === false || inSupportedLocation === 'false') {
      return { region, status: STATUS_COMING }
    } else {
      // 支持解锁
      return { region, status: STATUS_AVAILABLE }
    }

   let support = await Promise.race([testPublicGraphqlAPI(accessToken), timeout(7000)])
      if (!support) {
      return { status: STATUS_NOT_AVAILABLE }
    }
    // 支持解锁
    return { region, status: STATUS_AVAILABLE }
    
  } catch (error) {
    console.log("error:"+error)
    
    // 不支持解锁
    if (error === 'Not Available') {
      console.log("不支持")
      return { status: STATUS_NOT_AVAILABLE }
    }
    
    // 检测超时
    if (error === 'Timeout') {
      return { status: STATUS_TIMEOUT }
    }
    
    return { status: STATUS_ERROR }
  } 
}

function getLocationInfo() {
  return new Promise((resolve, reject) => {
    let opts0 = {
      url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql',
      method: "POST",
      opts: opts,
      headers: {
        'Accept-Language': 'en',
        "Authorization": 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
        'Content-Type': 'application/json',
        'User-Agent': UA,
      },
      body: JSON.stringify({
        query: 'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }',
        variables: {
          input: {
            applicationRuntime: 'chrome',
            attributes: {
              browserName: 'chrome',
              browserVersion: '94.0.4606',
              manufacturer: 'apple',
              model: null,
              operatingSystem: 'macintosh',
              operatingSystemVersion: '10.15.7',
              osDeviceIds: [],
            },
            deviceFamily: 'browser',
            deviceLanguage: 'en',
            deviceProfile: 'macosx',
          },
        },
      }),
    }
    
    $task.fetch(opts0).then(response => {
      let data = response.body
      console.log("locationinfo:"+response.statusCode)
      if (response.statusCode !== 200) {
        console.log('getLocationInfo: ' + data)
        reject('Not Available')
        return
      } else {
        let {
          token: { accessToken },
          session: {
            inSupportedLocation,
            location: { countryCode },
      },
      } = JSON.parse(data)?.extensions?.sdk
        resolve({ inSupportedLocation, countryCode, accessToken })
      }
    }, reason => {
      reject('Error')
      return
    })
  })
}

function testHomePage() {
  return new Promise((resolve, reject) => {
    let opts0 = {
      url: 'https://www.disneyplus.com/',
      opts: opts,
      headers: {
        'Accept-Language': 'en',
        'User-Agent': UA,
      },
    }
    $task.fetch(opts0).then(response => {
      let data = response.body
      console.log("DisneyPlus: homepage"+response.statusCode)
      if (response.statusCode !== 200 || data.indexOf('not available in your region') !== -1) {
        reject('Not Available')
        return
      } else {
        let match = data.match(/Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/)
        if (!match) {
          resolve({ region: '', cnbl: '' })
          return
        } else {
          let region = match[1]
          let cnbl = match[2]
          //console.log("homepage"+region+cnbl)
          resolve({ region, cnbl })
        }
      }
    }, reason => {
      reject('Error')
      return
    })
  })
}

function testPublicGraphqlAPI(accessToken) {
  return new Promise((resolve, reject) => {
    let opts = {
      url: 'https://disney.api.edge.bamgrid.com/v1/public/graphql',
      headers: {
        'Accept-Language': 'en',
        Authorization: accessToken,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36',
      },
      body: JSON.stringify({
        query:
          'query($preferredLanguages: [String!]!, $version: String) {globalization(version: $version) { uiLanguage(preferredLanguages: $preferredLanguages) }}',
        variables: { version: '1.5.0', preferredLanguages: ['en'] },
      }),
    }

    $task.fetch(opts).then( response => {

      resolve(response.status === 200)
    }, reason => {
        reject('Error')
        return
    })
  })
}

function timeout(delay = 5000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('Timeout')
    }, delay)
  })
}

function testNf(filmId) {
  return new Promise((resolve, reject) =>{
    let option = {
      url: 'https://www.netflix.com/title/' + filmId,
      opts: opts,
      timeout: 5200,
      headers: {
        'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
      },
    }
    $task.fetch(option).then(response => {
      //$notify("nf:"+response.statusCode)
      console.log("nf:"+response.statusCode)
      if (response.statusCode === 404) {
        result["Netflix"] = "<b>Netflix：</b>支持自制剧集 😞"
        console.log("nf:"+result["Netflix"])
        resolve('Not Found')
        return 
      } else if (response.statusCode === 403) {      
        //console.log("nfnf")
        result["Netflix"] = "<b>Netflix：</b>未支持 🤯"
        console.log("nf:"+result["Netflix"])
        //$notify("nf:"+result["Netflix"])
        resolve('Not Available')
        return
      } else if (response.statusCode === 200) {
        let url = response.headers['X-Originating-URL']
        let region = url.split('/')[3]
        region = region.split('-')[0]
        if (region == 'title') {
          region = 'us'
        }
        console.log("nf:"+region)
        result["Netflix"] = "<b>Netflix：</b>完整支持" + " ➟ ⟦" + flag(region) + "⟧ 🤩"
        //$notify("nf:"+result["Netflix"])
        resolve("nf:"+result["Netflix"])
        return 
      }
    }, reason => {
      result["Netflix"] = "<b>Netflix：</b>检测超时 🧐"
      console.log(result["Netflix"])
      resolve("timeout")
    }
    )
  }
  )
}

function testYTB() { 
    let option = {
      url: "https://www.youtube.com/premium",
      opts: opts,
      timeout: 2800,
      headers: {
        'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'
      },
    }
    $task.fetch(option).then(response=> {
      let data = response.body
      console.log("ytb:"+response.statusCode)
      if (response.statusCode !== 200) {
        //reject('Error')
        result["YouTube"] = "<b>YouTube Premium：</b>检测失败 🤔"
      } else if (data.indexOf('Premium is not available in your country') !== -1) {
          //resolve('Not Available')
        result["YouTube"] = "<b>YouTube Premium：</b>未支持 😢"
      } else if (data.indexOf('Premium is not available in your country') == -1) {//console.log(data.split("countryCode")[1])
      let region = ''
      let re = new RegExp('"GL":"(.*?)"', 'gm')
      let ret = re.exec(data)
      if (ret != null && ret.length === 2) {
        region = ret[1]
      } else if (data.indexOf('www.google.cn') !== -1) {
        region = 'CN'
      } else {
        region = 'US'
      }
      //resolve(region)
      result["YouTube"] = "<b>YouTube Premium：</b>支持 " + " ➟ ⟦" + flag(region) + "⟧ 🥰"
      console.log("ytb:"+region+ result["YouTube"])
      }
    }, reason => {
      result["YouTube"] = "<b>YouTube Premium：</b>检测超时 🤨"
      //resolve("timeout")
    })
}

support_countryCodes=["T1","XX","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ","BS","BD","BB","BE","BZ","BJ","BT","BA","BW","BR","BG","BF","CV","CA","CL","CO","KM","CR","HR","CY","DK","DJ","DM","DO","EC","SV","EE","FJ","FI","FR","GA","GM","GE","DE","GH","GR","GD","GT","GN","GW","GY","HT","HN","HU","IS","IN","ID","IQ","IE","IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG","LV","LB","LS","LR","LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR","MU","MX","MC","MN","ME","MA","MZ","MM","NA","NR","NP","NL","NZ","NI","NE","NG","MK","NO","OM","PK","PW","PA","PG","PE","PH","PL","PT","QA","RO","RW","KN","LC","VC","WS","SM","ST","SN","RS","SC","SL","SG","SK","SI","SB","ZA","ES","LK","SR","SE","CH","TH","TG","TO","TT","TN","TR","TV","UG","AE","US","UY","VU","ZM","BO","BN","CG","CZ","VA","FM","MD","PS","KR","TW","TZ","TL","GB"]

function testChatGPT() {
  return new Promise((resolve, reject) =>{
    let option = {
      url: 'https://chat.openai.com/',
      opts: opts1,
      timeout: 2800,
    }
    $task.fetch(option).then(response=> {
      let resp = JSON.stringify(response)
      console.log("ChatGPT Main Test")
      let jdg = resp.indexOf("text/plain")
      if(jdg == -1) {
      let option1 = {
        url: 'https://chat.openai.com/cdn-cgi/trace',
        opts: opts1,
        timeout: 2800,
      }
      $task.fetch(option1).then(response=> {
        console.log("ChatGPT Region Test")
        let region = response.body.split("loc=")[1].split("\n")[0]
        console.log("ChatGPT Region: "+region)
        let res = support_countryCodes.indexOf(region)
        if (res != -1) {
          result["ChatGPT"] = "<b>ChatGPT：</b>支持 " + " ➟ ⟦" + flag(region) + "⟧ 🎉"
          console.log("支持 ChatGPT")
          resolve("支持 ChatGPT")
          return
        } else {
          result["ChatGPT"] = "<b>ChatGPT: </b>未支持 💔"
          console.log("不支持 ChatGPT")
          resolve("不支持 ChatGPT")
          return
        }
      }, reason => {
        console.log("Check-Error"+reason)
        resolve("ChatGPT failed")
      })
    } else {
      result["ChatGPT"] = "<b>ChatGPT：</b>未支持 💔"
      console.log("不支持 ChatGPT")
      resolve("不支持 ChatGPT")
    }
    }, reason => {
      console.log("ChatGPT-Error"+reason)
      resolve("ChatGPT failed")
    }
    )
    }
    )
    }