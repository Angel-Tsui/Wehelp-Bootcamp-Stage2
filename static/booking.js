// // 如果直接打網址進來，且沒有登錄的狀態，會被導回首頁
// let confirm = function (){
//     let token = window.localStorage.getItem("token")
//     if(token == null){
//         window.location = "/"
//     }
// }

// 如果會員在預定行程的頁面登出，會被導回首頁
let signout = document.querySelector(".nav__right--user")
signout.addEventListener("click", function(){
    window.location = "/"
})

src = "/api/booking";
token_o = window.localStorage.getItem("token")
if(token_o){
    token = token_o.replace(/"/g,"");
    fetch(src, {
        headers : {
            "Content-Type" : "application/json; charset=UTF-8",
            "Authorization" : "Bearer " + token,
        }
    }).then((response) => {
        return response.json();s
    }).then((result) => {
        // console.log(result)
        if (result["data"] != null){
            // console.log("have result")
            let data = result["data"];
            console.log("first", data, Object.keys(data).length)
            const itemContainer = document.querySelector(".itemContainer")
            let totalPrice = 0
            
            // const collectInfo = document.querySelector(".collectInfo")
            // collectInfo.style.display = "block";

            const postLoad_content = document.querySelectorAll(".postLoad_content")
            postLoad_content.forEach((content) => {
                content.style.display = "block"
            })

            for (i=0;i<Object.keys(data).length;i++){
                // console.log(i)
                // console.log(data[i])

                // 如果有預定了的行程，把他顯示在畫面上
                const selectedItem = document.createElement("div");
                selectedItem.id = "item" + data[i]["bookingId"];
                selectedItem.className = "selectedItem";
                itemContainer.appendChild(selectedItem);

                // 圖片
                const selectedItem__img = document.createElement("div");
                selectedItem__img.className = "selectedItem__img";
                selectedItem__img.style.backgroundImage = 'url(' + data[i]["attraction"]["image"] + ')';
                selectedItem.appendChild(selectedItem__img);

                // 資料
                const selectedItem__details = document.createElement("div");
                selectedItem__details.className = "selectedItem__details";
                selectedItem.appendChild(selectedItem__details);

                // 標題
                const itemTitle = document.createElement("div");
                itemTitle.className = "selectedItem__details--title";
                itemTitle.innerHTML = `<div>台北一日遊：</div>`;
                selectedItem__details.appendChild(itemTitle);
                const itemTitleName = document.createElement("span");
                itemTitleName.innerText = data[i]["attraction"]["name"];
                itemTitle.appendChild(itemTitleName);

                // 日期
                const itemDate = document.createElement("div");
                itemDate.className = "selectedItem__details--date";
                itemDate.innerHTML = `<div>日期：</div>`;
                selectedItem__details.appendChild(itemDate);
                const itemDate_span = document.createElement("span");
                itemDate_span.innerText = data[i]["date"];
                itemDate.appendChild(itemDate_span)
                

                // 時間
                // 先處理時間的格式
                if (data[i]["time"] == "morning"){
                    hour = "早上 9 點到下午 4 點"
                }
                else{
                    hour = "下午 4 點到晚上 9 點"
                }
                // 再放到顯示上
                const itemTime = document.createElement("div");
                itemTime.className = "selectedItem__details--time";
                itemTime.innerHTML = `<div>時間：</div>`;
                selectedItem__details.appendChild(itemTime);
                const itemTime_span = document.createElement("span");
                itemTime_span.innerText = hour;
                itemTime.append(itemTime_span)

                // 費用
                const itemPrice = document.createElement("div");
                itemPrice.className = "selectedItem__details--price";
                itemPrice.innerHTML = `<div>費用：</div>`;
                selectedItem__details.appendChild(itemPrice);
                const itemPrice_span = document.createElement("span");
                itemPrice_span.innerText = data[i]["price"]
                itemPrice.append(itemPrice_span)

                // 地點
                const itemLocation = document.createElement("div");
                itemLocation.className = "selectedItem__details--location";
                itemLocation.innerHTML = `<div>地點：</div>`;
                selectedItem__details.appendChild(itemLocation);
                const itemLocation_span = document.createElement("span");
                itemLocation_span.innerText = data[i]["attraction"]["address"]
                itemLocation.append(itemLocation_span)

                // 刪除按鈕 div
                const selectedItemDetail = document.querySelectorAll(".selectedItem__details")
                const selectedDeleteContainer = document.createElement("div");
                selectedDeleteContainer.className = "selectedItem__details--delete";
                selectedDeleteContainer.id = data[i]["bookingId"];
                selectedItemDetail.forEach((item) => {
                    item.appendChild(selectedDeleteContainer);
                })
                
                // 刪除按鈕圖像
                const selectedDetailsDelete = document.createElement("img");
                selectedDetailsDelete.src="/static/images/icon_delete.svg";
                selectedDeleteContainer.appendChild(selectedDetailsDelete);

                totalPrice += parseInt(data[i]["price"])
            }

            // 刪除功能
            const selectedDeleteContainer = document.querySelectorAll(".selectedItem__details--delete")
            selectedDeleteContainer.forEach((del) => {
                del.addEventListener("click", () => {
                    // console.log("delete" + del.id)
                    const deleteItem = document.querySelector("#item" + del.id)
                    console.log(deleteItem)
                    src = "/api/booking/" + del.id;
                    fetch(src, {
                        method : "DELETE",
                        headers : {
                            "Content-Type" : "application/json; charset=UTF-8",
                            "Authorization" : "Bearer " + token,
                        }
                    }).then((output) => {
                        return output.json()
                    }).then((res) => {
                        // console.log(res)
                        if (Object.keys(res) == "ok"){
                            // console.log(deleteItem)
                            window.location.href = "/booking"
                        }
                    })
                })
            })

            // 總價
            const final_price = document.querySelector(".confirm__details--price")
            final_price.innerText = "總價：新台幣 " + totalPrice + " 元"

            // 查看過往訂單連結
            const checkOrder_link = document.querySelector(".checkOrder_link");
            checkOrder_link.addEventListener("click", () => {
                console.log("redirect")
                window.location.href = "/order";
            })

            // 引入TapPay模組
            TPDirect.setupSDK(137125, 'app_B5BgzSOf0kJPgqNtjd9re2fnbwluvIZ17UvDNk7J8XZacKYgBkXWCZjYElYN', 'sandbox')

            // 設置步驟
            // 1. 設定三個 tappay field container
            // 2. 利用 TPDirect.setupSDK 設定參數
            // 3. 使用 TPDirect.card.setup 設定外觀
            // 4. TPDirect.card.onUpdated 取得 TapPay Fields 狀態
            // 5. 利用 TPDirect.card.getPrime 來取得 prime 字串

            // 設定 TapPay 輸入框的格式和功能
            TPDirect.card.setup({
                fields: {
                    number: {
                        element: document.querySelector("#card"),
                        placeholder: "**** **** **** ****"
                    },
                    expirationDate: {
                        element: document.querySelector("#exp"),
                        placeholder: "MM / YY"
                    },
                    ccv: {
                        element: document.querySelector("#ccv"),
                        placeholder: 'ccv'
                    }
                },
                styles: {
                    'input': {
                        'color': 'gray'
                    },
                    // 'input.ccv': {
                    //     'font-size': '16px'
                    // },
                    ':focus': {
                        'color': 'black'
                    },
                    '.valid': {
                        'color': 'green'
                    },
                    '.invalid': {
                        'color': 'red'
                    },
                    '@media screen and (max-width: 400px)': {
                        'input': {
                            'color': 'orange'
                        }
                    }
                },
                // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
                isMaskCreditCardNumber: true,
                maskCreditCardNumberRange: {
                    beginIndex: 0, 
                    endIndex: 11
                }
            })

            // 得知目前卡片資訊的輸入狀態，檢查每個輸入框是否符合規格，如果全部通過，啓動按鈕，讓用家可以submit，進行canGetPrime
            TPDirect.card.onUpdate(function (update) {
                const confirm_payment = document.querySelector(".confirm__details--btn")
                if (update.canGetPrime) {
                    confirm_payment.removeAttribute('disabled');
                } else {
                    confirm_payment.setAttribute('disabled', true);
                }

                // 顯示用家正在使用的信用卡所屬銀行
                // cardTypes = ['visa', 'mastercard','jcb', 'amex', 'unionpay', ...]
                let newType = update.cardType === 'unknown' ? '' : update.cardType
                let cardType = document.querySelector("#cardType")
                cardType.innerText = newType

                // 查看現在的驗證情況
                // console.log(update.canGetPrime, update.cardType, update.status.number, update.status.expiry, update.status.ccv)
            })

            // 取得 TapPay 的 Prime Key
            const confirm_payment = document.querySelector(".confirm__details--btn")
            confirm_payment.addEventListener("click", (e) => {
                e.preventDefault();
            
                // 處理 iOS 系統的鍵盤設定
                forceBlurIos()

                // 取得 TapPay Fields 的 status
                const tappayStatus = TPDirect.card.getTappayFieldsStatus()

                // 確認是否可以 getPrime
                if (tappayStatus.canGetPrime === false) {
                    console.log('cannot get prime')
                    return
                }

                // 如果通過測試，即getPrime，然後傳到後端做處理
                TPDirect.card.getPrime((result) => {
                    if (result.status !== 0) {
                        console.log('get prime error ' + result.msg)
                        return
                    }
                    // console.log('get prime 成功，prime: ' + result.card.prime)

                    
                    // 取得要送到後端的資料
                    src = "/api/orders"
                    
                    let prime = result.card.prime

                    let order = {}
                    // let price = document.querySelector(".confirm__details--price").innerText

                    let user = document.querySelector("#contactName").value
                    let email = document.querySelector("#contactEmail").value
                    let phone = document.querySelector("#contactNumber").value
                    console.log("after", phone)
                    let contact = {
                        "name" : user,
                        "email" : email,
                        "phone" : phone
                    }
                    order["price"] = totalPrice
                    order["contact"] = contact
                    order["trip"] = data
                    console.log(data)

                    // console.log(prime, order)

                    // 把資料傳送到後端
                    fetch(src, {
                        method : "POST",
                        headers : {
                            "Content-Type" : "application/json",
                            "Authorization" : "Bearer " + token
                        },
                        body: JSON.stringify({
                            "prime" : prime,
                            "order" : order
                        })
                    }).then((res) => {
                        return res.json();
                    }).then((result) => {
                        console.log(result)
                        payment_status = result["data"]["payment"]["status"]
                        if (payment_status == 0){
                            number = result["data"]["number"]
                            console.log(number)
                            window.location.href = "/thankyou?number=" + number
                        }
                        else{
                            const failmessage = document.querySelector(".failmessage")
                            failmessage.innerText = result["data"]["payment"]["message"]
                        }
                    })
                    
                })
            })

            // iOS 系統的界面設定
            function forceBlurIos() {
                if (!isIos()) {
                    return
                }
                var input = document.createElement('input')
                input.setAttribute('type', 'text')
                // Insert to active element to ensure scroll lands somewhere relevant
                document.activeElement.prepend(input)
                input.focus()
                input.parentNode.removeChild(input)
            }

            function isIos() {
                return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            }
        }

        // 如果沒有預定了的行程，顯示沒有預定的信息
        else{
            const welcomeMessage = document.querySelector(".welcomeMessage")
            welcomeMessage.style.display = "block"

            const itemContainer = document.querySelector(".itemContainer");
            itemContainer.style.display = "none";

            const content = document.querySelector(".collectInfo");
            content.style.display = "none";

            const nopreview = document.querySelector(".nopreview");
            nopreview.style.display = "block";

            const checkOrder_btn = document.querySelector(".nopreview div");
            checkOrder_btn.addEventListener("click", () => {
                window.location.href = "/order";
            })
        }
    })
}
