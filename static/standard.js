// 共用資源 (Controller)
const body = document.querySelector("body")
const modal = document.createElement("dialog");
modal.className = ".modal";
body.appendChild(modal)

// 打開表單，先到注冊頁面
const signin = document.querySelector(".nav__right--user");
signin.addEventListener("click", function(){
    console.log("clicked", signin.innerText)
    if(signin.innerText == "登入/註冊"){
        modal.showModal();
    }
    // 登出顯示和功能
    else{
        signin.innerText = "登入/註冊"
        window.localStorage.removeItem("token");
        console.log("token removed");
    }
})

// 行程預定按鈕功能
const plan = document.querySelector(".nav__right--plan");
plan.addEventListener("click", function(){
    console.log("plan", signin.innerText)
    let token = window.localStorage.getItem("token");
    if(token == null){
        modal.showModal();
    }
    else{
        console.log("logged in");
        window.location = "/booking";
    }
})

// const bookTour = document.querySelector(".booking--confirm");
// bookTour.addEventListener("click", function(){
//     console.log("this tour ok")
//     let token = window.localStorage.getItem("token");
//     if(token == null){
//         modal.showModal();
//     }
//     else{
//         console.log("logged in");
//         window.location = "/booking";
//     }
// })

// 完整表單畫面製作 (V)
modal.innerHTML=`
                <div class="completeform">
                <div class="bluebar"></div>
                <div class="signupform">
                    <img src="/static/images/icon_close.png" class="icon_close"/>
                    <!-- 注冊表單 -->
                    <div id="formcontent_signup">
                        <div class="signinHeader">注冊會員賬號</div>
                        <form action="/api/user" class="signupformdetail" method="POST">
                            <div><input type="text" id="name" placeholder="輸入姓名" class="signininfo" required></div>
                            <div><input type="email" id="email" placeholder="輸入電子郵件" class="signininfo" required></div>
                            <div><input type="password" id="password" placeholder="輸入密碼" class="signininfo" required></div>
                            <div type="submit" class="submitbtn" id="registerbtn">註冊新帳戶</div>
                            <div class="errormessage"></div>
                            <div class="successmessage"></div>
                            <br/>
                            <div class="switch" id="signinclick">已經有賬戶了？ 點此登入</div>
                        </form>
                    </div>
                    <!-- 登入表單 -->
                    <div id="formcontent_signin">
                        <div class="signinHeader">登入</div>
                        <form action="/api/user/auth" class="signupformdetail" method="PUT">
                            <div><input type="text" id="useremail" placeholder="輸入電子郵件" class="signininfo" required></div>
                            <div><input type="password" id="userpassword" placeholder="輸入密碼" class="signininfo" required></div>
                            <div type="submit" class="submitbtn" id="signinbtn">登入</div>
                            <div class="signinfailmessage"></div>
                            <br/>
                            <div class="switch" id="signupclick">還沒有賬號？ 點此注冊</div>
                        </form>
                    </div>
                </div>
                </div>
            `
// 公用資源
let inputs = document.querySelectorAll(".signininfo");


// 關閉表單
const iconclose = document.querySelector(".icon_close");
let errormessage = document.querySelector(".errormessage");
let successmessage = document.querySelector(".successmessage");
iconclose.addEventListener("click", function(){
    console.log("close")
    modal.close();
    inputs.forEach(input => input.value = "");
    successmessage.innerText = "";
    errormessage.innerText = "";
    signinfailmessage.innerText = "";
})

// 切換表單
const formcontent_signup = document.querySelector("#formcontent_signup")
const formcontent_signin = document.querySelector("#formcontent_signin")
const tosigninclick = document.querySelector("#signinclick");
const tosignupclick = document.querySelector("#signupclick");
tosignupclick.addEventListener("click", function(){
    console.log("switch");
    formcontent_signup.style.display = "block";
    formcontent_signin.style.display = "none";
    inputs.forEach(input => input.value = "");
    let errormessage = document.querySelector(".errormessage");
    let successmessage = document.querySelector(".successmessage");
    successmessage.innerText = "";
    errormessage.innerText = "";
    signinfailmessage.innerText = "";
})

tosigninclick.addEventListener("click", function(){
    console.log("switch");
    formcontent_signup.style.display = "none";
    formcontent_signin.style.display = "block";
})

// 登入按鈕
const signinbtn = document.querySelector("#signinbtn");
signinbtn.addEventListener("click", function(e){
    e.preventDefault();
    signinbe();
    console.log("signin")
})

// 登入功能，與後端接連，取得回應
let signinfailmessage = document.querySelector(".signinfailmessage");
let signinbe = function(){
    let useremail = document.querySelector("#useremail").value
    let userpassword = document.querySelector("#userpassword").value
    // console.log(useremail, userpassword)
    src = "/api/user/auth";
    fetch(src, {
        method : "PUT",
        headers : {
            "Content-Type":"application/json; charset=UTF-8",
        },
        body:JSON.stringify(
            {
                "email" : useremail,
                "password" : userpassword
            }
        )
    }).then((response) => {
        return response.json();
    }).then((data) => {
        // console.log(data)
        if (Object.keys(data) == "token"){
            // console.log("signed in", data["token"]);
            window.localStorage.setItem("token", JSON.stringify(data["token"]));
            modal.close();
            inputs.forEach(input => input.value = "");
            verify();
        }
        else{
            signinfailmessage.innerText = "電子郵件或密碼錯誤，請再確認"
        }
    })
}


// 注冊按鈕
const registerbtn = document.querySelector("#registerbtn");
// let inputs = document.querySelectorAll(".signininfo")
registerbtn.addEventListener("click", function(e){
    e.preventDefault();
    signupbe();
    // modal.close();
    // inputs.forEach(input => input.value = "");
    console.log("reg")
})

// 注冊功能，與後端接連，取得回應
let signupbe = function(){
    let regname = document.querySelector("#name").value;
    let regemail = document.querySelector("#email").value;
    let regpassword = document.querySelector("#password").value;
    let errormessage = document.querySelector(".errormessage");
    let successmessage = document.querySelector(".successmessage");
    if(regname == "" || regemail == "" || regpassword == ""){
        errormessage.innerText = "請填寫資料"
    }
    else{
        if(regemail.includes("@")){
            src = "/api/user";
            fetch(src, {
                method : "POST",
                headers: {
                    "Content-Type":"application/json; charset=UTF-8",
                },
                body:JSON.stringify(
                    {
                        "name" : regname,
                        "email" : regemail,
                        "password" : regpassword
                    }
                )
            }).then((result) => {
                    return result.json();
                }).then((data) => {
                    console.log(data)
                    if (Object.keys(data) == "ok"){
                        successmessage.innerText = "注冊成功，請在下方點擊登入";
                        errormessage.innerText = "";
                    }
                    else{
                        errormessage.innerText = data["message"]
                    }
            })
        }
        else{
            console.log("error email")
            errormessage.innerText = "請輸入正確的電子郵件"
        }
        
    }   
}

// 在每一次網頁載入的時候檢查會員的登入狀態
let verify = function(){
    console.log("verifying")
    token_o = window.localStorage.getItem("token");
    if(token_o){
        token = token_o.replace(/"/g,"");
        // console.log(token)
        // console.log("Bearer " + token);
        src = "/api/user/auth";
        fetch(src, {
            headers : {
                "Content-Type" : "application/json; charset=UTF-8",
                "Authorization" : "Bearer " + token,
            }
        }).then((response) => {
            return response.json();
        }).then((result) => {
            // console.log(result);
            console.log(result["data"]);
            let status = result["data"];
            // console.log(status)

            // booking頁面的welcome message處理
            if(window.location.href.includes("/booking") ){
                const welcomeName = document.querySelector(".welcomeMessage span");
                welcomeName.innerText = result["data"]["name"];

                // 自動填入 Contact Name 和 Contact Email 的内容
                const contactName = document.querySelector("#contactName")
                contactName.value = result["data"]["name"]

                // 自動填入 Contact Name 和 Contact Email 的内容
                const contactEmail = document.querySelector("#contactEmail")
                contactEmail.value = result["data"]["email"]
            }
            
            const signin = document.querySelector(".nav__right--user");
            if(status == null){ 
                signin.innerText = "登入/註冊";
            }
            else{
                signin.innerText = "登出系統";
            }
        })
    }
}