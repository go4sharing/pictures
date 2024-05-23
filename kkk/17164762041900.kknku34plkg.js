// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2024-04-12
// @description  try to take over the world!
// @author       You
// @match        *
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xn--mes358abvn7na.com
// @grant        none
// ==/UserScript==



const needEmailCode = ['Email verification code cannot be empty', '邮箱验证码不能为空']
const notRegisted = ['邮箱或密码错误']

let Authorization

function saveToken(data) {
    Authorization = data.auth_data
    localStorage.authorization = data.auth_data
}

const el = document.createElement('div')
const style = `width: 400px; position: fixed; top: 0; font-size:10; right: 0; padding: 12px; background: #fff; z-index: 999999;`
el.style = style

document.body.appendChild(el)

el.addEventListener('mouseenter', (e) => { e.target.style = `display: none` })
el.addEventListener('mouseleave', (e) => { e.target.style = style })

let log = (s) => {
    const div = document.createElement('div')
    div.innerHTML = s
    el.appendChild(div)

    console.log(s)
}

async function register(email, password) {
    const data = await fetch("/api/v1/passport/auth/register", {
        // const data = await fetch("https://aoyounetwork.top/api/v1/passport/auth/register", {
        // const data = await fetch("https://sswlc.top/api/v1/passport/auth/register", {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        "body": `email=${email}&password=${password}`,
        "method": "POST",
    }).then(res => res.json())
    if (data.data) {
        log('注册成功');
        saveToken(data.data)

        await getSubscribe()
        await getPlans()

        return
    }

    log(data.message);
    if (needEmailCode.includes(data.message)) {
        await sendEmail(email)
    }
}
async function login(email, password) {
    // const data = await fetch("https://aoyounetwork.top/api/v1/passport/auth/login", {
    // const data = await fetch("https://api.pp.st/api/v1/passport/auth/login", {
    const data = await fetch("/api/v1/passport/auth/login", {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        "body": `email=${encodeURI(email)}&password=${password}`,
        "method": "POST",
    }).then(res => res.json()).catch(_ => ({ data: false }))

    if (data.data) {
        log('登录成功');
        saveToken(data.data)

        await getSubscribe()
        await getPlans()

        return
    }

    log(data.message);
    if (notRegisted.includes(data.message)) {

        await register(email, password)
    }


}
async function sendEmail(email) {
    // const data = await fetch("https://aoyounetwork.top/api/v1/passport/comm/sendEmailVerify", {
    const data = await fetch("/api/v1/passport/comm/sendEmailVerify", {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        "body": `email=${encodeURI(email)}`,
        "method": "POST",
    }).then(res => res.json()).catch(_ => ({ data: false }))

    if (data) {
        log('发送成功');
    }

}

function getPrice(plan) {
    const {
        id,
        name,
        month_price,
        quarter_price,
        half_year_price,
        year_price,
        two_year_price,
        three_year_price,
        onetime_price,
        reset_price,
        transfer_enable,
    } = plan

    if ([
        month_price,
        quarter_price,
        half_year_price,
        year_price,
        two_year_price,
        three_year_price,
        onetime_price,
        reset_price,
    ].includes(0)) {
        log(`免费`);
        const free = document.createElement('h1')
        free.innerHTML = '免费'
        free.style = 'color: green'
        el.appendChild(free)
    }

    const arr = ['套餐' + id + ': ' + name, transfer_enable + 'G']
    if (month_price !== null) {
        arr.push(month_price / 100 + '元/月')
    }
    if (quarter_price !== null) {
        arr.push(quarter_price / 100 + '元/季')
    }
    if (half_year_price !== null) {
        arr.push(half_year_price / 100 + '元/半年')
    }
    if (year_price !== null) {
        arr.push(year_price / 100 + '元/年')
    }
    if (two_year_price !== null) {
        arr.push(two_year_price / 100 + '元/2年')
    }
    if (three_year_price !== null) {
        arr.push(three_year_price / 100 + '元/3年')
    }
    if (reset_price !== null) {
        arr.push(reset_price / 100 + '元/重置')
    }
    if (onetime_price !== null) {
        arr.push(onetime_price / 100 + '元不限时')
    }
    log(arr.join(', '));
}

async function getPlans() {
    // const data = await fetch('https://aoyounetwork.top/api/v1/user/plan/fetch', {
    const data = await fetch('/api/v1/user/plan/fetch', {
        headers: {
            Authorization
        }
    }).then(res => res.json())

    if(!data.data?.length) {
        log('没有套餐');
        return
    }

    data.data.forEach(item => getPrice(item))
}
async function getSubscribe() {
    const { data } = await fetch('/api/v1/user/getSubscribe', {
        // const { data } = await fetch('https://aoyounetwork.top/api/v1/user/getSubscribe', {
        headers: {
            Authorization
        }
    }).then(res => res.json())

    const {
        expired_at,
        plan,
        subscribe_url,
        transfer_enable
    } = data
    if (plan !== null) {
        log(`${plan.name}, ${transfer_enable / 1024 / 1024 / 1024}G流量, ${(expired_at * 1000) > Date.now() ? new Date(expired_at * 1000).toLocaleString() : '已'}过期`);
    }
}

// sendEmail(`8696783@gmail.com`, 'a1234567')
// login('111@qq.com', 'a1234567')
// register('111@qq.com', 'a1234567')
const email = `8696783@gmail.com`
const password = `a1234567`


document.addEventListener('keydown', (e) => {
    console.log(e);
    if (e.keyCode === 82 && e.altKey) {
        login(email, password)
    }
})

window.onload = () => {
    const flag = /v2board|xboard/g.test(document.documentElement.innerHTML)
    if (flag) {
        login(email, password)
    }
}

