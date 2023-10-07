// 如果會員在查找預訂的頁面登出，會被導回首頁
let signout = document.querySelector(".nav__right--user")
signout.addEventListener("click", function(){
    window.location = "/"
})

token_o = window.localStorage.getItem("token")
// console.log(token_o)
if(token_o){
    token = token_o.replace(/"/g,"");
    // console.log(token)
    src = "/api/checkorder"
    fetch(src, {
        headers : {
            "Content-Type" : "application/json; charset=UTF-8",
            "Authorization" : "Bearer " + token,
        }
    }).then((res) => {
            return res.json();
    }).then((data) => {
        // console.log(data)
        orders = data["data"]
        console.log(orders)

        // 如果有過往訂單，把所有單號碼顯示出來，讓用家點擊查看詳情
        const ordersList = document.querySelector(".main__orders")
        if (orders.length != 0){
            for (i=0;i<orders.length;i++){
                const eachOrder = document.createElement("span")
                eachOrder.className = "main__orders span"
                eachOrder.innerText = orders[i]
                eachOrder.onclick = function(){
                    let allOrders = document.querySelectorAll(".main__orders span")
                    allOrders.forEach((order) => {
                        order.classList.remove("active")
                    })
                    this.classList.add("active")
                    getDetails(eachOrder.innerText);
                }
                ordersList.appendChild(eachOrder)
            }
        }
        else{
            const noOrder = document.createElement("div")
            noOrder.innerText = "沒有任何訂單"
            ordersList.appendChild(noOrder)
            const greyLine = document.querySelector("hr")
            greyLine.style.display = "none";
        }
    })
}

// 查找訂單詳情
let getDetails = function(order_detail){
    src = "/api/order/" + order_detail
        fetch(src,{
            headers : {
                "Content-Type" : "application/json; charset=UTF-8",
                "Authorization" : "Bearer " + token,
            }
        }).then((res) => {
            return res.json();
        }).then((data) => {
            displayData(data)
        })
}

// 把取到的資料顯示到頁面上
let displayData = function(data){
    // console.log(data)
    data = data["data"]

    const main__orders__list = document.querySelector(".main__orders__list")
    main__orders__list.innerText = ""

    const main__orders__details = document.createElement("div")
    main__orders__details.className = "main__orders__details"
    main__orders__list.appendChild(main__orders__details)

    // // 聯絡人資料
    // const orderContact = document.createElement("div")
    // orderContact.className = "main__orders__details--contact"
    // main__orders__details.appendChild(orderContact)

    // // 名字
    // const contactName = document.createElement("div");
    // contactName.innerHTML = "<div>聯絡人：<span></span></div>"
    // contactName.className = "titles"
    // contactName.id = "contactName"
    // orderContact.appendChild(contactName);
    // const contactName_span = document.querySelector("#contactName span")
    // contactName_span.className = "content"
    // contactName_span.innerText = data["contact"]["name"]

    // // 電話號碼
    // const contactPhone = document.createElement("div");
    // contactPhone.innerHTML = "<div>電話號碼： <span></span></div>"
    // contactPhone.className = "titles"
    // contactPhone.id = "contactPhone"
    // orderContact.appendChild(contactPhone)
    // const contactPhone_span = document.querySelector("#contactPhone span")
    // contactPhone_span.className = "content"
    // contactPhone_span.innerText = data["contact"]["phone"]

    // // 電郵地址
    // const contactEmail = document.createElement("div");
    // contactEmail.innerHTML = "<div>電郵地址： <span></span></div>"
    // contactEmail.className = "titles"
    // contactEmail.id = "contactEmail"
    // orderContact.appendChild(contactEmail)
    // const contactEmail_span = document.querySelector("#contactEmail span")
    // contactEmail_span.className = "content"
    // contactEmail_span.innerText = data["contact"]["email"]

    // // 全單總價
    // const totalPrice = document.createElement("div")
    // totalPrice.innerHTML = "<div>總費用： <span></span></div>"
    // totalPrice.className = "titles"
    // totalPrice.id = "totalPrice"
    // orderContact.appendChild(totalPrice)
    // const totalPrice_span = document.querySelector("#totalPrice span")
    // totalPrice_span.className = "content"
    // totalPrice_span.innerText = data["total price"]

    // 預訂行程資訊
    const orderTrip = document.createElement("div")
    orderTrip.className = ".main__orders__details--trip"
    main__orders__details.appendChild(orderTrip)

    // 景點内容
    for (x=0;x<data["trip"].length;x++){
        // 所有資料
        const tripContainer = document.createElement("div")
        tripContainer.className = "tripContainer"
        orderTrip.appendChild(tripContainer)
        
        // 圖片
        const tripImage = document.createElement("div")
        // console.log(data["trip"][x]["image"])
        tripImage.style.backgroundImage = 'url(' + data["trip"][x]["image"] + ')'
        tripImage.className = "tripImage"
        tripContainer.appendChild(tripImage)

        // 文字資料
        const tripInfo = document.createElement("div")
        tripInfo.className = "tripInfo"
        tripContainer.appendChild(tripInfo)

        // 名字
        const tripName = document.createElement("div")
        tripName.innerHTML = "<div>景點名稱： </div>"
        tripName.className = "titles"
        tripName.id = "tripName"
        tripInfo.appendChild(tripName)
        const tripName_span = document.createElement("span")
        tripName_span.className = "content"
        tripName_span.innerHTML = data["trip"][x]["name"]
        tripName.appendChild(tripName_span)

        // 地址
        const tripAddress = document.createElement("div")
        tripAddress.innerHTML = "<div>地址： </div>"
        tripAddress.className = "titles"
        tripAddress.id = "tripAddress"
        tripInfo.appendChild(tripAddress)
        const tripAddress_span = document.createElement("span")
        tripAddress_span.className = "content"
        tripAddress_span.innerText = data["trip"][x]["address"]
        tripAddress.appendChild(tripAddress_span)

        // 日期
        const tripDate = document.createElement("div");
        tripDate.innerHTML = "<div>日期： </div>"
        tripDate.className = "titles"
        tripDate.id = "tripDate"
        tripInfo.appendChild(tripDate)
        const tripDate_span = document.createElement("span")
        tripDate_span.className = "content"
        tripDate_span.innerText = data["trip"][x]["date"]
        tripDate.appendChild(tripDate_span)

        // 時間
        const tripTime = document.createElement("div")
        if(data["trip"][x]["time"] == "morning"){
            time = "早上 9 點到下午 4 點"
        }
        else{
            time = "下午 4 點到晚上 9 點"
        }
        tripTime.innerHTML = "<div>時間： </div>"
        tripTime.className = "titles"
        tripTime.id = "tripTime"
        tripInfo.appendChild(tripTime)
        const tripTime_span = document.createElement("span")
        tripTime_span.className = "content"
        tripTime_span.innerText = time
        tripTime.appendChild(tripTime_span)


        // 費用
        const tripPrice = document.createElement("div")
        tripPrice.innerHTML = "<div>費用： <span></span></div>"
        tripPrice.className = "titles"
        tripPrice.id = "tripPrice"
        tripInfo.appendChild(tripPrice)
        const tripPrice_span = document.createElement("span")
        tripPrice_span.className = "content"
        tripPrice_span.innerText = data["trip"][x]["price"]
        tripPrice.appendChild(tripPrice_span)
    }
    

}
