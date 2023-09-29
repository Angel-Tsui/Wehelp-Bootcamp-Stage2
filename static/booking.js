// 如果直接打網址進來，且沒有登錄的狀態，會被導回首頁
let confirm = function (){
    let token = window.localStorage.getItem("token")
    if(token == null){
        window.location = "/"
    }
}

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
        console.log(result)
        if (result["data"] != null){
            console.log("have result")
            let data = result["data"];
            console.log(data, Object.keys(data).length)
            const itemContainer = document.querySelector(".itemContainer")
            let totalPrice = 0
            
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
                selectedDetailsDelete.src="/static/images/delete.png";
                selectedDeleteContainer.appendChild(selectedDetailsDelete);

                totalPrice += parseInt(data[i]["price"])
            }

            // 刪除功能
            const selectedDeleteContainer = document.querySelectorAll(".selectedItem__details--delete")
            selectedDeleteContainer.forEach((del) => {
                del.addEventListener("click", () => {
                    console.log("delete" + del.id)
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
                        console.log(res)
                        if (Object.keys(res) == "ok"){
                            console.log(deleteItem)
                            window.location.href = "/booking"
                        }
                    })
                })
            })

            // 總價
            const final_price = document.querySelector(".confirm__details--price")
            final_price.innerText = "總價：新台幣 " + totalPrice + " 元"
        }

        // 如果沒有預定了的行程，顯示沒有預定的信息
        else{
            const itemContainer = document.querySelector(".itemContainer");
            itemContainer.style.display = "none";

            const content = document.querySelector(".collectInfo");
            content.style.display = "none";

            const nopreview = document.querySelector(".nopreview");
            nopreview.style.display = "block";
        }
    })
}
