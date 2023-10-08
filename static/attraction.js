let fullLink= window.location.href;
let identifier = "3000/"

let index = fullLink.indexOf(identifier);
let length = identifier.length;

let src = fullLink.slice(index + length);
src = "/api/" + src
// console.log(src)
fetch(src)
    .then((result) => {
        return result.json()
    })
    .then((response) => {
        // console.log(response)
        data = response["data"];

        // console.log(data["name"], data["category"], data["mrt"])

        let totalImgCount = 0;
        for(i=0;i<data["images"].length;i++){
            const display_gallery = document.querySelector(".detail__display--gallery");
            const display_gallery_img = document.createElement("img");
            display_gallery_img.src = data["images"][i];
            display_gallery_img.className = "detail__display--gallery_img";
            display_gallery_img.id = /*"display_gallery_img" + */ [i]
            display_gallery.appendChild(display_gallery_img)
            // console.log(data["images"][i])
            const slider = document.querySelector(".slider");
            const slider_btn_lable = document.createElement("label");
            slider_btn_lable.className = "slider_manual_btn";
            slider.appendChild(slider_btn_lable);
            const slider_btn = document.createElement("input");
            slider_btn.name = "slider_btn";
            slider_btn.id = "slider_btn" + [i];
            slider_btn_lable.appendChild(slider_btn)
            totalImgCount += 1;
            // console.log(display_gallery_img.id)
            // console.log(slider_btn.id)
        }
    
        // slider on left / right arrow click only
        let count = 0
        // console.log(count)
        // const display_gallery_img = document.querySelectorAll(".detail__display--gallery_img");
        let slider_btns = document.querySelectorAll(".slider_manual_btn");
        slider_btns[count].classList.add('active');

        const display_leftClick = document.querySelector(".detail__display--leftClick");
        const display_gallery = document.querySelector(".detail__display--gallery");
        const display_rightClick = document.querySelector(".detail__display--rightClick");
        totalImgCount = totalImgCount - 1;
        display_rightClick.addEventListener("click", function(){
            // console.log("right")
            display_gallery.scrollLeft += display_gallery.offsetWidth;
            count += 1;
            // console.log(count, totalImgCount);
            
            if (count <= totalImgCount){
                slider_btns.forEach((btn) => {
                btn.classList.remove('active');
            })

            slider_btns[count].classList.add('active');
            }
            else{
                count = totalImgCount;
            }
        })

        display_leftClick.addEventListener("click", function(){
            // console.log("left")
            display_gallery.scrollLeft -= display_gallery.offsetWidth;
            count -= 1;
            // console.log(count);
            
            if (count >= 0){
                slider_btns.forEach((btn) => {
                btn.classList.remove('active');
                })
            slider_btns[count].classList.add('active');
            }
            else{
                count = 0
            }
        })

        // datepicker format
        let currentDate = new Date()
        let yyyy = currentDate.getFullYear();
        let mm = currentDate.getMonth()+1;
        mm = String(mm).padStart(2,"0");
        let dd = currentDate.getDate();
        dd = String(dd).padStart(2,"0");
        let today = yyyy + "-" + mm + "-" + dd;
        // console.log(today);
        availableDates = document.querySelector(".booking--form--date input")
        availableDates.setAttribute("min", today)
        // console.log(availableDates)
        availableDates.min = today
        // console.log(availableDates.min)

        // day or night selection and pricing
        let radioSelect = document.querySelectorAll("input[name='dorn']")
        let chosen = document.querySelector(".booking--form--price span span")
        let day = document.querySelector("#day");
        let night = document.querySelector("#night");
        radioSelect.forEach(radioSelect => {
            radioSelect.addEventListener("change", function(){
                selected = document.querySelector("input[name='dorn']:checked").value;
                // console.log(selected);
                if(selected == "d"){
                    day.src="/static/images/radiobtn_selected.svg"
                    night.src="/static/images/radiobtn_not_selected.svg"
                    chosen.innerText="2000"
                }else{
                    day.src="/static/images/radiobtn_not_selected.svg"
                    night.src="/static/images/radiobtn_selected.svg"
                    chosen.innerText="2500"
                }
                
            })
        })

        const profile_title = document.querySelector(".detail__display--profile--title")
        profile_title.innerText = data["name"];

        const profile_short = document.querySelector(".detail__display--profile--short")
        profile_short.innerText = data["mrt"] + " 的 " + data["category"];

        const intro_description = document.querySelector(".detail__intro--description");
        intro_description.innerText = data["description"];

        const location_content = document.querySelector(".detail__intro--location--content");
        location_content.innerText = data["address"];

        const transport_content = document.querySelector(".detail__intro--transport--content");
        transport_content.innerText = data["transport"];
    })

const bookTour = document.querySelector(".booking--confirm");
bookTour.addEventListener("click", function(){
    console.log("this tour ok")
    let token = window.localStorage.getItem("token");
    if(token == null){
        modal.showModal();
    }
    else{
        console.log("logged in");
        let src = "/api/booking"

        let attractionId = (fullLink.slice(fullLink.indexOf("n/")+1)).replace("/","")
        console.log(attractionId)
        let chosenDate = document.querySelector(".booking--form--date input").value;
        if (chosenDate != ""){
            date = chosenDate
            console.log(date)
        }
        else{
            console.log("no date selected")
            const display_profile = document.querySelector(".detail__display--profile--booking");
            const errorMessage = document.createElement("div");
            errorMessage.innerText = "請選擇日期";
            errorMessage.className = "error_message";
            display_profile.appendChild(errorMessage);
            return
        }

        let price = document.querySelector(".booking--form--price span span").innerText
        // console.log(price)
        if (price == 2000){
            time = "morning"
        }
        else{
            time = "afternoon"
        }
        console.log(attractionId, date, time, price)
        fetch (src, {
            method : "POST",
            headers : {
                "Content-Type" : "application/json; charset=UTF-8",
                "Authorization" : "Bearer " + token,
            },
            body:JSON.stringify(
                {
                    "attractionId" : attractionId,
                    "date" : date,
                    "time" : time,
                    "price" : price
                }
            )
        }).then((res) => {
            return res.json();
        }).then((end) => {
            console.log(end);
            if(Object.keys(end) == "ok"){
                window.location = "/booking";
            }
            else{
                const errorMessage = document.querySelector(".error_message")
                errorMessage.innerText = end["message"]
            }
        })
    }
})