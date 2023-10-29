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
    console.log(update.canGetPrime, update.cardType, update.status.number, update.status.expiry, update.status.ccv)
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
        console.log('get prime 成功，prime: ' + result.card.prime)

        
        // 取得要送到後端的資料
        src = "/api/orders"
        
        let prime = result.card.prime

        let order = {}
        let price = document.querySelector(".confirm__details--price").innerText

        let user = document.querySelector("#contactName").value
        let email = document.querySelector("#contactEmail").value
        let phone = document.querySelector("#contactNumber").value
        let contact = {
            "user" : user,
            "email" : email,
            "phone" : phone
        }
        order["price"] = price
        order["contact"] = contact
        
        let trip = {}
        let id = document.querySelectorAll(".selectedItem").id
        id_clean = id.replace("item", "")
        let name = document.querySelectorAll(".selectedItem__details--title span").innerText



        console.log(order)

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
            
        })
        // send prime to your server, to pay with Pay by Prime API .
        // Pay By Prime Docs: https://docs.tappaysdk.com/tutorial/zh/back.html#pay-by-prime-api
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